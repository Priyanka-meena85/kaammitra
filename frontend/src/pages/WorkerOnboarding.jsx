import React from 'react';
const WorkerOnboarding = () => (
    <div className="py-20 text-center">
        <h1 className="text-3xl font-bold text-navy mb-4">Worker Onboarding</h1>
        <p className="text-gray-600 mb-8">Join the KaamMitra platform today.</p>
        <button onClick={() => window.location.href = '/worker-register'} className="bg-primary text-white px-6 py-2 rounded-lg font-bold">Start Registration</button>
    </div>
);
export default WorkerOnboarding;