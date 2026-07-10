import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
    getDashboardSummary, getBookingAnalytics, getRevenueAnalytics, getWorkerAnalytics, getComplaintAnalytics 
} from '../../api/analyticsApi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminAnalytics = () => {
    const [dateRange, setDateRange] = useState('30d');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Data states
    const [summary, setSummary] = useState(null);
    const [bookings, setBookings] = useState(null);
    const [revenue, setRevenue] = useState(null);
    const [workers, setWorkers] = useState(null);
    const [complaints, setComplaints] = useState(null);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [dateRange, city]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { range: dateRange, ...(city && { city }) };
            
            const [sumRes, bookRes, revRes, workRes, compRes] = await Promise.all([
                getDashboardSummary(params),
                getBookingAnalytics(params),
                getRevenueAnalytics(params),
                getWorkerAnalytics(params),
                getComplaintAnalytics(params)
            ]);

            setSummary(sumRes.data.data);
            setBookings(bookRes.data.data);
            setRevenue(revRes.data.data);
            setWorkers(workRes.data.data);
            setComplaints(compRes.data.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !summary) {
        return (
            <div className="flex justify-center items-center h-full min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Advanced Analytics</h1>
                <div className="flex gap-4">
                    <select 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Cities</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Pune">Pune</option>
                    </select>
                    <select 
                        value={dateRange} 
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="1y">Last Year</option>
                    </select>
                </div>
            </div>

            {/* Top Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={`₹${summary.totals.revenue.toLocaleString()}`} 
                    growth={summary.growth.revenueGrowthPercent} 
                    color="text-green-600"
                />
                <StatCard 
                    title="Total Commission" 
                    value={`₹${summary.totals.commission.toLocaleString()}`} 
                    growth={null} 
                    color="text-indigo-600"
                />
                <StatCard 
                    title="Total Bookings" 
                    value={summary.totals.bookings} 
                    growth={summary.growth.bookingGrowthPercent} 
                    color="text-blue-600"
                />
                <StatCard 
                    title="New Customers" 
                    value={summary.totals.customers} 
                    growth={summary.growth.customerGrowthPercent} 
                    color="text-purple-600"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue & Commission Trend</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenue?.byDay || []}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip formatter={(value) => `₹${value}`} />
                                <Legend />
                                <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="commission" name="Commission" stroke="#6366f1" fillOpacity={0.3} fill="#6366f1" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Booking Status Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Status</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={bookings?.byStatus || []}
                                    dataKey="count"
                                    nameKey="_id"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {(bookings?.byStatus || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bookings Over Time */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Bookings</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bookings?.byDay || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" name="Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Services Demand */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Services Demand</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bookings?.byService || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="_id" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="count" name="Bookings" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Workers & Complaints */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Workers */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Workers</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="pb-3 font-semibold text-gray-600">Name</th>
                                    <th className="pb-3 font-semibold text-gray-600">Rating</th>
                                    <th className="pb-3 font-semibold text-gray-600">Trust Score</th>
                                    <th className="pb-3 font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(workers?.topWorkers || []).map((w) => (
                                    <tr key={w._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                                        <td className="py-3">
                                            <div className="font-medium text-gray-800">{w.name}</div>
                                            <div className="text-xs text-gray-500 truncate w-32">{w.services?.join(', ')}</div>
                                        </td>
                                        <td className="py-3">
                                            <span className="flex items-center text-yellow-500 font-medium">
                                                ★ {w.averageRating?.toFixed(1) || '0.0'}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                                {w.trustScore}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span className={`w-2 h-2 rounded-full inline-block mr-2 ${w.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {w.isAvailable ? 'Active' : 'Offline'}
                                        </td>
                                    </tr>
                                ))}
                                {workers?.topWorkers?.length === 0 && (
                                    <tr><td colSpan="4" className="py-4 text-center text-gray-500">No top workers found for this period.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Complaint Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Complaint Status</h3>
                    <div className="h-80 flex flex-col justify-center items-center">
                        {complaints?.byStatus?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={complaints.byStatus}
                                        dataKey="count"
                                        nameKey="_id"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {complaints.byStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry._id === 'Resolved' ? '#10b981' : (entry._id === 'In Progress' ? '#f59e0b' : '#ef4444')} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500">No complaints in this period. Great job!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, growth, color }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <h4 className="text-gray-500 text-sm font-medium mb-1">{title}</h4>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            
            {growth !== null && (
                <div className={`mt-2 text-sm flex items-center ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {growth >= 0 ? (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    ) : (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
                    )}
                    <span className="font-medium">{Math.abs(growth).toFixed(1)}%</span>
                    <span className="text-gray-400 ml-1 font-normal">vs prev period</span>
                </div>
            )}
        </div>
    );
};

export default AdminAnalytics;
