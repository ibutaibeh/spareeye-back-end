const CarRequest = require('../models/CarRequest');

exports.createCarRequest = async (req, res) => {
  try {
    const { carType, carModel, year } = req.body;
    const newRequest = new CarRequest({
      requestedBy: req.session.userId,
      carType,
      carModel,
      year,
    });

    await newRequest.save();
    res.status(201).json({ message: 'Request submitted', request: newRequest });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit request' });
  }
};

exports.getAllCarRequests = async (req, res) => {
  try {
    const requests = await CarRequest.find().populate('requestedBy', 'username email');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

exports.updateCarRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await CarRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json({ message: 'Request status updated', request });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update request status' });
  }
};
