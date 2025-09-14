import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBookings, updateBookingStatus, Booking } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { BookingStatus } from '../types';
import LoadingSpinner from './LoadingSpinner';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
};

const getStatusColor = (status: BookingStatus) => {
    switch (status) {
        case BookingStatus.PENDING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case BookingStatus.CONFIRMED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case BookingStatus.DISPATCHED: return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
        case BookingStatus.COMPLETED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case BookingStatus.CANCELLED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const AnalyticsCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; description: string; }> = ({ title, value, icon, description }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm flex items-start gap-4">
        <div className="bg-green-100 dark:bg-green-900/50 text-[#5E6D55] dark:text-green-300 rounded-full p-3">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{description}</p>
        </div>
    </div>
);

const AdminPage: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const { logout, getUser } = useAuth();
    const navigate = useNavigate();
    const user = getUser();

    useEffect(() => {
        const fetchBookings = async () => {
            setIsLoading(true);
            try {
                const allBookings = await getAllBookings();
                setBookings(allBookings);
            } catch (error) {
                console.error("Failed to fetch bookings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus) => {
        const success = await updateBookingStatus(bookingId, newStatus);
        if (success) {
            setBookings(prevBookings =>
                prevBookings.map(b =>
                    b.bookingId === bookingId ? { ...b, status: newStatus } : b
                )
            );
        } else {
            alert('Failed to update status. Please try again.');
        }
    };
    
    const analytics = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nonCancelledBookings = bookings.filter(b => b.status !== BookingStatus.CANCELLED);
        const totalRevenue = nonCancelledBookings.reduce((acc, b) => acc + b.totalPrice, 0);
        const activeBookings = bookings.filter(b => {
            const endDate = new Date(b.date);
            endDate.setDate(endDate.getDate() + b.nights);
            return endDate >= today && b.status !== BookingStatus.COMPLETED && b.status !== BookingStatus.CANCELLED;
        }).length;
        const kitCounts = nonCancelledBookings.reduce((acc, booking) => {
            const name = booking.kit.name;
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const mostPopularKit = Object.keys(kitCounts).length > 0
            ? Object.entries(kitCounts).sort((a, b) => b[1] - a[1])[0][0]
            : 'N/A';
            
        return { totalRevenue, activeBookings, mostPopularKit, allTimeBookings: bookings.length };
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        if (!searchTerm) return bookings;
        return bookings.filter(b =>
            b.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.deliveryDetails.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.kit.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [bookings, searchTerm]);


    const handleLogout = () => {
        logout(() => navigate('/'));
    };
    
    const renderDashboard = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard title="Total Revenue" value={formatCurrency(analytics.totalRevenue)} description="From all non-cancelled bookings" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v-1m0-6c-1.657 0-3 .895-3 2s1.343 2 3 2m0 0c1.11 0 2.08.402 2.599 1M15 9.599A3.98 3.98 0 0012.001 8m0 8a3.98 3.98 0 01-3-1.401" /></svg>} />
                <AnalyticsCard title="Active Bookings" value={analytics.activeBookings} description="Upcoming or in-progress" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <AnalyticsCard title="Most Popular Kit" value={analytics.mostPopularKit} description="Highest number of bookings" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>} />
                <AnalyticsCard title="All-Time Bookings" value={analytics.allTimeBookings} description="Total bookings created" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
            </div>
             <div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">Recent Activity</h3>
                <div className="space-y-2">
                    {bookings.slice(0, 5).map(b => (
                         <div key={b.bookingId} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{b.deliveryDetails.fullName} booked the {b.kit.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(b.createdAt).toLocaleString()}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(b.status)}`}>
                                {b.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
    
    const renderBookings = () => (
        <div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by ID, Customer Name, or Kit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E6D55] dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Booking ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Customer</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Kit</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Dates</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Total</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {filteredBookings.map(booking => (
                            <tr key={booking.bookingId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{booking.bookingId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{booking.deliveryDetails.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{booking.kit.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(booking.date + 'T00:00:00').toLocaleDateString('en-GB')} for {booking.nights} nights
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatCurrency(booking.totalPrice)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <select
                                        value={booking.status}
                                        onChange={(e) => handleStatusUpdate(booking.bookingId, e.target.value as BookingStatus)}
                                        className={`p-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5E6D55] dark:focus:ring-offset-gray-800 ${getStatusColor(booking.status)} border-transparent font-semibold`}
                                        aria-label={`Update status for booking ${booking.bookingId}`}
                                    >
                                        {Object.values(BookingStatus).map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredBookings.length === 0 && (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">No bookings found.</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto p-4 my-8">
            <div className="bg-[#F9F8F4] dark:bg-gray-900 rounded-[40px] shadow-2xl p-6 sm:p-10">
                <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Admin Panel</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 dark:text-gray-300">Welcome, {user?.fullName}</span>
                        <button onClick={handleLogout} className="bg-[#8A9AAB] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#6e7b88] transition-colors">Logout</button>
                    </div>
                </header>
                
                <nav className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
                    <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'dashboard' ? 'text-[#5E6D55] border-b-2 border-[#5E6D55]' : 'text-gray-500 dark:text-gray-400'}`}>Dashboard</button>
                    <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'bookings' ? 'text-[#5E6D55] border-b-2 border-[#5E6D55]' : 'text-gray-500 dark:text-gray-400'}`}>Bookings</button>
                </nav>

                <main>
                    {isLoading ? <LoadingSpinner /> : (
                        <>
                            {activeTab === 'dashboard' && renderDashboard()}
                            {activeTab === 'bookings' && renderBookings()}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminPage;