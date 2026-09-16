const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Customer = require('../models/Customer');
const Worker = require('../models/Worker');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');

dotenv.config();

const seedAnalytics = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        // Delete existing mock data for analytics
        await Booking.deleteMany({});
        await Payment.deleteMany({});
        await Complaint.deleteMany({});
        
        console.log('Cleared old data');

        let customer = await Customer.findOne();
        let worker = await Worker.findOne();
        let service = await Service.findOne();

        if (!service) {
            service = await Service.create({
                name: 'Electrician',
                englishName: 'Electrician',
                hindiName: 'बिजली मिस्त्री',
                category: 'Electrical',
                startingPrice: 500,
                description: 'Electrical Services'
            });
        }

        if (!customer) {
            customer = await Customer.create({
                name: 'Test Customer',
                email: 'customer@test.com',
                phone: '1111111111',
                password: 'password'
            });
        }
        if (!worker) {
            worker = await Worker.create({
                name: 'Test Worker',
                email: 'worker@test.com',
                phone: '2222222222',
                password: 'password',
                services: ['Electrician']
            });
        }
        
        // Generate bookings over the last 30 days
        const statuses = ['Completed', 'Completed', 'Completed', 'Cancelled', 'In Progress', 'Completed'];
        const dates = [];
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            // Random number of bookings per day (1 to 5)
            const count = Math.floor(Math.random() * 5) + 1;
            for (let j = 0; j < count; j++) {
                dates.push(new Date(d));
            }
        }

        const bookings = [];
        const payments = [];

        for (const date of dates) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const booking = new Booking({
                customerId: customer._id,
                workerId: worker._id,
                serviceId: service._id,
                service: 'Electrician',
                status: status,
                totalAmount: 500,
                address: '123 Test Street',
                description: 'Fix the light',
                createdAt: date,
                paymentStatus: status === 'Completed' ? 'paid' : 'unpaid'
            });
            bookings.push(booking);

            if (status === 'Completed') {
                payments.push({
                    bookingId: booking._id,
                    customerId: customer._id,
                    workerId: worker._id,
                    amount: 500,
                    status: 'paid',
                    paymentType: 'full',
                    platformCommissionAmount: 50,
                    workerEarningAmount: 450,
                    createdAt: date
                });
            }
        }

        await Booking.insertMany(bookings);
        await Payment.insertMany(payments);
        
        // Add some complaints using one of the created bookings
        const sampleBooking = bookings[0];
        
        await Complaint.create({
            customerId: customer._id,
            workerId: worker._id,
            bookingId: sampleBooking._id,
            reason: 'Unprofessional Behavior',
            description: 'Late to the job',
            status: 'Resolved',
            createdAt: new Date()
        });
        await Complaint.create({
            customerId: customer._id,
            workerId: worker._id,
            bookingId: sampleBooking._id,
            reason: 'Quality of Work',
            description: 'Did not fix the issue',
            status: 'In Review',
            createdAt: new Date(Date.now() - 86400000 * 2)
        });

        console.log(`Seeded ${bookings.length} bookings, ${payments.length} payments, and 2 complaints.`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAnalytics();
