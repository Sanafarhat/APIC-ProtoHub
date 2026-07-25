const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');

// Get all facilities
router.get('/', async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single facility
router.get('/:id', async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    res.json(facility);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create facility (admin/operator only - simplified for now)
router.post('/', async (req, res) => {
  const facility = new Facility(req.body);
  try {
    const newFacility = await facility.save();
    res.status(201).json(newFacility);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Submit a review/rating for a facility
router.post('/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating value' });
    }

    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });

    // Calculate new average rating
    const currentRating = facility.rating || 0;
    const currentReviews = facility.reviews || 0;
    
    const newRating = ((currentRating * currentReviews) + rating) / (currentReviews + 1);
    
    facility.rating = newRating;
    facility.reviews = currentReviews + 1;
    
    await facility.save();
    
    res.json({ message: 'Rating submitted successfully', facility });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a facility (admin/operator only)
router.delete('/:id', async (req, res) => {
  try {
    const facility = await Facility.findByIdAndDelete(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    res.json({ message: 'Facility deleted successfully', facility });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
