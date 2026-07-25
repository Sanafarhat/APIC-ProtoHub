const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Facility = require('./models/Facility');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/protohub';

const softwareFacilities = [
  {
    name: 'SolidWorks License Server',
    description: 'Enterprise CAD software access for mechanical design and simulation.',
    location: 'Visakhapatnam',
    institution: 'Andhra University Center for Innovation',
    equipmentType: 'Software',
    softwareType: 'CAD/CAM',
    hourlyRate: 500,
    status: 'available',
    rating: 4.8,
    reviews: 210,
    icon: 'Cpu',
    imageUrl: '/images/default.jpg'
  },
  {
    name: 'MATLAB Cloud Node',
    description: 'High-performance computing node for MATLAB data analysis and modeling.',
    location: 'Vijayawada',
    institution: 'KL University Advanced Labs',
    equipmentType: 'Software',
    softwareType: 'Simulation',
    hourlyRate: 800,
    status: 'available',
    rating: 4.7,
    reviews: 130,
    icon: 'Settings',
    imageUrl: '/images/default.jpg'
  },
  {
    name: 'Adobe Creative Cloud Suite',
    description: 'Full suite access for UI/UX design, video editing, and graphics.',
    location: 'Amaravati',
    institution: 'SRM University AP FabLab',
    equipmentType: 'Software',
    softwareType: 'Design',
    hourlyRate: 400,
    status: 'available',
    rating: 4.9,
    reviews: 340,
    icon: 'Settings',
    imageUrl: '/images/default.jpg'
  },
  {
    name: 'Ansys Multiphysics',
    description: 'Comprehensive simulation software for engineering challenges.',
    location: 'Tirupati',
    institution: 'IIT Tirupati Research Park',
    equipmentType: 'Software',
    softwareType: 'Simulation',
    hourlyRate: 1000,
    status: 'available',
    rating: 4.6,
    reviews: 80,
    icon: 'Wind',
    imageUrl: '/images/default.jpg'
  }
];

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected for Software Seeding');
    // Remove the previously added fake colleges
    await Facility.deleteMany({ institution: { $in: ['College A', 'College B', 'APIC'] } });
    await Facility.deleteMany({ equipmentType: 'Software' });
    
    // Insert new software facilities
    await Facility.insertMany(softwareFacilities);
    console.log('Software Facilities Added to Existing Colleges Successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.log('MongoDB connection error:', err);
    process.exit(1);
  });
