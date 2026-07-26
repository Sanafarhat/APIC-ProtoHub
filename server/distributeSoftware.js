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

  // Base 9 software equipments
  const baseSoftware = [
    {
      name: 'SolidWorks License Server',
      description: 'Network license server for SolidWorks CAD design and simulation suite. Supports up to 50 concurrent users.',
      equipmentType: 'Software',
      department: 'Mechanical',
      rating: 4.8,
      reviews: 210,
      icon: 'Cpu',
      imageUrl: ''
    },
    {
      name: 'MATLAB Cloud Node',
      description: 'High-performance computing node for MATLAB parallel processing and data analysis.',
      equipmentType: 'Software',
      department: 'Electronics',
      rating: 4.7,
      reviews: 130,
      icon: 'Settings',
      imageUrl: ''
    },
    {
      name: 'Adobe Creative Cloud Suite',
      description: 'Full suite of Adobe creative tools including Photoshop, Illustrator, Premiere Pro, and more.',
      equipmentType: 'Software',
      department: 'Design',
      rating: 4.9,
      reviews: 340,
      icon: 'Settings',
      imageUrl: ''
    },
    {
      name: 'Ansys Multiphysics',
      description: 'Advanced engineering simulation software for structural, thermal, and fluid dynamics analysis.',
      equipmentType: 'Software',
      department: 'Mechanical',
      rating: 4.6,
      reviews: 80,
      icon: 'Wind',
      imageUrl: ''
    },
    {
      name: 'AutoCAD Pro License',
      description: 'Professional 2D and 3D CAD design software with advanced rendering capabilities.',
      equipmentType: 'Software',
      department: 'Civil',
      rating: 4.5,
      reviews: 145,
      icon: 'Settings',
      imageUrl: ''
    },
    {
      name: 'Unity 3D Enterprise',
      description: 'Real-time 3D development platform for games, XR, and interactive experiences.',
      equipmentType: 'Software',
      department: 'Computer Science',
      rating: 4.8,
      reviews: 210,
      icon: 'Cpu',
      imageUrl: ''
    },
    {
      name: 'Tableau Data Visualization',
      description: 'Advanced analytics and data visualization platform for business intelligence.',
      equipmentType: 'Software',
      department: 'Data Science',
      rating: 4.6,
      reviews: 95,
      icon: 'Settings',
      imageUrl: ''
    },
    {
      name: 'Autodesk Maya',
      description: '3D computer graphics application used to develop video games, 3D applications, animated films, TV series, and visual effects.',
      equipmentType: 'Software',
      department: 'Design',
      rating: 4.9,
      reviews: 175,
      icon: 'Settings',
      imageUrl: ''
    },
    {
      name: 'JetBrains All Products Pack',
      description: 'Complete suite of professional IDEs including IntelliJ IDEA, PyCharm, WebStorm, and more.',
      equipmentType: 'Software',
      department: 'Computer Science',
      rating: 4.8,
      reviews: 420,
      icon: 'Cpu',
      imageUrl: ''
    }
  ];

  // 1. Delete all existing Software facilities
  await db.collection('facilities').deleteMany({ equipmentType: 'Software' });
  console.log('Cleared existing software equipments.');

  // 2. Insert 9 software items for EACH of the 11 institutions
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
  console.log(`Inserted ${result.insertedCount} software facilities across all locations.`);
  
  process.exit();
});
