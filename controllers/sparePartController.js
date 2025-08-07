const SparePart = require('../models/SparePart');
const CarType = require('../models/CarType');
const CarModel = require('../models/CarModel');

exports.createSparePart = async (req, res) => {
  try {
    const { name, carType, carModel, year, description, price, phone } = req.body;
    const image = req.file ? req.file.filename : null;

    const newPart = new SparePart({
      name,
      carType,
      carModel,
      year,
      description,
      price,
      phone,
      image,
      createdBy: req.session.userId,
    });

    await newPart.save();
    res.status(201).json({ message: 'Spare part created', sparePart: newPart });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create spare part' });
  }
};

exports.getAllSpareParts = async (req, res) => {
  try {
    const parts = await SparePart.find().populate('carType carModel');
    res.json(parts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spare parts' });
  }
};

exports.getSparePartById = async (req, res) => {
  try {
    const part = await SparePart.findById(req.params.id).populate('carType carModel');
    if (!part) return res.status(404).json({ error: 'Spare part not found' });
    res.json(part);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spare part' });
  }
};

exports.deleteSparePart = async (req, res) => {
  try {
    const part = await SparePart.findById(req.params.id);
    if (!part) return res.status(404).json({ error: 'Spare part not found' });

    if (String(part.createdBy) !== String(req.session.userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await part.deleteOne();
    res.json({ message: 'Spare part deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete spare part' });
  }
};
