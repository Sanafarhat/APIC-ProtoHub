const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Facility = require('./models/Facility');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/protohub';

const moreSoftwareFacilities = [
  {
    name: 'AutoCAD Pro License',
    description: 'Professional 2D and 3D CAD design tool for architects and engineers.',
    location: 'Tadepalligudem',
    institution: 'NIT Andhra Pradesh Prototyping Center',
    equipmentType: 'Software',
    softwareType: 'CAD/CAM',
    hourlyRate: 300,
    status: 'available',
    rating: 4.5,
    reviews: 145,
    icon: 'Settings',
    imageUrl: '/images/default.jpg'
  },
  {
    name: 'Unity 3D Enterprise',
    description: 'Game engine and AR/VR development suite for innovators.',
    location: 'Kakinada',
    institution: 'JNTU Kakinada Engineering Hub',
    equipmentType: 'Software',
    softwareType: 'Development',
    hourlyRate: 450,
    status: 'available',
    rating: 4.8,
    reviews: 210,
    icon: 'Cpu',
    imageUrl: '/images/default.jpg'
  },
  {
    name: 'Tableau Data Visualization',
    description: 'Enterprise data visualization and business intelligence software.',
    location: 'Guntur',
    institution: 'Guntur Industrial Testing Center',
    equipmentType: 'Software',
    softwareType: 'Analytics',
    hourlyRate: 600,
    status: 'available',
    rating: 4.6,
    reviews: 95,
    icon: 'Settings',
    imageUrl: '/images/default.jpg'
  },
  {
    name: 'Autodesk Maya',
    description: '3D computer graphics software for interactive 3D applications and visual effects.',
    location: 'Visakhapatnam',
    institution: 'AP MedTech Zone (AMTZ)',
    equipmentType: 'Software',
    softwareType: 'Design',
    hourlyRate: 700,
    status: 'available',
    rating: 4.9,
    reviews: 175,
    icon: 'Settings',
    imageUrl: '/images/default.jpg'
  },
  {
    name: 'JetBrains All Products Pack',
    description: 'Comprehensive IDE suite for professional software development across all major languages.',
    location: 'Surampalem',
    institution: 'Aditya University',
    equipmentType: 'Software',
    softwareType: 'Development',
    hourlyRate: 200,
    status: 'available',
    rating: 4.8,
    reviews: 420,
    icon: 'Cpu',
    imageUrl: '/images/default.jpg'
  }
];

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected for Adding More Software Seeding');
    // Insert new software facilities directly
    await Facility.insertMany(moreSoftwareFacilities);
    console.log('More Software Facilities Added Successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.log('MongoDB connection error:', err);
    process.exit(1);
  });
