const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Area = require('./models/Area');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const seedAreas = async () => {
    try {
        await Area.deleteMany();
        await Area.insertMany([
            { city: 'Tonk', areaName: 'All Tonk', isActive: true },
            { city: 'Ajmer', areaName: 'All Ajmer', isActive: true },
            { city: 'Jaipur', areaName: 'All Jaipur', isActive: true }
        ]);
        console.log('Areas seeded successfully!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAreas();
