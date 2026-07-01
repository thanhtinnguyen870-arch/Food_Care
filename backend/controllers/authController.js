import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  '477830917581-35397qfespe98je3et5ns79dnrr7fb4i.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const getBodyValue = (body, key, fallback) =>
  Object.prototype.hasOwnProperty.call(body, key) ? body[key] : fallback;

export const loginWithGoogle = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Không nhận được thông tin đăng nhập Google.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      return res.status(401).json({ message: 'Tài khoản Google chưa được xác minh.' });
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      user = await User.create({
        name: payload.name || email.split('@')[0],
        email,
        password: await bcrypt.hash(randomUUID(), salt),
        googleId: payload.sub,
        avatar: payload.picture,
      });
    } else {
      if (user.isBlocked) {
        return res.status(401).json({ message: 'Tài khoản của bạn đã bị khóa.' });
      }

      if (user.googleId && user.googleId !== payload.sub) {
        return res.status(401).json({ message: 'Tài khoản Google không khớp với người dùng này.' });
      }

      user.googleId = payload.sub;
      if (payload.picture && !user.avatar) {
        user.avatar = payload.picture;
      }
      await user.save();
    }

    const token = generateToken(res, user._id);
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      healthProfile: user.healthProfile,
      totalSpent: user.totalSpent,
      tier: user.tier,
      token,
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(401).json({ message: 'Đăng nhập Google không thành công.' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const { phone, address } = req.body;

    if (!name || !email || password.length < 6) {
      return res.status(400).json({
        message: 'Vui long nhap ho ten, email va mat khau toi thieu 6 ky tu.',
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
    });

    if (user) {
      const token = generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        healthProfile: user.healthProfile,
        totalSpent: user.totalSpent,
        tier: user.tier,
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.isBlocked) {
        return res.status(401).json({ message: 'User is blocked' });
      }

      const token = generateToken(res, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        healthProfile: user.healthProfile,
        totalSpent: user.totalSpent,
        tier: user.tier,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('favoriteFoods');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = getBodyValue(req.body, 'name', user.name);
      user.phone = getBodyValue(req.body, 'phone', user.phone);
      user.address = getBodyValue(req.body, 'address', user.address);
      user.avatar = getBodyValue(req.body, 'avatar', user.avatar);

      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        healthProfile: updatedUser.healthProfile,
        totalSpent: updatedUser.totalSpent,
        tier: updatedUser.tier,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Đã thay đổi mật khẩu thành công.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get favorite foods
// @route   GET /api/auth/favorites
// @access  Private
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favoriteFoods');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.favoriteFoods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add favorite food
// @route   POST /api/auth/favorites/:foodId
// @access  Private
export const addFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const foodId = req.params.foodId;
    const index = user.favoriteFoods.findIndex((id) => id.toString() === foodId);

    // 3. Kiểm tra trạng thái món ăn trong danh sách yêu thích
    if (index !== -1) {
      // 3.2. Món ăn đã tồn tại trong danh sách, hiển thị thông báo và kết thúc
      return res.status(400).json({ message: 'Món ăn đã tồn tại trong danh sách yêu thích', isFavorited: true });
    }

    // 4. Thêm món ăn vào danh sách yêu thích
    user.favoriteFoods.push(foodId);
    await user.save();
    
    // 5. Thông báo thêm thành công
    res.json({ message: 'Thêm vào danh sách yêu thích thành công', isFavorited: true, favoriteFoods: user.favoriteFoods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove favorite food
// @route   DELETE /api/auth/favorites/:foodId
// @access  Private
export const removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const foodId = req.params.foodId;
    const index = user.favoriteFoods.findIndex((id) => id.toString() === foodId);

    if (index !== -1) {
      user.favoriteFoods.splice(index, 1);
      await user.save();
    }

    res.json({ message: 'Đã xóa khỏi danh sách yêu thích', isFavorited: false, favoriteFoods: user.favoriteFoods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user health profile
// @route   PUT /api/auth/health-profile
// @access  Private
export const updateHealthProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.healthProfile = {
        age: getBodyValue(req.body, 'age', user.healthProfile?.age),
        gender: getBodyValue(req.body, 'gender', user.healthProfile?.gender),
        height: getBodyValue(req.body, 'height', user.healthProfile?.height),
        weight: getBodyValue(req.body, 'weight', user.healthProfile?.weight),
        conditions: getBodyValue(req.body, 'conditions', user.healthProfile?.conditions),
        allergies: getBodyValue(req.body, 'allergies', user.healthProfile?.allergies),
        goal: getBodyValue(req.body, 'goal', user.healthProfile?.goal),
        dietType: getBodyValue(req.body, 'dietType', user.healthProfile?.dietType),
        activityLevel: getBodyValue(req.body, 'activityLevel', user.healthProfile?.activityLevel),
      };

      const updatedUser = await user.save();
      res.json(updatedUser.healthProfile);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
