import React from 'react';
import { Outlet } from 'react-router-dom';
import WorkerNavbar from '../components/navigation/WorkerNavbar';

const WorkerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-warm">
      <WorkerNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      {/* Footer can be omitted for Workers, or added back if needed */}
    </div>
  );
};

export default WorkerLayout;
