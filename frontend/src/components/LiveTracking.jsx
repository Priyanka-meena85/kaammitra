import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, CheckCircle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const LiveTracking = ({ bookingId, customerLat, customerLng }) => {
    const { socket } = useSocket();
    const [workerLocation, setWorkerLocation] = useState(null);
    const [distance, setDistance] = useState(null); // in km

    useEffect(() => {
        if (!socket || !bookingId) return;

        socket.emit('subscribe_location', { bookingId });

        const handleLocationUpdate = ({ bookingId: incomingId, location }) => {
            if (incomingId === bookingId) {
                setWorkerLocation(location);
                if (customerLat && customerLng) {
                    const dist = calculateDistance(customerLat, customerLng, location.lat, location.lng);
                    setDistance(dist.toFixed(2));
                }
            }
        };

        socket.on('worker_location_update', handleLocationUpdate);

        return () => {
            socket.emit('unsubscribe_location', { bookingId });
            socket.off('worker_location_update', handleLocationUpdate);
        };
    }, [socket, bookingId, customerLat, customerLng]);

    // Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c; // Distance in km
    };

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-navy flex items-center gap-2">
                    <Navigation size={18} className="text-blue-600 animate-bounce" />
                    Live Tracking
                </h3>
                {workerLocation ? (
                   <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live
                   </span>
                ) : (
                   <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-bold">Waiting for worker signal...</span>
                )}
            </div>

            <div className="flex flex-col gap-2 relative">
                <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden relative">
                    <div className="bg-blue-600 h-full w-1/2 absolute top-0 left-0 animate-pulse rounded-full"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>En Route</span>
                    <span>{distance ? `${distance} km remaining` : 'Calculating distance...'}</span>
                    <span>Arriving</span>
                </div>
            </div>
            
            {workerLocation && (
                <div className="mt-3 text-sm text-gray-700 bg-white p-2 rounded border border-gray-100 flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400"/>
                    Last updated: Just now
                </div>
            )}
        </div>
    );
};

export default LiveTracking;
