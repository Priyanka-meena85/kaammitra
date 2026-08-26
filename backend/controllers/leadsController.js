const CallLead = require('../models/CallLead');

const Customer = require('../models/Customer');

exports.createLead = async (req, res) => {
    try {
        const { workerId, customerId, workerName, workerPhone, service, source, pageSource } = req.body;

        let customerPhone = null;
        if (customerId) {
            const customer = await Customer.findById(customerId);
            if (customer) customerPhone = customer.phone;
        }

        // Public endpoint: `status` is owned by the worker/admin, never the caller.
        const lead = await CallLead.create({
            workerId, customerId, customerPhone, workerName, workerPhone, service, source, pageSource
        });
        res.status(201).json({ success: true, data: lead });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getLeads = async (req, res) => {
    try {
        const query = req.user.role === 'worker' ? { workerId: req.user.id } : {};
        const leads = await CallLead.find(query).populate('workerId', 'name phone');
        res.status(200).json({ success: true, count: leads.length, data: leads });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateLeadStatus = async (req, res) => {
    try {
        const query = req.user.role === 'worker'
            ? { _id: req.params.id, workerId: req.user.id }
            : { _id: req.params.id };
        const lead = await CallLead.findOneAndUpdate(query, { status: req.body.status }, { new: true, runValidators: true });
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
        res.status(200).json({ success: true, data: lead });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
