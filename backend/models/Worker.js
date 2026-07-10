const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const WorkerSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        unique: true
    },
    whatsapp: {
        type: String
    },
    email: {
        type: String
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
    skills: {
        type: [String]
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
    city: {
        type: String
    },
    area: {
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
    
    // Availability & Working Hours
    isAvailable: {
        type: Boolean,
        default: true
    },
    workingHoursStart: {
        type: String,
        default: '09:00'
    },
    workingHoursEnd: {
        type: String,
        default: '18:00'
    },
    emergencyAvailable: {
        type: Boolean,
        default: false
    },
    preferredAreas: {
        type: [String],
        default: []
    },
    maxTravelDistance: {
        type: Number,
        default: 10 // km
    },
    weeklyOffDay: {
        type: String,
        default: 'Sunday'
    },

    // Verification Flags
    verificationStatus: {
        type: String,
        enum: ['Registered', 'Pending Verification', 'Verified', 'Rejected', 'Active', 'Blocked'],
        default: 'Registered'
    },
    profilePhotoUrl: { type: String },
    profilePhotoPublicId: { type: String },
    idDocumentUrl: { type: String },
    idDocumentPublicId: { type: String },
    addressProofUrl: { type: String },
    addressProofPublicId: { type: String },
    documentType: { type: String },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    idVerified: {
        type: Boolean,
        default: false
    },
    areaVerified: {
        type: Boolean,
        default: false
    },
    verificationNotes: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    submittedAt: { type: Date },
    verifiedAt: { type: Date },

    // Performance & Stats
    trustScore: {
        type: Number,
        default: 50 // 0-100 scale
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    completedJobs: {
        type: Number,
        default: 0
    },
    complaintsCount: {
        type: Number,
        default: 0
    },
    responseTime: {
        type: Number, // average response time in minutes
        default: 30
    },
    profileCompletion: {
        type: Number, // 0-100%
        default: 50
    },
    role: {
        type: String,
        default: 'worker'
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
WorkerSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
WorkerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Worker', WorkerSchema);
