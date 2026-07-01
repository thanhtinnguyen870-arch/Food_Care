import Order from '../models/Order.js';
import Food from '../models/Food.js';
import sendOrderConfirmationEmail from '../utils/sendEmail.js';

const allowedPaymentMethods = new Set(['COD', 'BANK', 'MOMO']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  try {
    const { items, shippingAddress, phone, paymentMethod, totalAmount, note, email } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email nhận thông báo' });
    }

    if (!emailPattern.test(String(email).trim())) {
      return res.status(400).json({ message: 'Email nhan thong bao khong hop le' });
    }

    if (!String(shippingAddress || '').trim() || !String(phone || '').trim()) {
      return res.status(400).json({ message: 'Dia chi giao hang va so dien thoai la bat buoc' });
    }

    if (paymentMethod && !allowedPaymentMethods.has(paymentMethod)) {
      return res.status(400).json({ message: 'Phuong thuc thanh toan khong hop le' });
    }

    const foodIds = items.map((item) => item.food);
    const foods = await Food.find({ _id: { $in: foodIds }, isAvailable: true }).select('name price images');
    const foodById = new Map(foods.map((food) => [food._id.toString(), food]));

    const normalizedItems = items.map((item) => {
      const food = foodById.get(item.food?.toString());
      const quantity = Number(item.quantity);

      if (!food || !Number.isInteger(quantity) || quantity <= 0) {
        return null;
      }

      return {
        food: food._id,
        name: food.name,
        price: food.price,
        quantity,
        image: food.images?.[0],
      };
    });

    if (normalizedItems.some((item) => item === null)) {
      return res.status(400).json({ message: 'Invalid order items' });
    }

    const calculatedTotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    let discount = 0;
    if (req.user.tier === 'Kim Cương') discount = 0.1;
    else if (req.user.tier === 'Vàng') discount = 0.05;
    
    const expectedTotal = calculatedTotal * (1 - discount);
    const submittedTotal = Number(totalAmount);

    if (!Number.isFinite(submittedTotal) || Math.abs(submittedTotal - expectedTotal) > 1) {
      return res.status(400).json({ message: 'Order total is invalid' });
    }

    const recipientEmail = String(email).trim().toLowerCase();
    const order = new Order({
      user: req.user._id,
      items: normalizedItems,
      shippingAddress: String(shippingAddress).trim(),
      phone: String(phone).trim(),
      email: recipientEmail,
      paymentMethod: paymentMethod || 'COD',
      totalAmount: submittedTotal,
      note,
    });

    const createdOrder = await order.save();

    const io = req.app.get('io');
    if (io) {
      await createdOrder.populate('user', 'id name');
      io.emit('newOrder', createdOrder);
    }
    
    // The order remains successful even if the email provider is temporarily unavailable.
    const emailNotificationSent = await sendOrderConfirmationEmail(createdOrder, recipientEmail);

    res.status(201).json({
      ...createdOrder.toObject(),
      emailNotificationSent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.user.toString() !== req.user._id.toString()) {
         return res.status(401).json({ message: 'Not authorized' });
      }
      if (order.orderStatus !== 'pending') {
         return res.status(400).json({ message: 'Can only cancel pending orders' });
      }
      order.orderStatus = 'cancelled';
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
