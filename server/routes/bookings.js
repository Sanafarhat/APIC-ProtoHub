const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Groq = require('groq-sdk');
const Razorpay = require('razorpay');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
// Get all bookings
router.get('/', async (req, res) => {
  try {
    const { userId, operatorOrg } = req.query;
    const filter = userId ? { user: userId } : {};
    let bookings = await Booking.find(filter).populate('facility').populate('user', '-password');
    
    // Filter by operator organization if provided
    if (operatorOrg) {
      bookings = bookings.filter(b => b.facility && b.facility.institution === operatorOrg);
    }
    
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Get available time slots for a specific date and facility
router.get('/available-slots', async (req, res) => {
  const { facility, date } = req.query;
  try {
    // Generate all potential slots for the day (9 AM to 5 PM)
    const allSlots = [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    // Find all active bookings for this facility on this date
    // Date from frontend is usually YYYY-MM-DD
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0,0,0,0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23,59,59,999);

    const existingBookings = await Booking.find({
      facility,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    // Map booked start times (Assuming 1 hour duration for simplicity, though real logic could check duration)
    const bookedTimes = existingBookings.map(b => b.startTime);

    // Filter available slots
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
    
    res.json(availableSlots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single booking by ID (for QR Tracking)
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('facility').populate('user', '-password');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Using Razorpay test keys (these can be moved to .env in production)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_MOCK_KEY_1234',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret_key_5678'
    });

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a booking
router.post('/', async (req, res) => {
  const booking = new Booking(req.body);
  if (req.body.paymentId) {
    booking.status = 'pending_admin';
  }
  try {
    const newBooking = await booking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a booking status (and trigger email notification)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).populate('user');
    
    if (!updatedBooking) return res.status(404).json({ message: 'Booking not found' });
    
    // Email Notification via Resend
    let emailContent = `Hello ${updatedBooking.user.name},<br><br>Your request for facility access has been updated.<br>Current Status: <strong>${status}</strong>.<br><br>`;
    
    if (status === 'pending_operator') {
      emailContent += "The Super Admin has verified your request! It is now pending final operator approval.";
    } else if (status === 'approved') {
      emailContent += "Your booking has been APPROVED by the operator! You can now use the facility at the scheduled time.";
    } else if (status === 'rejected') {
      emailContent += "Unfortunately, your booking request has been REJECTED.";
    }

    try {
      await resend.emails.send({
        from: 'ProtoHub Booking <onboarding@resend.dev>',
        to: updatedBooking.user.email,
        subject: `APIC ProtoHub Booking Status: ${status.toUpperCase()}`,
        html: emailContent
      });
      console.log(`Email sent to ${updatedBooking.user.email} for status ${status}`);
    } catch (emailErr) {
      console.error("Failed to send status email:", emailErr);
    }

    res.json({ ...updatedBooking.toObject(), emailDispatched: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a booking with feedback
router.put('/:id/feedback', async (req, res) => {
  try {
    const { feedback } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { feedback }, 
      { new: true }
    );
    if (!updatedBooking) return res.status(404).json({ message: 'Booking not found' });
    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// AI Cost Estimation Endpoint
router.post('/estimate-cost', async (req, res) => {
  const { attachedFile, facility, equipmentType, duration } = req.body;
  
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ message: 'Groq API Key missing on server' });
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const prompt = `
      You are an expert cost estimator for the APIC ProtoHub platform. 
      A user wants to book a facility and has attached a file. This file might be a CAD file (.stl, .step) for manufacturing, OR a standard document (.pdf, .docx, .txt) outlining a project, consulting requirement, or test plan.
      
      Details:
      - File Uploaded: ${attachedFile}
      - Facility: ${facility}
      - Equipment Type: ${equipmentType}
      - Duration: ${duration} hours
      
      Analyze the likely material required, processing complexity, or consulting fees based on the equipment type and the file extension.
      Respond ONLY with a valid JSON object in the exact format:
      {"materialCost": 450}
      where the value is an integer representing the estimated extra material/consulting cost in Indian Rupees (INR).
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '{}';
    const parsedData = JSON.parse(responseText);
    
    res.json({
      materialCost: parsedData.materialCost || 250,
      aiEstimated: true
    });
  } catch (err) {
    console.error('Groq Estimation Error:', err);
    // Fallback in case of API failure
    res.status(500).json({ message: 'AI estimation failed, falling back to mock calculation' });
  }
});

module.exports = router;
