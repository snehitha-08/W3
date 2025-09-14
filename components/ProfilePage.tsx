import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getKits, getPastBookings, Booking } from '../api/client';
import KitCard from './KitCard';
import LoadingSpinner from './LoadingSpinner';
import { Kit, BookingStatus } from '../types';
import { useAuth } from '../hooks/useAuth';

const PastBookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
    const navigate = useNavigate();
    const startDate = new Date(booking.date + 'T00:00:00');
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + booking.nights);
    
    const status = booking.status;
    const isPending = status === BookingStatus.PENDING;
    
    const dateString = `${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    
    const handleCardClick = () => {
        if (isPending) {
            navigate('/confirmation', {
                state: {
                    kit: booking.kit,
                    name: booking.deliveryDetails.fullName,
                    date: booking.date,
                    nights: booking.nights,
                    bookingId: booking.bookingId,
                    totalPrice: booking.totalPrice,
                    phone: booking.deliveryDetails.phone,
                    isPending: true,
                },
            });
        }
    };
    
    const cardClassName = `flex items-start sm:items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm ${isPending ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors' : ''}`;
    
    const getStatusClasses = () => {
        switch(status) {
            case BookingStatus.PENDING:
                return 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300';
            case BookingStatus.COMPLETED:
                return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
            case BookingStatus.CANCELLED:
                return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
            default: // Confirmed, Dispatched, etc.
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
        }
    }
    
    return (
        <div 
            className={cardClassName} 
            onClick={handleCardClick} 
            role={isPending ? "button" : "listitem"} 
            tabIndex={isPending ? 0 : -1} 
            onKeyDown={(e) => { if (isPending && (e.key === 'Enter' || e.key === ' ')) handleCardClick(); }}
            aria-label={isPending ? `Complete payment for booking ${booking.bookingId}` : `View details for booking ${booking.bookingId}`}
        >
            <img src={booking.kit.imageUrl} alt={booking.kit.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0" />
            <div className="flex-grow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1 sm:mb-0">{booking.kit.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getStatusClasses()}`}>
                        {status}
                    </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{dateString}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">ID: {booking.bookingId}</p>
                {isPending && (
                    <div className="mt-2">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            Complete Payment
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};


const ProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('bookings');
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [allKits, setAllKits] = useState<Kit[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const navigate = useNavigate();
    const { logout, getUser, isUserAdmin } = useAuth();
    const user = getUser();

    useEffect(() => {
        const storedWishlist = JSON.parse(localStorage.getItem('w3-wishlist') || '[]');
        setWishlist(storedWishlist);

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch kits for wishlist display
                const kits = await getKits();
                setAllKits(kits);

                // Fetch bookings for the current user
                if (user?.email) {
                    const userBookings = await getPastBookings(user.email);
                    setBookings(userBookings);
                }
            } catch (error) {
                console.error("Failed to fetch profile data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);
    
    const handleLogout = () => {
        logout(() => {
            navigate('/');
        });
    };

    const handleToggleWishlist = (kitId: string) => {
        setWishlist(prev => {
            const newWishlist = prev.includes(kitId)
                ? prev.filter(id => id !== kitId)
                : [...prev, kitId];
            localStorage.setItem('w3-wishlist', JSON.stringify(newWishlist));
            return newWishlist;
        });
    };

    const wishlistedKits = allKits.filter(kit => wishlist.includes(kit.id));

    return (
        <div className="w-full max-w-7xl mx-auto p-4 my-8">
            <div className="bg-[#F9F8F4] dark:bg-gray-900 rounded-[40px] shadow-2xl p-6 sm:p-10">
                <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 dark:text-gray-300">
                           {user?.fullName?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Hello, {user?.fullName || 'Adventurer'}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isUserAdmin && (
                            <Link to="/admin" className="bg-[#5E6D55] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#4a5744] transition-colors">
                                Admin Dashboard
                            </Link>
                        )}
                        <button onClick={handleLogout} className="bg-[#8A9AAB] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#6e7b88] transition-colors">
                            Logout
                        </button>
                    </div>
                </header>
                <nav className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
                    <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'bookings' ? 'text-[#5E6D55] border-b-2 border-[#5E6D55]' : 'text-gray-500 dark:text-gray-400'}`}>My Bookings</button>
                    <button onClick={() => setActiveTab('wishlist')} className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'wishlist' ? 'text-[#5E6D55] border-b-2 border-[#5E6D55]' : 'text-gray-500 dark:text-gray-400'}`}>Wishlist</button>
                </nav>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {activeTab === 'bookings' && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">Your Bookings</h2>
                                {isLoading ? (
                                    <LoadingSpinner />
                                ) : bookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {bookings.map(booking => <PastBookingCard key={booking.bookingId} booking={booking} />)}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
                                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">✈️ No Bookings Yet</h2>
                                        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Your next adventure is just a click away!</p>
                                        <Link
                                            to="/browse"
                                            className="inline-block bg-[#5E6D55] text-white font-semibold py-3 px-8 rounded-xl text-lg hover:bg-[#4a5744] transition-transform transform hover:scale-105 duration-300 shadow-lg"
                                        >
                                            Book an Adventure
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'wishlist' && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">Your Wishlist</h2>
                                {isLoading ? (
                                    <LoadingSpinner />
                                ) : wishlistedKits.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {wishlistedKits.map(kit => (
                                            <KitCard 
                                                key={kit.id} 
                                                kit={kit} 
                                                isWishlisted={wishlist.includes(kit.id)}
                                                onToggleWishlist={handleToggleWishlist}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
                                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">🤍 Your Wishlist is Empty</h2>
                                        <p className="text-gray-500 dark:text-gray-400 mt-2">Add kits you love to see them here.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm text-center">
                            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Loyalty Points</h3>
                            <p className="text-6xl font-bold text-[#D9BFA9] my-4">{user?.loyaltyPoints || 0}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Use your points for discounts at checkout!</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;