const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/broadcast', async (req, res) => {
  try {
    const { subject, message, target } = req.body;
    
    let emails = [];
    if (target === 'all_colleges') {
      const operators = await User.find({ role: 'operator' });
      emails = operators.map(u => u.email);
    } else if (Array.isArray(target)) {
      emails = target;
    } else {
      return res.status(400).json({ message: 'Invalid target specified' });
    }

    if (emails.length === 0) {
      return res.status(404).json({ message: 'No recipients found' });
    }

    const { data, error } = await resend.emails.send({
      from: 'ProtoHub Admin <onboarding@resend.dev>',
      to: emails,
      subject: subject,
      html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
               <h2 style="color: #4f46e5;">APIC ProtoHub Update</h2>
               <p style="font-size: 16px; white-space: pre-wrap;">${message}</p>
               <br/>
               <hr style="border: none; border-top: 1px solid #eaeaea;" />
               <p style="font-size: 12px; color: #888; margin-top: 20px;">This is an automated message from the APIC Super Admin Portal.</p>
             </div>`,
    });

    if (error) {
      console.error("Resend Error:", error);
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: `Successfully broadcasted to ${emails.length} recipients`, data });

  } catch (error) {
    console.error("Broadcast Server Error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
