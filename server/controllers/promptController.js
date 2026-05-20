const Prompt = require('../models/Prompt');

// GET /api/prompts
exports.getPrompts = async (req, res) => {
  try {
    const { search, category, type, tags, page = 1, limit = 12 } = req.query;

    const query = {};

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } },
        { category: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (tags) {
      const tagArr = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      if (tagArr.length) {
        query.tags = { $in: tagArr };
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [total, prompts] = await Promise.all([
      Prompt.countDocuments(query),
      Prompt.find(query)
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
    ]);

    res.json({
      prompts,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch prompts' });
  }
};

// GET /api/prompts/:id
exports.getPrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id).populate('createdBy', 'name');
    if (!prompt) return res.status(404).json({ message: 'Prompt not found' });
    res.json(prompt);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch prompt' });
  }
};

// POST /api/prompts  (admin only)
exports.createPrompt = async (req, res) => {
  try {
    const { title, description, type, category, tags, variants, image: bodyImage, beforeImage: bodyBeforeImage } = req.body;

    const imageFile = req.files?.['image']?.[0];
    const beforeImageFile = req.files?.['beforeImage']?.[0];

    const imageUrl = imageFile
      ? `${req.protocol}://${req.get('host')}/uploads/${imageFile.filename}`
      : bodyImage;

    const beforeImageUrl = beforeImageFile
      ? `${req.protocol}://${req.get('host')}/uploads/${beforeImageFile.filename}`
      : bodyBeforeImage || null;

    if (!imageUrl) {
      return res.status(400).json({ message: 'An image file or image URL is required' });
    }

    const parsedTags = tags
      ? JSON.parse(tags).map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];
    const parsedVariants = variants
      ? JSON.parse(variants).map((v) => v.trim()).filter(Boolean)
      : [];

    const prompt = await Prompt.create({
      title,
      description,
      image: imageUrl,
      beforeImage: beforeImageUrl,
      type,
      category,
      tags: parsedTags,
      variants: parsedVariants,
      createdBy: req.user._id,
    });

    res.status(201).json(prompt);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create prompt' });
  }
};

// PUT /api/prompts/:id  (admin only)
exports.updatePrompt = async (req, res) => {
  try {
    const { title, description, type, category, tags, variants, image: bodyImage, beforeImage: bodyBeforeImage } = req.body;

    const imageFile = req.files?.['image']?.[0];
    const beforeImageFile = req.files?.['beforeImage']?.[0];

    const update = { title, description, type, category };

    if (tags) {
      update.tags = JSON.parse(tags).map((t) => t.trim().toLowerCase()).filter(Boolean);
    }
    if (variants) {
      update.variants = JSON.parse(variants).map((v) => v.trim()).filter(Boolean);
    }
    if (imageFile) {
      update.image = `${req.protocol}://${req.get('host')}/uploads/${imageFile.filename}`;
    } else if (bodyImage) {
      update.image = bodyImage;
    }
    if (beforeImageFile) {
      update.beforeImage = `${req.protocol}://${req.get('host')}/uploads/${beforeImageFile.filename}`;
    } else if (bodyBeforeImage !== undefined) {
      update.beforeImage = bodyBeforeImage || null;
    }

    const prompt = await Prompt.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!prompt) return res.status(404).json({ message: 'Prompt not found' });
    res.json(prompt);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update prompt' });
  }
};

// DELETE /api/prompts/:id  (admin only)
exports.deletePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndDelete(req.params.id);
    if (!prompt) return res.status(404).json({ message: 'Prompt not found' });
    res.json({ message: 'Prompt deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete prompt' });
  }
};

// GET /api/prompts/categories  — distinct categories list
exports.getCategories = async (req, res) => {
  try {
    const categories = await Prompt.distinct('category');
    res.json(categories.sort());
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};
