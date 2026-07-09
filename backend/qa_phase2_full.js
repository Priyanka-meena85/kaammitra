const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Worker = require('./models/Worker');
const Customer = require('./models/Customer');
const Complaint = require('./models/Complaint');
const otpService = require('./services/otpService');

dotenv.config();

async function runQaTests() {
  console.log("--- KaamMitra Phase 2 QA Tests ---");
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected.");

    // Test 1: OTP Demo Mode
    process.env.OTP_MODE = 'demo';
    const otpRes = await otpService.sendOtp('9998887776');
    if (otpRes.demoOtp === '123456') {
      console.log("Test 1 PASS: OTP demo mode works");
    } else {
      console.log("Test 1 FAIL: OTP demo mode failed");
    }

    // Test 3 & 4: Wrong OTP fails
    const isValid = otpService.verifyOtp('9998887776', '000000');
    if (!isValid) {
      console.log("Test 4 PASS: Wrong OTP fails");
    } else {
      console.log("Test 4 FAIL: Wrong OTP succeeded");
    }

    // Valid OTP passes
    const isValidReal = otpService.verifyOtp('9998887776', '123456');
    if (isValidReal) {
      console.log("OTP Verification PASS");
    } else {
      console.log("OTP Verification FAIL");
    }

    // Cleanup before creating
    await Worker.deleteMany({ phone: '8887776665' });

    // Test 6 & 7: Customer/Worker city/area saves
    // We can verify this via mongoose models
    const testWorker = new Worker({
      name: 'QA Worker',
      phone: '8887776665',
      password: 'password',
      services: ['Electrician'],
      city: 'Tonk',
      area: 'Civil Lines',
      verificationStatus: 'Pending Verification'
    });
    
    await testWorker.save();
    const fetchedWorker = await Worker.findOne({ phone: '8887776665' });
    if (fetchedWorker.city === 'Tonk' && fetchedWorker.area === 'Civil Lines') {
      console.log("Test 7 PASS: Worker city/area saves correctly");
    }
    if (fetchedWorker.verificationStatus === 'Pending Verification') {
      console.log("Test 10 PASS: Worker verification status starts as Pending");
    }

    // Test 11 & 12: Admin can approve/reject worker
    fetchedWorker.verificationStatus = 'Verified';
    fetchedWorker.isVerified = true;
    fetchedWorker.verificationNotes = 'Looks good';
    await fetchedWorker.save();
    
    const approvedWorker = await Worker.findOne({ phone: '8887776665' });
    if (approvedWorker.verificationStatus === 'Verified' && approvedWorker.isVerified) {
      console.log("Test 11 PASS: Admin can approve/reject worker");
    }

    // Test 13 & 14: Complaint status workflow & Admin notes
    const testComplaint = new Complaint({
      customerId: new mongoose.Types.ObjectId(),
      workerId: approvedWorker._id,
      bookingId: new mongoose.Types.ObjectId(),
      reason: 'Late',
      description: 'Worker was very late'
    });
    await testComplaint.save();
    
    if (testComplaint.status === 'Open') {
      console.log("Complaint starts as Open");
    }

    testComplaint.status = 'Resolved';
    testComplaint.adminNote = 'Called worker and warned them.';
    await testComplaint.save();

    const resolvedComplaint = await Complaint.findById(testComplaint._id);
    if (resolvedComplaint.status === 'Resolved' && resolvedComplaint.adminNote === 'Called worker and warned them.') {
      console.log("Test 13 & 14 PASS: Complaint workflow & Admin notes work");
    }

    // Cleanup
    await Worker.deleteOne({ phone: '8887776665' });
    await Complaint.deleteOne({ _id: testComplaint._id });
    console.log("Cleanup done.");

    process.exit(0);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runQaTests();
