const Admin = require('../models/Admin');

const seedAdmin = async () => {
    try {
        const adminCount = await Admin.countDocuments();
        
        if (adminCount === 0) {
            console.log('No Admin found in the database. Bootstrapping first Admin...');
            
            const email = process.env.ADMIN_EMAIL;
            const password = process.env.ADMIN_PASSWORD;

            if (!email || !password) {
                console.warn('⚠️ Cannot create first Admin: ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables.');
                return;
            }

            // Using 'username' since that is what the existing Admin model uses
            const admin = new Admin({
                username: email,
                password: password,
                role: 'admin'
            });

            await admin.save();
            console.log(`✅ First Admin account created successfully for: ${email}`);
        } else {
            console.log('Admin account already exists. Skipping bootstrap.');
        }
    } catch (error) {
        console.error('❌ Error bootstrapping first Admin:', error);
    }
};

module.exports = seedAdmin;
