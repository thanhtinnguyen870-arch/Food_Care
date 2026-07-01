import Category from '../models/Category.js';

const createSlug = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description, image, icon, color } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
    }

    const baseSlug = createSlug(name) || `danh-muc-${Date.now()}`;
    const exists = await Category.findOne({ slug: baseSlug });

    const category = await Category.create({
      name: name.trim(),
      slug: exists ? `${baseSlug}-${Date.now()}` : baseSlug,
      description,
      image,
      icon,
      color,
    });

    const io = req.app.get('io');
    if (io) io.emit('categoryAdded', category);

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
