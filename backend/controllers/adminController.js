import Order from '../models/Order.js';
import User from '../models/User.js';
import Food from '../models/Food.js';
import Notification from '../models/Notification.js';

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'shipping',
  'completed',
  'cancelled',
];

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalFoods = await Food.countDocuments();
    
    // Revenue only includes payments that were actually confirmed.
    const orders = await Order.find({
      paymentStatus: 'paid',
      orderStatus: { $ne: 'cancelled' },
    });
    const totalRevenue = orders.reduce((acc, item) => acc + item.totalAmount, 0);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    res.json({
      totalOrders,
      totalUsers,
      totalFoods,
      totalRevenue,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    if (!ORDER_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ message: 'Trang thai don hang khong hop le.' });
    }

    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.orderStatus === 'cancelled') {
        return res.status(400).json({ message: 'Đơn hàng đã hủy và không thể chỉnh sửa.' });
      }

      const oldStatus = order.orderStatus;
      order.orderStatus = req.body.status;
      
      if (req.body.status === 'completed' && oldStatus !== 'completed') {
        order.paymentStatus = 'paid';
        
        // Cập nhật tổng chi tiêu và thăng hạng
        const user = await User.findById(order.user);
        if (user) {
          user.totalSpent = (user.totalSpent || 0) + order.totalAmount;
          if (user.totalSpent >= 20000000) {
            user.tier = 'Kim Cương';
          } else if (user.totalSpent >= 5000000) {
            user.tier = 'Vàng';
          } else {
            user.tier = 'Thành viên';
          }
          await user.save();
        }
      } else if (oldStatus === 'completed' && req.body.status && req.body.status !== 'completed') {
        // Giảm trừ tổng chi tiêu nếu hủy bỏ trạng thái completed
        const user = await User.findById(order.user);
        if (user) {
          user.totalSpent = Math.max(0, (user.totalSpent || 0) - order.totalAmount);
          if (user.totalSpent >= 20000000) {
            user.tier = 'Kim Cương';
          } else if (user.totalSpent >= 5000000) {
            user.tier = 'Vàng';
          } else {
            user.tier = 'Thành viên';
          }
          await user.save();
        }
      }
      
      const updatedOrder = await order.save();
      
      const io = req.app.get('io');
      if (io) io.emit('orderUpdated', updatedOrder);

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Promote a customer account to admin
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    if (req.user.email !== 'thanhtinnguyen870@gmail.com') {
      return res.status(403).json({ message: 'Chỉ Super Admin mới có quyền phân quyền.' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    if (user.email === 'thanhtinnguyen870@gmail.com') {
      return res.status(400).json({ message: 'Không thể thao tác trên tài khoản Super Admin.' });
    }

    user.role = req.body.role === 'admin' ? 'admin' : user.role;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Block or unblock a customer account
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
export const updateUserBlockStatus = async (req, res) => {
  try {
    if (req.user.email !== 'thanhtinnguyen870@gmail.com') {
      return res.status(403).json({ message: 'Chỉ Super Admin mới có quyền khóa/mở khóa tài khoản.' });
    }

    if (typeof req.body.isBlocked !== 'boolean') {
      return res.status(400).json({ message: 'Trang thai khoa tai khoan khong hop le.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Khong tim thay tai khoan.' });
    }

    if (user.email === 'thanhtinnguyen870@gmail.com') {
      return res.status(400).json({ message: 'Không thể khóa tài khoản Super Admin.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Khong the khoa tai khoan admin.' });
    }

    user.isBlocked = req.body.isBlocked;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      tier: updatedUser.tier,
      totalSpent: updatedUser.totalSpent,
      isBlocked: updatedUser.isBlocked,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user info (name, phone, address) by admin
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUserInfo = async (req, res) => {
  try {
    if (req.user.email !== 'thanhtinnguyen870@gmail.com') {
      return res.status(403).json({ message: 'Chỉ Super Admin mới có quyền sửa thông tin tài khoản.' });
    }

    const { name, phone, address } = req.body;

    // 6. Kiểm tra tính hợp lệ của dữ liệu
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ message: 'Tên người dùng phải có ít nhất 2 ký tự.' });
    }

    if (phone && !/^[0-9]{10,11}$/.test(String(phone).trim())) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ (10-11 số).' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    }

    if (user.email === 'thanhtinnguyen870@gmail.com') {
      return res.status(400).json({ message: 'Không thể chỉnh sửa tài khoản Super Admin.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Không thể chỉnh sửa tài khoản admin khác.' });
    }

    // 7. Lưu thay đổi vào cơ sở dữ liệu
    user.name = String(name).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (address !== undefined) user.address = String(address).trim();

    const updatedUser = await user.save();

    // 8. Thông báo cập nhật thành công
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role,
      tier: updatedUser.tier,
      totalSpent: updatedUser.totalSpent,
      isBlocked: updatedUser.isBlocked,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all foods for admin, including unavailable items
// @route   GET /api/admin/foods
// @access  Private/Admin
export const getAdminFoods = async (req, res) => {
  try {
    const foods = await Food.find({}).populate('category', 'name slug').sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all notifications for admin
// @route   GET /api/admin/notifications
// @access  Private/Admin
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ type: 'REVIEW' }).populate('user', 'name').sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/admin/notifications/:id/read
// @access  Private/Admin
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      notification.isRead = true;
      const updatedNotification = await notification.save();
      
      const io = req.app.get('io');
      if (io) io.emit('notificationRead', updatedNotification._id);

      res.json(updatedNotification);
    } else {
      res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
