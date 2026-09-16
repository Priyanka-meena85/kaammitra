const rolePermissions = {
    customer: [
        'profile.read.self',
        'profile.update.self',
        'worker.read',
        'booking.create',
        'booking.read.own',
        'booking.cancel.own',
        'booking.status.update', // allowed to cancel/update own
        'payment.create',
        'payment.read.own',
        'chat.use.related',
        'review.create',
        'review.read',
        'safety.report',
        'settings.manage.self'
    ],
    worker: [
        'profile.read.self',
        'profile.update.self',
        'verification.submit',
        'availability.manage.self',
        'booking.read.assigned',
        'booking.accept',
        'booking.reject',
        'booking.status.update',
        'earnings.read.self',
        'wallet.read.self',
        'withdrawal.create.self',
        'chat.use.related',
        'review.read',
        'safety.report',
        'settings.manage.self'
    ],
    admin: [
        'users.read',
        'users.manage',
        'workers.manage',
        'verification.manage',
        'bookings.read',
        'bookings.manage',
        'payments.read',
        'refunds.manage',
        'reviews.moderate',
        'safety.manage',
        'fraud.manage',
        'wallet.manage',
        'analytics.read',
        'audit.read',
        'platform.manage',
        'chat.read.all'
    ]
};

module.exports = {
    rolePermissions
};
