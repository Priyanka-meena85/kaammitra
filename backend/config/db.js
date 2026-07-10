const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error("Error: MONGO_URI is not defined in environment variables.");
        process.exit(1);
    }
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to primary MONGO_URI: ${error.message}`);
        try {
            console.log('Attempting to start In-Memory MongoDB Fallback...');
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            
            const localConn = await mongoose.connect(mongoUri);
            console.log(`MongoDB Connected (In-Memory Fallback): ${localConn.connection.host}`);
            
            // Seed the memory database automatically so we can test it!
            console.log('Seeding memory database for QA testing...');
            try {
                const seedFunc = require('../seed');
                if (typeof seedFunc === 'function') await seedFunc();
            } catch(e) {
                console.log('Seed function not found or failed. Continuing empty.');
            }

        } catch (localError) {
            console.error(`Error connecting to memory fallback: ${localError.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
