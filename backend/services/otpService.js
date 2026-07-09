/**
 * OTP Service
 * Handles generating, sending, and verifying OTPs across different providers.
 */

// In-memory store for OTPs (In production, use Redis)
const otpStore = new Map();

/**
 * Generate a 6-digit OTP
 */
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP using the configured provider
 * @param {string} phone 
 * @returns {Object} result
 */
exports.sendOtp = async (phone) => {
    const mode = process.env.OTP_MODE || 'demo';
    
    // Generate OTP
    const otp = mode === 'demo' ? '123456' : generateOtp();
    
    // Store OTP with 5 minute expiry
    const expiry = Date.now() + 5 * 60 * 1000;
    otpStore.set(phone, { otp, expiry });

    if (mode === 'demo') {
        return {
            success: true,
            message: "Demo OTP sent. Use 123456",
            demoOtp: "123456"
        };
    } else if (mode === 'fast2sms') {
        // TODO: Implement Fast2SMS logic here
        // const apiKey = process.env.OTP_API_KEY;
        // await axios.post(...)
        console.log(`Sending real OTP ${otp} via Fast2SMS to ${phone}`);
        return { success: true, message: "OTP sent successfully" };
    } else if (mode === 'msg91') {
        // TODO: Implement MSG91 logic here
        console.log(`Sending real OTP ${otp} via MSG91 to ${phone}`);
        return { success: true, message: "OTP sent successfully" };
    } else {
        throw new Error("Invalid OTP provider configured");
    }
};

/**
 * Verify OTP for a phone number
 * @param {string} phone 
 * @param {string} inputOtp 
 * @returns {boolean} isValid
 */
exports.verifyOtp = (phone, inputOtp) => {
    const record = otpStore.get(phone);
    
    if (!record) {
        return false;
    }

    if (Date.now() > record.expiry) {
        otpStore.delete(phone);
        return false;
    }

    if (record.otp === inputOtp) {
        // Clear OTP after successful verification
        otpStore.delete(phone);
        return true;
    }

    return false;
};
