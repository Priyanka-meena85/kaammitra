const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const WorkerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    services: {
        type: [String],
        required: [true, 'Please specify at least one service category']
    },
    experience: {
        type: String // e.g. "5 years"
    },
    expectedCharge: {
        type: Number // expected hourly or visit charge
    },
    address: {
        type: String
    },
    radius: {
        type: Number, // work area radius in km
        default: 10
    },
    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    availability: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    trustScore: {
        type: Number,
        default: 50 // 0-100 scale
    },
    averageRating: {
        type: Number,
        default: 0
    },
    completedJobs: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        default: 'worker'
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
WorkerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
WorkerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Worker', WorkerSchema);
