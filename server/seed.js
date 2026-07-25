const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Facility = require('./models/Facility');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/protohub';

const dummyFacilities = [
  {
    name: 'Advanced 3D Printing Lab',
    description: 'State-of-the-art SLA and FDM printers for rapid prototyping of complex geometries.',
    location: 'APIC Hyd',
    equipmentType: '3D Printer',
    hourlyRate: 1500,
    status: 'available',
    rating: 4.8,
    reviews: 124,
    icon: 'Printer'
  },
  {
    name: 'CNC Machining Center',
    description: '5-axis CNC machines for high-precision metal and plastic fabrication.',
    location: 'APIC Hyd',
    equipmentType: 'CNC Machine',
    hourlyRate: 3000,
    status: 'available',
    rating: 4.9,
    reviews: 89,
    icon: 'Settings'
  },
  {
    name: 'Electronics PCB Fabrication Lab',
    description: 'Complete setup for multi-layer PCB prototyping and assembly.',
    location: 'College A',
    equipmentType: 'PCB Fabrication',
    hourlyRate: 1200,
    status: 'maintenance',
    rating: 4.5,
    reviews: 56,
    icon: 'Cpu'
  },
  {
    name: 'Drone Testing Facility',
    description: 'Indoor netted area and outdoor space with telemetry recording for UAV testing.',
    location: 'College B',
    equipmentType: 'Testing Space',
    hourlyRate: 2000,
    status: 'available',
    rating: 4.7,
    reviews: 42,
    icon: 'Wind'
  },
  {
    name: 'Biomedical Prototyping Lab',
    description: 'Cleanroom facility for medical device prototyping.',
    location: 'SRM University',
    equipmentType: 'Cleanroom',
    hourlyRate: 2500,
    status: 'available',
    rating: 4.9,
    reviews: 110,
    icon: 'Settings'
  },
  {
    name: 'Material Testing Lab',
    description: 'Tensile and compression testing equipment for advanced materials.',
    location: 'SRM University',
    equipmentType: 'Testing Space',
    hourlyRate: 1800,
    status: 'available',
    rating: 4.6,
    reviews: 75,
    icon: 'Settings'
  },
  {
    name: 'Laser Cutting Studio',
    description: 'High-power CO2 laser cutters for acrylic, wood, and metal.',
    location: 'College A',
    equipmentType: 'Laser Cutter',
    hourlyRate: 1400,
    status: 'available',
    rating: 4.8,
    reviews: 200,
    icon: 'Settings'
  }
];

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected for Seeding');
    await Facility.deleteMany({}); // Clear existing
    await Facility.insertMany(dummyFacilities);
    console.log('Facilities Seeded Successfully');
    process.exit(0);
  })
  .catch(err => {
    console.log('MongoDB connection error:', err);
    process.exit(1);
  });
