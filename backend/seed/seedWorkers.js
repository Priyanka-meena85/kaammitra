const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Worker = require('../models/Worker');
const Customer = require('../models/Customer');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

// We'll hardcode the DB URI just in case .env path is missed, but try process.env first
const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kaammitra';

mongoose.connect(dbURI)
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.error(err));

const workersData = [
    {
        name: 'Ramesh Electrician',
        phone: '9876543201',
        email: 'ramesh.elec@example.com',
        role: 'worker',
        city: 'Ajmer',
        area: 'Vaishali Nagar',
        services: ['Electrician'],
        skills: ['Wiring', 'Appliance Repair', 'Fan Installation'],
        experience: 8,
        expectedCharge: 300,
        isAvailable: true,
        isVerified: true,
        verificationStatus: 'Verified',
        isBlocked: false,
        emergencyAvailable: true,
        averageRating: 4.8,
        completedJobs: 45,
        trustScore: 92,
        phoneVerified: true
    },
    {
        name: 'Suresh Plumber',
        phone: '9876543202',
        email: 'suresh.plumb@example.com',
        role: 'worker',
        city: 'Tonk',
        area: 'Civil Lines',
        services: ['Plumber'],
        skills: ['Pipe Fitting', 'Tap Repair', 'Motor Installation'],
        experience: 5,
        expectedCharge: 250,
        isAvailable: true,
        isVerified: true,
        verificationStatus: 'Verified',
        isBlocked: false,
        emergencyAvailable: false,
        averageRating: 4.5,
        completedJobs: 30,
        trustScore: 85,
        phoneVerified: true
    },
    {
        name: 'Hari Carpenter',
        phone: '9876543203',
        email: 'hari.carp@example.com',
        role: 'worker',
        city: 'Jaipur',
        area: 'Mansarovar',
        services: ['Carpenter'],
        skills: ['Furniture Making', 'Door Repair', 'Wood Polish'],
        experience: 12,
        expectedCharge: 500,
        isAvailable: false,
        isVerified: true,
        verificationStatus: 'Verified',
        isBlocked: false,
        emergencyAvailable: false,
        averageRating: 4.9,
        completedJobs: 120,
        trustScore: 95,
        phoneVerified: true
    },
    {
        name: 'Mukesh Painter',
        phone: '9876543204',
        email: 'mukesh.paint@example.com',
        role: 'worker',
        city: 'Ajmer',
        area: 'Adarsh Nagar',
        services: ['Painter'],
        skills: ['Wall Painting', 'Texture', 'Waterproofing'],
        experience: 4,
        expectedCharge: 800,
        isAvailable: true,
        isVerified: false,
        verificationStatus: 'Pending Verification',
        isBlocked: false,
        emergencyAvailable: false,
        averageRating: 0,
        completedJobs: 0,
        trustScore: 40,
        phoneVerified: true
    },
    {
        name: 'Anil AC Repair',
        phone: '9876543205',
        email: 'anil.ac@example.com',
        role: 'worker',
        city: 'Jaipur',
        area: 'Malviya Nagar',
        services: ['AC Repair'],
        skills: ['Gas Refill', 'AC Service', 'Installation'],
        experience: 6,
        expectedCharge: 400,
        isAvailable: true,
        isVerified: true,
        verificationStatus: 'Verified',
        isBlocked: false,
        emergencyAvailable: true,
        averageRating: 4.6,
        completedJobs: 55,
        trustScore: 88,
        phoneVerified: true
    },
    {
        name: 'Kamla Cleaner',
        phone: '9876543206',
        email: 'kamla.clean@example.com',
        role: 'worker',
        city: 'Tonk',
        area: 'Purani Tonk',
        services: ['Cleaner'],
        skills: ['Deep Cleaning', 'Bathroom Cleaning', 'Floor Scrubbing'],
        experience: 3,
        expectedCharge: 200,
        isAvailable: true,
        isVerified: true,
        verificationStatus: 'Verified',
        isBlocked: false,
        emergencyAvailable: false,
        averageRating: 4.7,
        completedJobs: 80,
        trustScore: 90,
        phoneVerified: true
    },
    {
        name: 'Sunita House Helper',
        phone: '9876543207',
        email: 'sunita.helper@example.com',
        role: 'worker',
        city: 'Ajmer',
        area: 'Makarwali Road',
        services: ['House Helper'],
        skills: ['Cooking', 'Utensil Washing', 'Laundry'],
        experience: 10,
        expectedCharge: 3000, // Monthly typical
        isAvailable: true,
        isVerified: true,
        verificationStatus: 'Verified',
        isBlocked: false,
        emergencyAvailable: false,
        averageRating: 4.9,
        completedJobs: 20,
        trustScore: 98,
        phoneVerified: true
    },
    {
        name: 'Ram Mason',
        phone: '9876543208',
        email: 'ram.mason@example.com',
        role: 'worker',
        city: 'Jaipur',
        area: 'Sanganer',
        services: ['Mason'],
        skills: ['Brickwork', 'Plaster', 'Tile Laying'],
        experience: 15,
        expectedCharge: 700,
        isAvailable: false,
        isVerified: false,
        verificationStatus: 'Pending Verification',
        isBlocked: false,
        emergencyAvailable: false,
        averageRating: 0,
        completedJobs: 0,
        trustScore: 30,
        phoneVerified: true
    },
    {
        name: 'Vijay Mechanic',
        phone: '9876543209',
        email: 'vijay.mech@example.com',
        role: 'worker',
        city: 'Tonk',
        area: 'Bus Stand',
        services: ['Mechanic'],
        skills: ['Bike Repair', 'Car Service', 'Puncture'],
        experience: 7,
        expectedCharge: 150,
        isAvailable: true,
        isVerified: true,
        verificationStatus: 'Verified',
        isBlocked: false,
        emergencyAvailable: true,
        averageRating: 4.4,
        completedJobs: 65,
        trustScore: 82,
        phoneVerified: true
    },
    {
        name: 'Dinesh Appliance Repair',
        phone: '9876543210',
        email: 'dinesh.app@example.com',
        role: 'worker',
        city: 'Ajmer',
        area: 'Pratap Nagar',
        services: ['Appliance Repair'],
        skills: ['Washing Machine', 'Refrigerator', 'Microwave'],
        experience: 9,
        expectedCharge: 350,
        isAvailable: true,
        isVerified: true,
        verificationStatus: 'Verified',
        isBlocked: false,
        emergencyAvailable: true,
        averageRating: 4.8,
        completedJobs: 90,
        trustScore: 94,
        phoneVerified: true
    }
];

const seedDB = async () => {
    try {
        console.log('Generating password hashes...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        console.log('Clearing old duplicate seeded workers...');
        // Only delete the specific seed workers so we don't destroy actual user testing data
        const phones = workersData.map(w => w.phone);
        await Worker.deleteMany({ phone: { $in: phones } });
        
        console.log('Inserting seed workers...');
        const workersToInsert = workersData.map(w => ({
            ...w,
            password: hashedPassword // The model's pre-save hook might re-hash this if we use create(), so we use insertMany which bypasses pre-save, or we assign raw password and use create(). We'll use insertMany.
        }));

        await Worker.insertMany(workersToInsert);
        console.log('Successfully seeded 10 workers!');
        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedDB();
