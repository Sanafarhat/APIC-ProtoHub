require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rtih_protohub');
    console.log('MongoDB Connected');
    
    const adminEmail = 'admin@apic.com';
    let user = await User.findOne({ email: adminEmail });
    
    if (user) {
      console.log(`Admin user ${adminEmail} already exists. Updating role to admin.`);
      user.role = 'admin';
      await user.save();
    } else {
      user = new User({
        name: 'State Admin',
        email: adminEmail,
        role: 'admin'
      });
      await user.save();
      console.log(`Successfully created admin user: ${adminEmail} in MongoDB.`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
