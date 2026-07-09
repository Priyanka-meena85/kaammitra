const CallLead = require('../models/CallLead');

const Customer = require('../models/Customer');

exports.createLead = async (req, res) => {
    try {
        let customerPhone = null;
        if (req.body.customerId) {
            const customer = await Customer.findById(req.body.customerId);
            if (customer) customerPhone = customer.phone;
        }
        const leadData = { ...req.body, customerPhone };
        const lead = await CallLead.create(leadData);
        res.status(201).json({ success: true, data: lead });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getLeads = async (req, res) => {
    try {
        const leads = await CallLead.find().populate('worker', 'name phone');
        res.status(200).json({ success: true, count: leads.length, data: leads });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
