const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  
  const apInstitutions = [
    { name: 'Andhra University Center for Innovation', city: 'Visakhapatnam' },
    { name: 'AP MedTech Zone (AMTZ)', city: 'Visakhapatnam' },
    { name: 'IIT Tirupati Research Park', city: 'Tirupati' },
    { name: 'Sri Venkateswara University Labs', city: 'Tirupati' },
    { name: 'NIT Andhra Pradesh Prototyping Center', city: 'Tadepalligudem' },
    { name: 'KL University Advanced Labs', city: 'Vijayawada' },
    { name: 'SRM University AP FabLab', city: 'Amaravati' },
    { name: 'JNTU Kakinada Engineering Hub', city: 'Kakinada' },
    { name: 'Guntur Industrial Testing Center', city: 'Guntur' },
    { name: 'Anantapur Incubation Hub', city: 'Anantapur' },
    { name: 'Aditya University', city: 'Surampalem' }
  ];

  const baseSoftware = [
    {
      name: 'SolidWorks License Server',
      description: 'Enterprise CAD software access for mechanical design and simulation.',
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
      equipmentType: 'Software',
      softwareType: 'Simulation',
      hourlyRate: 1000,
      status: 'available',
      rating: 4.6,
      reviews: 80,
      icon: 'Wind',
      imageUrl: ''
    },
    {
      name: 'AutoCAD Pro License',
      description: 'Professional 2D and 3D CAD design tool for architects and engineers.',
      equipmentType: 'Software',
      softwareType: 'CAD/CAM',
      hourlyRate: 300,
      status: 'available',
      rating: 4.5,
      reviews: 145,
      icon: 'Settings',
      imageUrl: ''
    },
    {
      name: 'Unity 3D Enterprise',
      description: 'Game engine and AR/VR development suite for innovators.',
      equipmentType: 'Software',
      softwareType: 'Development',
      hourlyRate: 450,
      status: 'available',
      rating: 4.8,
      reviews: 210,
      icon: 'Cpu',
      imageUrl: ''
    },
    {
      name: 'Tableau Data Visualization',
      description: 'Enterprise data visualization and business intelligence software.',
      equipmentType: 'Software',
      softwareType: 'Analytics',
      hourlyRate: 600,
      status: 'available',
      rating: 4.6,
      reviews: 95,
      icon: 'Settings',
      imageUrl: ''
    },
    {
      name: 'Autodesk Maya',
      description: '3D computer graphics software for interactive 3D applications and visual effects.',
      equipmentType: 'Software',
      softwareType: 'Design',
      hourlyRate: 700,
      status: 'available',
      rating: 4.9,
      reviews: 175,
      icon: 'Settings',
      imageUrl: ''
    },
    {
      name: 'JetBrains All Products Pack',
      description: 'Comprehensive IDE suite for professional software development across all major languages.',
      equipmentType: 'Software',
      softwareType: 'Development',
      hourlyRate: 200,
      status: 'available',
      rating: 4.8,
      reviews: 420,
      icon: 'Cpu',
      imageUrl: ''
    }
  ];

  await db.collection('facilities').deleteMany({ equipmentType: 'Software' });
  console.log('Cleared existing software equipments.');

  const newFacilities = [];
  for (const inst of apInstitutions) {
    for (const sw of baseSoftware) {
      newFacilities.push({
        ...sw,
        institution: inst.name,
        location: inst.city
      });
    }
  }

  const result = await db.collection('facilities').insertMany(newFacilities);
  console.log(`Inserted ${result.insertedCount} software facilities with ALL fields included.`);
  
  process.exit();
});
