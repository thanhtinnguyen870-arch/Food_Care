import Food from '../models/Food.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';

const isValidRating = (rating) => {
  const numericRating = Number(rating);
  return Number.isInteger(numericRating) && numericRating >= 1 && numericRating <= 5;
};

// @desc    Fetch all foods
// @route   GET /api/foods
// @access  Public
export const getFoods = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};
    
    // Thêm các filter khác nếu cần (ví dụ: tag sức khỏe, max price)
    const filters = { ...keyword, ...category, isAvailable: true };
    
    const foods = await Food.find(filters).populate('category', 'name slug');
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single food by ID
// @route   GET /api/foods/:id
// @access  Public
export const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate('category', 'name slug');

    if (food) {
      res.json(food);
    } else {
      res.status(404).json({ message: 'Food not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single food by slug
// @route   GET /api/foods/slug/:slug
// @access  Public
export const getFoodBySlug = async (req, res) => {
  try {
    const food = await Food.findOne({ slug: req.params.slug }).populate('category', 'name slug');

    if (food) {
      res.json(food);
    } else {
      res.status(404).json({ message: 'Food not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/foods/:id/reviews
// @access  Private
export const createFoodReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const food = await Food.findById(req.params.id);

    if (food) {
      if (!isValidRating(rating)) {
        return res.status(400).json({ message: 'Danh gia phai la so nguyen tu 1 den 5.' });
      }

      // KIỂM TRA ĐÃ MUA VÀ HOÀN THÀNH ĐƠN CHƯA
      const completedOrders = await Order.countDocuments({
        user: req.user._id,
        orderStatus: 'completed',
        'items.food': food._id
      });

      if (completedOrders === 0) {
        return res.status(400).json({ message: 'Bạn cần đặt mua và nhận món ăn này (Đơn hàng hoàn thành) trước khi đánh giá!' });
      }

      const userReviews = await Review.countDocuments({
        food: req.params.id,
        user: req.user._id,
      });

      if (userReviews >= completedOrders) {
        return res.status(400).json({ message: 'Bạn đã sử dụng hết lượt đánh giá cho món này. Hãy mua thêm để tiếp tục đánh giá nhé!' });
      }

      const review = await Review.create({
        name: req.user.name,
        rating: Number(rating),
        comment: comment || '',
        food: food._id,
        user: req.user._id,
      });

      // Tạo thông báo cho admin
      const notification = await Notification.create({
        type: 'REVIEW',
        message: `Khách hàng ${req.user.name} đã đánh giá ${Number(rating)} sao cho món "${food.name}".`,
        food: food._id,
        user: req.user._id,
      });

      const io = req.app.get('io');
      if (io) {
        await notification.populate('user', 'name');
        io.emit('newNotification', notification);
      }

      const allReviews = await Review.find({ food: food._id });
      food.ratingCount = allReviews.length;
      food.ratingAverage =
        allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

      const updatedFood = await food.save();
      if (io) io.emit('foodUpdated', updatedFood);
      res.status(201).json({ message: 'Đã thêm đánh giá thành công', reviewId: review._id });
    } else {
      res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user's own food review
// @route   PUT /api/foods/:id/reviews/:reviewId
// @access  Private
export const updateFoodReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền chỉnh sửa đánh giá này' });
    }

    if (review.food.toString() !== req.params.id) {
      return res.status(400).json({ message: 'Danh gia khong thuoc mon an nay.' });
    }

    if (rating !== undefined && !isValidRating(rating)) {
      return res.status(400).json({ message: 'Danh gia phai la so nguyen tu 1 den 5.' });
    }

    if (rating !== undefined) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment;

    await review.save();

    const allReviews = await Review.find({ food: req.params.id });
    const food = await Food.findById(req.params.id);
    if (food) {
      food.ratingCount = allReviews.length;
      food.ratingAverage = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
      await food.save();
      const io = req.app.get('io');
      if (io) io.emit('foodUpdated', food);
    }

    res.json({ message: 'Đã cập nhật đánh giá', reviewId: review._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if user can review
// @route   GET /api/foods/:id/can-review
// @access  Private
export const checkCanReview = async (req, res) => {
  try {
    const completedOrders = await Order.countDocuments({
      user: req.user._id,
      orderStatus: 'completed',
      'items.food': req.params.id
    });
    
    if (completedOrders === 0) {
      return res.json({ canReview: false, message: 'Bạn cần đặt mua và hoàn thành đơn hàng mới có thể đánh giá món ăn này.' });
    }

    const userReviews = await Review.countDocuments({
      food: req.params.id,
      user: req.user._id,
    });

    if (userReviews >= completedOrders) {
      return res.json({ canReview: false, message: 'Bạn đã sử dụng hết lượt đánh giá. Hãy mua thêm để tiếp tục đánh giá nhé!' });
    }

    res.json({ canReview: true, message: '' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get food reviews
// @route   GET /api/foods/:id/reviews
// @access  Public
export const getFoodReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ food: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin reply to review
// @route   PUT /api/foods/:id/reviews/:reviewId/reply
// @access  Private/Admin
export const replyFoodReview = async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (review) {
      if (review.food.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Danh gia khong thuoc mon an nay.' });
      }

      review.adminReply = reply;
      const updatedReview = await review.save();
      
      const io = req.app.get('io');
      if (io) io.emit('reviewReplied', updatedReview);

      res.json(updatedReview);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- ADMIN ROUTES ---

// @desc    Create a food
// @route   POST /api/foods
// @access  Private/Admin
export const createFood = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      images,
      category,
      ingredients,
      nutrition,
      healthTags,
      suitableFor,
      warningFor,
      isAvailable,
      isVegetarian,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Ten mon an va danh muc la bat buoc.' });
    }

    const slugBase = name
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'mon-an';

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: 'Gia mon an phai lon hon 0.' });
    }

    const food = new Food({
      name,
      slug: `${slugBase}-${Date.now()}`,
      price: numericPrice,
      description: description || 'Dang cap nhat mo ta mon an.',
      category,
      images: images?.length ? images : ['https://via.placeholder.com/500'],
      ingredients: ingredients || [],
      suitableFor: suitableFor || [],
      healthTags: healthTags || [],
      nutrition: nutrition || {},
      warningFor: warningFor || [],
      isAvailable: isAvailable ?? true,
      isVegetarian: isVegetarian ?? false,
    });

    const createdFood = await food.save();
    const io = req.app.get('io');
    if (io) io.emit('foodAdded', createdFood);
    res.status(201).json(createdFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a food
// @route   PUT /api/foods/:id
// @access  Private/Admin
export const updateFood = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      images,
      category,
      ingredients,
      nutrition,
      healthTags,
      suitableFor,
      warningFor,
      isAvailable,
      isVegetarian,
    } = req.body;
    const food = await Food.findById(req.params.id);

    if (food) {
      if (price !== undefined) {
        const numericPrice = Number(price);
        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
          return res.status(400).json({ message: 'Gia mon an phai lon hon 0.' });
        }
        food.price = numericPrice;
      }

      food.name = name ?? food.name;
      food.description = description ?? food.description;
      food.images = images ?? food.images;
      food.category = category ?? food.category;
      food.ingredients = ingredients ?? food.ingredients;
      food.nutrition = nutrition ?? food.nutrition;
      food.healthTags = healthTags ?? food.healthTags;
      food.suitableFor = suitableFor ?? food.suitableFor;
      food.warningFor = warningFor ?? food.warningFor;
      food.isAvailable = isAvailable ?? food.isAvailable;
      food.isVegetarian = isVegetarian ?? food.isVegetarian;

      const updatedFood = await food.save();
      const io = req.app.get('io');
      if (io) io.emit('foodUpdated', updatedFood);
      res.json(updatedFood);
    } else {
      res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a food
// @route   DELETE /api/foods/:id
// @access  Private/Admin
export const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (food) {
      food.isAvailable = false;
      const updatedFood = await food.save();
      const io = req.app.get('io');
      if (io) io.emit('foodUpdated', updatedFood);
      res.json({ message: 'Da an mon an khoi thuc don', food: updatedFood });
    } else {
      res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
