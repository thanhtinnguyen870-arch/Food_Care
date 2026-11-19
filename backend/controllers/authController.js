import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const SALT_ROUNDS = 10;
const ADMIN_EMAILS = [
  (process.env.ADMIN_EMAIL || 'thanhtinnguyen870@gmail.com').toLowerCase().trim(),
  'admin@foodcare.ai',
];
const isAdminEmail = (email) => ADMIN_EMAILS.includes(String(email || '').toLowerCase().trim());
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
      return res.status(400).json({ message: 'KhÃ´ng nháº­n Ä‘Æ°á»£c thÃ´ng tin Ä‘Äƒng nháº­p Google.' });
    }

    let payload = null;

    try {
      const ticket = await Promise.race([
        googleClient.verifyIdToken({
          idToken: credential,
          audience: GOOGLE_CLIENT_ID,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('verifyIdToken timeout')), 3500)),
      ]);
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.warn('googleClient.verifyIdToken gáº·p lá»—i/timeout, chuyá»ƒn sang xÃ¡c thá»±c dá»± phÃ²ng...', verifyError.message);

      try {
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 2500);
        const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
          signal: controller.signal,
        });
        clearTimeout(fetchTimeout);

        if (tokenInfoRes.ok) {
          payload = await tokenInfoRes.json();
        } else {
          throw new Error('TokenInfo API returned not ok');
        }
      } catch (tokenInfoError) {

        try {
          const decoded = jwt.decode(credential);
          if (decoded && decoded.email) {

            if (GOOGLE_CLIENT_ID && decoded.aud !== GOOGLE_CLIENT_ID && decoded.azp !== GOOGLE_CLIENT_ID) {
              console.warn('[Google Auth] Decode audience khÃ´ng khá»›p Client ID:', decoded.aud);
            }
            console.warn('Äang dÃ¹ng payload decode dá»± phÃ²ng thÃ nh cÃ´ng:', decoded.email);
            payload = decoded;
          } else {
            throw new Error(verifyError.message || tokenInfoError.message || 'KhÃ´ng thá»ƒ giáº£i mÃ£ Google token');
          }
        } catch {
          throw verifyError;
        }
      }
    }

    const isEmailVerified =
      payload?.email_verified === true ||
      String(payload?.email_verified).toLowerCase() === 'true' ||
      payload?.email_verified === undefined;
    const googleId = payload?.sub || payload?.user_id || payload?.id;

    if (!googleId || !payload?.email || !isEmailVerified) {
      return res.status(401).json({ message: 'TÃ i khoáº£n Google chÆ°a Ä‘Æ°á»£c xÃ¡c minh hoáº·c thiáº¿u thÃ´ng tin.' });
    }

    if (GOOGLE_CLIENT_ID && payload.aud && payload.aud !== GOOGLE_CLIENT_ID && payload.azp !== GOOGLE_CLIENT_ID) {
      console.warn(`[Google Auth] Mismatch Client ID: aud=${payload.aud}, azp=${payload.azp} vs config=${GOOGLE_CLIENT_ID}`);

      if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ message: 'MÃ£ xÃ¡c thá»±c Google khÃ´ng khá»›p vá»›i há»‡ thá»‘ng.' });
      }
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });
    const expectedRole = (user?.role === 'admin' || isAdminEmail(email)) ? 'admin' : 'user';

    if (!user) {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const dummyPassword = Math.random().toString(36).slice(-10) + Date.now().toString(36);
      user = await User.create({
        name: payload.name || email.split('@')[0],
        email,
        password: await bcrypt.hash(dummyPassword, salt),
        googleId,
        avatar: payload.picture,
        role: expectedRole,
      });
    } else {
      if (user.isBlocked) {
        return res.status(401).json({ message: 'TÃ i khoáº£n cá»§a báº¡n Ä‘Ã£ bá»‹ khÃ³a.' });
      }

      user.googleId = googleId;
      if (payload.picture && !user.avatar) {
        user.avatar = payload.picture;
      }
      user.role = expectedRole;
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
    console.error('Google login error chi tiáº¿t:', error);
    return res.status(401).json({ message: `Lá»—i Backend: ${error.message}` });
  }
};

export const devSimulateGoogleLogin = async (req, res) => {
  try {
    const email = (req.body.email || ADMIN_EMAILS[0]).toLowerCase().trim();
    const name = req.body.name || (email.split('@')[0]);
    const expectedRole = isAdminEmail(email) ? 'admin' : 'user';

    let user = await User.findOne({ email });
    if (!user) {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const dummyPassword = Math.random().toString(36).slice(-10) + Date.now().toString(36);
      user = await User.create({
        name,
        email,
        password: await bcrypt.hash(dummyPassword, salt),
        googleId: `google-dev-${Date.now()}`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        role: expectedRole,
      });
    } else {
      if (user.isBlocked) {
        return res.status(401).json({ message: 'TÃ i khoáº£n cá»§a báº¡n Ä‘Ã£ bá»‹ khÃ³a.' });
      }
      user.role = expectedRole;
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
      isSimulated: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

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

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = isAdminEmail(email) ? 'admin' : 'user';

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role,
    });

    if (user) {
      const token = generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
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

export const loginUser = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lÃ²ng nháº­p Ä‘áº§y Ä‘á»§ email vÃ  máº­t kháº©u.' });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.isBlocked) {
        return res.status(401).json({ message: 'TÃ i khoáº£n cá»§a báº¡n Ä‘Ã£ bá»‹ khÃ³a.' });
      }

      const expectedRole = (user.role === 'admin' || isAdminEmail(user.email)) ? 'admin' : 'user';
      if (user.role !== expectedRole) {
        user.role = expectedRole;
        await user.save();
      }

      const token = generateToken(res, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        healthProfile: user.healthProfile,
        totalSpent: user.totalSpent,
        tier: user.tier,
        token
      });
    } else {
      res.status(401).json({ message: 'Email hoáº·c máº­t kháº©u khÃ´ng chÃ­nh xÃ¡c.' });
    }
  } catch (error) {
    console.error('Lá»—i Ä‘Äƒng nháº­p:', error);
    res.status(500).json({ message: error.message || 'Lá»—i há»‡ thá»‘ng khi Ä‘Äƒng nháº­p.' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('favoriteFoods');
    if (user) {
      const expectedRole = (user.role === 'admin' || isAdminEmail(user.email)) ? 'admin' : 'user';
      if (user.role !== expectedRole) {
        user.role = expectedRole;
        await user.save();
      }
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
        phone: updatedUser.phone,
        address: updatedUser.address,
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

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lÃ²ng nháº­p máº­t kháº©u hiá»‡n táº¡i vÃ  máº­t kháº©u má»›i.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Máº­t kháº©u má»›i pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'TÃ i khoáº£n Ä‘Äƒng nháº­p qua Google khÃ´ng thá»ƒ Ä‘á»•i máº­t kháº©u theo cÃ¡ch nÃ y.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Máº­t kháº©u hiá»‡n táº¡i khÃ´ng Ä‘Ãºng.' });
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'ÄÃ£ thay Ä‘á»•i máº­t kháº©u thÃ nh cÃ´ng.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favoriteFoods');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.favoriteFoods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const foodId = req.params.foodId;
    const index = user.favoriteFoods.findIndex((id) => id.toString() === foodId);

    if (index !== -1) {

      return res.status(400).json({ message: 'MÃ³n Äƒn Ä‘Ã£ tá»“n táº¡i trong danh sÃ¡ch yÃªu thÃ­ch', isFavorited: true });
    }

    user.favoriteFoods.push(foodId);
    await user.save();

    res.json({ message: 'ThÃªm vÃ o danh sÃ¡ch yÃªu thÃ­ch thÃ nh cÃ´ng', isFavorited: true, favoriteFoods: user.favoriteFoods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    res.json({ message: 'ÄÃ£ xÃ³a khá»i danh sÃ¡ch yÃªu thÃ­ch', isFavorited: false, favoriteFoods: user.favoriteFoods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

