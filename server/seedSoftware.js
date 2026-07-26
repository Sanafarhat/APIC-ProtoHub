const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Facility = require('./models/Facility');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/protohub';

const softwareFacilities = [
  {
    name: 'SolidWorks License Server',
    description: 'Enterprise CAD software access for mechanical design and simulation.',
    location: 'APIC Hyd',
    institution: 'APIC',
    equipmentType: 'Software',
    softwareType: 'CAD/CAM',
    hourlyRate: 500,
    status: 'available',
    rating: 4.8,
    reviews: 210,
    icon: 'Cpu',
    imageUrl: ''
  },
  {
    name: 'MATLAB Cloud Node',
    description: 'High-performance computing node for MATLAB data analysis and modeling.',
    location: 'College A',
    institution: 'College A',
    equipmentType: 'Software',
    softwareType: 'Simulation',
    hourlyRate: 800,
    status: 'available',
    rating: 4.7,
    reviews: 130,
    icon: 'Settings',
    imageUrl: ''
  },
  {
    name: 'Adobe Creative Cloud Suite',
    description: 'Full suite access for UI/UX design, video editing, and graphics.',
    location: 'SRM University',
    institution: 'SRM University',
    equipmentType: 'Software',
    softwareType: 'Design',
    hourlyRate: 400,
    status: 'available',
    rating: 4.9,
    reviews: 340,
    icon: 'Settings',
    imageUrl: ''
  },
  {
    name: 'Ansys Multiphysics',
    description: 'Comprehensive simulation software for engineering challenges.',
    location: 'College B',
    institution: 'College B',
    equipmentType: 'Software',
    softwareType: 'Simulation',
    hourlyRate: 1000,
    status: 'available',
    rating: 4.6,
    reviews: 80,
    icon: 'Wind',
    imageUrl: ''
  }
];

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected for Software Seeding');
    // DO NOT CLEAR EXISTING FACILITIES
    await Facility.insertMany(softwareFacilities);
    console.log('Software Facilities Added Successfully without clearing existing data.');
    process.exit(0);
  })
  .catch(err => {
    console.log('MongoDB connection error:', err);
    process.exit(1);
  });
