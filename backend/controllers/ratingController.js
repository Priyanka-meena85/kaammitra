const Rating = require('../models/Rating');
const Worker = require('../models/Worker');

exports.createRating = async (req, res) => {
    try {
        const rating = await Rating.create(req.body);
        
        // update worker stats
        const worker = await Worker.findById(req.body.workerId);
        if(worker) {
            const newTotal = worker.totalRatings + 1;
            const newAvg = ((worker.averageRating * worker.totalRatings) + req.body.rating) / newTotal;
            await Worker.findByIdAndUpdate(worker._id, { averageRating: newAvg, totalRatings: newTotal });
        }

        res.status(201).json({ success: true, data: rating });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getWorkerRatings = async (req, res) => {
    try {
        const ratings = await Rating.find({ workerId: req.params.workerId }).populate('customerId', 'name');
        res.status(200).json({ success: true, data: ratings });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
