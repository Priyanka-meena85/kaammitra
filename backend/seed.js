const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');
const Worker = require('./models/Worker');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    // Clear db
    await Service.deleteMany();
    await Worker.deleteMany();

    console.log('Data Destroyed...');

    // Read local files
    const servicesPath = path.join(__dirname, '../frontend/src/data/services.js');
    const workersPath = path.join(__dirname, '../frontend/src/data/workers.js');

    // Basic regex extract since they are ES modules and can't be easily required in CJS
    const servicesContent = fs.readFileSync(servicesPath, 'utf8');
    const workersContent = fs.readFileSync(workersPath, 'utf8');

    // Extremely dirty but effective eval for simple data structures exported as const
    let servicesData = [];
    let workersData = [];
    
    // We just strip the 'export const services =' and run it through a safer JSON.parse approach if possible
    // Wait, it's easier to just create dummy data right here for the seeder
    
    const services = [
      { name: "Electrician", englishName: "Electrician", hindiName: "बिजली मिस्त्री", category: "Home Maintenance", icon: "Zap", description: "All electrical work", startingPrice: 199, estimatedTime: "1 hr", emergencyAvailable: true },
      { name: "Plumber", englishName: "Plumber", hindiName: "प्लंबर", category: "Home Maintenance", icon: "Droplets", description: "Pipes, taps, leaks", startingPrice: 149, estimatedTime: "1 hr", emergencyAvailable: true },
      { name: "Carpenter", englishName: "Carpenter", hindiName: "बढ़ई", category: "Home Maintenance", icon: "Hammer", description: "Furniture and wood work", startingPrice: 299, estimatedTime: "2 hr", emergencyAvailable: false }
    ];
    
    await Service.insertMany(services);

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    const workers = [
      {
        name: "Ravi Sharma",
        phone: "9876543210",
        password: password,
        services: ["Electrician"],
        experience: "5 years",
        expectedCharge: 200,
        radius: 10,
        location: { type: 'Point', coordinates: [75.816667, 26.916667] }, // Jaipur roughly
        isVerified: true,
        trustScore: 85,
        averageRating: 4.8,
        completedJobs: 120
      },
      {
        name: "Amit Kumar",
        phone: "9876543211",
        password: password,
        services: ["Plumber"],
        experience: "3 years",
        expectedCharge: 150,
        radius: 5,
        location: { type: 'Point', coordinates: [75.820000, 26.920000] },
        isVerified: true,
        trustScore: 70,
        averageRating: 4.2,
        completedJobs: 45
      }
    ];

    await Worker.insertMany(workers);

    console.log('Data Imported!');
    process.exit();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

importData();
