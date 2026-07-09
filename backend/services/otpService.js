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
    const provider = process.env.OTP_PROVIDER || 'msg91';

    // Rate limiting check
    const existing = otpStore.get(phone);
    if (existing) {
        if (Date.now() < existing.nextResendAllowed) {
            throw new Error(`Please wait before requesting another OTP.`);
        }
        if (existing.attempts >= 3) {
            if (Date.now() < existing.blockUntil) {
                throw new Error("Too many attempts. Please try again later.");
            } else {
                existing.attempts = 0; // reset
            }
        }
    }
    
    // Generate OTP
    const otp = mode === 'demo' ? '123456' : generateOtp();
    
    // Store OTP with 5 minute expiry, 1 minute resend limit
    const expiry = Date.now() + 5 * 60 * 1000;
    const nextResendAllowed = Date.now() + 60 * 1000;
    const attempts = existing ? existing.attempts + 1 : 1;
    const blockUntil = attempts >= 3 ? Date.now() + 15 * 60 * 1000 : 0;
    
    otpStore.set(phone, { otp, expiry, nextResendAllowed, attempts, blockUntil });

    if (mode === 'demo') {
        return {
            success: true,
            message: "Demo OTP sent. Use 123456",
            demoOtp: "123456"
        };
    } else if (provider === 'fast2sms') {
        // Placeholder for Fast2SMS API call
        console.log(`[Fast2SMS] Sending real OTP ${otp} to ${phone}`);
        return { success: true, message: "OTP sent successfully" };
    } else if (provider === 'msg91') {
        // Placeholder for MSG91 API call
        console.log(`[MSG91] Sending real OTP ${otp} to ${phone}`);
        return { success: true, message: "OTP sent successfully" };
    } else if (provider === 'twilio') {
        // Placeholder for Twilio API call
        console.log(`[Twilio] Sending real OTP ${otp} to ${phone}`);
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
