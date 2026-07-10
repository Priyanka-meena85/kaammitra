const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const WorkerWallet = require('../models/WorkerWallet');
const PayoutRequest = require('../models/PayoutRequest');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// Calculate Platform Commission
const calculateCommission = (amount) => {
    const percent = parseFloat(process.env.PLATFORM_COMMISSION_PERCENT) || 10;
    const commission = (amount * percent) / 100;
    return {
        platformCommissionAmount: commission,
        workerEarningAmount: amount - commission
    };
};

// 1. Create Razorpay Order
exports.createOrder = async (req, res) => {
    try {
        const { bookingId, paymentType, amount } = req.body;
        
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        if (booking.customerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        if (booking.status === 'Cancelled' || booking.status === 'Rejected') {
            return res.status(400).json({ success: false, message: 'Cannot pay for cancelled/rejected booking' });
        }

        if (amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

        // Check for duplicate paid payment for same type
        const existingPayment = await Payment.findOne({
            bookingId,
            paymentType,
            status: { $in: ['paid', 'created', 'pending'] }
        });

        if (existingPayment && existingPayment.status === 'paid') {
            return res.status(400).json({ success: false, message: 'Payment already made for this phase' });
        }

        // Create razorpay order
        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency: "INR",
            receipt: `rcpt_${bookingId.toString().slice(-6)}_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Create local payment record
        const payment = await Payment.create({
            bookingId,
            customerId: req.user.id,
            workerId: booking.workerId,
            amount,
            currency: 'INR',
            paymentType,
            razorpayOrderId: order.id,
            status: 'created'
        });

        res.status(200).json({
            success: true,
            order,
            paymentId: payment._id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error in creating order' });
    }
};

// 2. Verify Payment
exports.verifyPayment = async (req, res) => {
    try {
        const { bookingId, paymentRecordId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const payment = await Payment.findById(paymentRecordId);
        if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });
        
        if (payment.status === 'paid') {
            return res.status(200).json({ success: true, message: 'Payment already verified' });
        }

        // Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            payment.status = 'failed';
            payment.failureReason = 'Signature mismatch';
            await payment.save();
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        // Signature is valid -> Mark Paid
        const { platformCommissionAmount, workerEarningAmount } = calculateCommission(payment.amount);

        payment.status = 'paid';
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.paidAt = Date.now();
        payment.platformCommissionPercent = parseFloat(process.env.PLATFORM_COMMISSION_PERCENT) || 10;
        payment.platformCommissionAmount = platformCommissionAmount;
        payment.workerEarningAmount = workerEarningAmount;
        
        await payment.save();

        // Update Booking
        const booking = await Booking.findById(bookingId);
        if (payment.paymentType === 'advance') {
            booking.paymentStatus = 'advance_paid';
            booking.advanceAmount = (booking.advanceAmount || 0) + payment.amount;
        } else if (payment.paymentType === 'full' || payment.paymentType === 'remaining') {
            booking.paymentStatus = 'paid';
        }
        booking.paymentMode = 'online';
        booking.paymentId = payment._id;
        
        await booking.save();

        // Update Worker Wallet (Pending Balance)
        if (booking.workerId) {
            let wallet = await WorkerWallet.findOne({ workerId: booking.workerId });
            if (!wallet) {
                wallet = await WorkerWallet.create({ workerId: booking.workerId });
            }
            wallet.pendingBalance += workerEarningAmount;
            wallet.transactions.push({
                type: 'earning',
                amount: workerEarningAmount,
                bookingId: booking._id,
                paymentId: payment._id,
                description: `Earning from ${payment.paymentType} payment (Order: ${razorpay_order_id})`
            });
            await wallet.save();
        }

        res.status(200).json({ success: true, message: 'Payment verified successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error in payment verification' });
    }
};

// 3. Get Booking Payments
exports.getBookingPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ bookingId: req.params.bookingId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 4. Get My Payments (Customer)
exports.getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ customerId: req.user.id })
            .populate('bookingId', 'description date time status')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 5. Get Worker Wallet
exports.getWorkerWallet = async (req, res) => {
    try {
        let wallet = await WorkerWallet.findOne({ workerId: req.user.id });
        if (!wallet) {
            wallet = await WorkerWallet.create({ workerId: req.user.id });
        }
        res.status(200).json({ success: true, data: wallet });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 6. Request Payout
exports.requestPayout = async (req, res) => {
    try {
        const { amount, bankDetails } = req.body;
        const MIN_PAYOUT_AMOUNT = parseInt(process.env.MIN_PAYOUT_AMOUNT) || 100;

        if (amount < MIN_PAYOUT_AMOUNT) {
            return res.status(400).json({ success: false, message: `Minimum payout is ₹${MIN_PAYOUT_AMOUNT}` });
        }

        const wallet = await WorkerWallet.findOne({ workerId: req.user.id });
        if (!wallet || wallet.availableBalance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient available balance' });
        }

        // Deduct from available, it is now "locked" implicitly by reducing available balance.
        wallet.availableBalance -= amount;
        
        // Mask details for snapshot
        const maskedBank = {
            ...bankDetails,
            accountNumberMasked: bankDetails.accountNumber ? `XXXX${bankDetails.accountNumber.slice(-4)}` : undefined,
            upiIdMasked: bankDetails.upiId ? `${bankDetails.upiId.substring(0, 3)}***@${bankDetails.upiId.split('@')[1]}` : undefined
        };

        const payout = await PayoutRequest.create({
            workerId: req.user.id,
            amount,
            bankDetailsSnapshot: maskedBank
        });

        wallet.transactions.push({
            type: 'payout_requested',
            amount: amount,
            description: `Payout requested (ID: ${payout._id})`
        });

        await wallet.save();

        res.status(200).json({ success: true, message: 'Payout requested successfully', data: payout });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 7. Get Admin Payouts
exports.getAdminPayouts = async (req, res) => {
    try {
        const payouts = await PayoutRequest.find().populate('workerId', 'name phone service').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: payouts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 8. Update Payout Status (Admin)
exports.updatePayoutStatus = async (req, res) => {
    try {
        const { status, adminNote, transactionReference } = req.body;
        const payout = await PayoutRequest.findById(req.params.id);

        if (!payout) return res.status(404).json({ success: false, message: 'Payout request not found' });
        
        if (payout.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Payout is already ${payout.status}` });
        }

        payout.status = status;
        payout.adminNote = adminNote;
        payout.transactionReference = transactionReference;
        payout.processedAt = Date.now();
        payout.processedBy = req.user.id;

        const wallet = await WorkerWallet.findOne({ workerId: payout.workerId });

        if (status === 'paid' || status === 'approved') {
            if (wallet && status === 'paid') {
                wallet.withdrawnAmount += payout.amount;
                wallet.transactions.push({
                    type: 'payout_approved',
                    amount: payout.amount,
                    description: `Payout paid via ${transactionReference || 'manual bank transfer'}`
                });
                await wallet.save();
            }
        } else if (status === 'rejected') {
            if (wallet) {
                wallet.availableBalance += payout.amount; // Refund to available
                wallet.transactions.push({
                    type: 'payout_rejected',
                    amount: payout.amount,
                    description: `Payout rejected: ${adminNote || 'No reason provided'}`
                });
                await wallet.save();
            }
        }

        await payout.save();
        res.status(200).json({ success: true, message: `Payout marked as ${status}` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
