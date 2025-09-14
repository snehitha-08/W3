import React, { useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Kit } from '../types';

interface ConfirmationState {
  kit: Kit;
  name: string;
  date: string;
  nights: number;
  bookingId: string;
  totalPrice?: number;
  phone: string;
  isPending?: boolean;
  whatsAppUpdates?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
};


const ConfirmationPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as ConfirmationState | null;

  useEffect(() => {
    // Clear the booking state from session storage once the booking is confirmed
    if (state && !state.isPending) {
        sessionStorage.removeItem('bookingState');
    }
  }, [state]);

  if (!state) {
    return <Navigate to="/" replace />;
  }

  const { kit, name, date, nights, bookingId, totalPrice, phone, isPending, whatsAppUpdates } = state;

  if (isPending) {
     // Razorpay.me user pages don't support amount/description parameters.
     // The user must enter the details manually. The '@' is required for this user's page.
     const razorpayUrl = `https://razorpay.me/@snehithaposina`;

     return (
        <div className="w-full max-w-7xl mx-auto p-4 my-8">
            <div className="bg-[#F9F8F4] dark:bg-gray-900 rounded-[40px] shadow-2xl p-6 sm:p-10 text-center">
                <div className="mb-4">
                    <svg className="w-24 h-24 mx-auto text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-[#4A4A4A] dark:text-gray-200">Booking Pending Payment</h1>
                <p className="text-md text-gray-500 dark:text-gray-400 mt-2 mb-8">Please complete the payment to confirm your adventure.</p>

                <div className="bg-white/80 dark:bg-gray-800/80 max-w-4xl mx-auto p-6 md:p-8 rounded-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-left">
                        {/* Left Side: Summary Card */}
                        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                            <img src={kit.imageUrl} alt={kit.name} className="w-full h-40 object-cover rounded-xl mb-4"/>
                            <h3 className="text-lg font-bold text-[#4A4A4A] dark:text-gray-200 uppercase">{kit.name}</h3>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                <p><strong>Start:</strong> {new Date(date + 'T00:00:00').toLocaleDateString('en-GB')}</p>
                                <p><strong>Nights:</strong> {nights}</p>
                            </div>
                            {totalPrice && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 flex justify-between items-center">
                                    <span className="font-bold">Total Cost:</span>
                                    <span className="font-bold text-lg">{formatCurrency(totalPrice)}</span>
                                </div>
                            )}
                        </div>

                        {/* Right Side: Payment Details */}
                        <div className="md:col-span-3">
                            <p className="text-md text-gray-600 dark:text-gray-300">
                                Thank you, {name}! Your booking is almost ready.
                            </p>
                            <div className="my-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 p-4 rounded-xl text-left">
                                <h4 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-2">Action Required: Complete Your Payment</h4>
                                {totalPrice && <p className="text-yellow-700 dark:text-yellow-300">To confirm your booking, please pay the total amount of <strong className="text-xl">{formatCurrency(totalPrice)}</strong> using the link below.</p>}
                                <a 
                                    href={razorpayUrl}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block w-full text-center bg-[#25a6e9] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#1e85bb] transition duration-300 my-4 text-lg"
                                >
                                    Pay Now via Razorpay
                                </a>
                                {totalPrice && <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    <strong>Note:</strong> You will be redirected to Razorpay. Please manually enter the total amount of <strong className="font-bold">{formatCurrency(totalPrice)}</strong> and enter your Booking ID <strong className="font-mono bg-yellow-200/50 dark:bg-yellow-800/50 px-2 py-1 rounded">{bookingId}</strong> in the payment description.
                                </p>}
                            </div>
                            <div className="my-4 bg-[#5E6D55] dark:bg-[#4a5744] text-white p-4 rounded-xl text-center">
                                <p className="text-sm opacity-80">Your Booking ID</p>
                                <p className="text-2xl font-bold tracking-widest">{bookingId}</p>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">Once paid, our team will verify the payment and update your booking status to 'Confirmed'. You can check the status on your profile page.</p>

                            <div className="mt-8">
                                <Link to="/profile" className="block w-full text-center bg-[#D9BFA9] text-[#4A4A4A] font-bold py-3 px-6 rounded-xl hover:bg-[#c8b09a] transition duration-300">View My Bookings</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }


  return (
    <div className="w-full max-w-7xl mx-auto p-4 my-8">
      <div className="bg-[#F9F8F4] dark:bg-gray-900 rounded-[40px] shadow-2xl p-6 sm:p-10 text-center">
        <div className="mb-4">
            <svg className="w-24 h-24 mx-auto text-[#5E6D55]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#4A4A4A] dark:text-gray-200">Booking Confirmed, {name}!</h1>
        <p className="text-md text-gray-500 dark:text-gray-400 mt-2 mb-8">Your adventure awaits!</p>

        <div className="bg-white/80 dark:bg-gray-800/80 max-w-4xl mx-auto p-6 md:p-8 rounded-3xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-left">
                {/* Left Side: Summary Card */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                    <img src={kit.imageUrl} alt={kit.name} className="w-full h-40 object-cover rounded-xl mb-4"/>
                    <h3 className="text-lg font-bold text-[#4A4A4A] dark:text-gray-200 uppercase">{kit.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{kit.description}</p>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        <p><strong>Start:</strong> {new Date(date + 'T00:00:00').toLocaleDateString('en-GB')}</p>
                        <p><strong>Nights:</strong> {nights}</p>
                    </div>
                     {totalPrice && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 flex justify-between items-center">
                            <span className="font-bold">Total Cost:</span>
                            <span className="font-bold text-lg">{formatCurrency(totalPrice)}</span>
                        </div>
                    )}
                </div>

                {/* Right Side: Details */}
                <div className="md:col-span-3">
                    <p className="text-md text-gray-600 dark:text-gray-300">Thank you for your booking, {name}!</p>
                    <div className="my-4 bg-[#5E6D55] dark:bg-[#4a5744] text-white p-4 rounded-xl text-center">
                        <p className="text-sm opacity-80">Your Booking ID</p>
                        <p className="text-2xl font-bold tracking-widest">{bookingId}</p>
                    </div>

                    <h4 className="text-lg font-bold text-[#4A4A4A] dark:text-gray-200 mt-6 mb-2">Order Summary</h4>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                        <div className="bg-[#5E6D55] h-2.5 rounded-full" style={{width: '100%'}}></div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                        <p><strong>Estimated Delivery:</strong> {new Date(date + 'T00:00:00').toLocaleDateString('en-GB')}</p>
                        <p className="mt-4">We will send the invoice to the number provided: <span className="font-semibold text-[#5E6D55] dark:text-[#a6c19a]">{phone}</span></p>
                        {whatsAppUpdates && (
                            <p className="mt-2 text-sm text-green-700 dark:text-green-300 flex items-center justify-start gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.49 3.51 1.38 5l-1.52 5.54 5.67-1.5c1.43.81 3.01 1.24 4.63 1.24h.01c5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.89-9.91-9.89zM17.18 14.45c-.18-.09-1.07-.53-1.24-.59-.17-.06-.29-.09-.42.09-.12.18-.47.59-.57.71-.11.12-.21.14-.39.05-.18-.09-1.25-.46-2.38-1.47-.88-.79-1.47-1.75-1.61-2.04-.14-.29-.02-.45.08-.59.09-.13.21-.32.31-.43.1-.11.13-.18.2-.31.06-.12.03-.23-.03-.32-.06-.09-.42-1.02-.57-1.39-.15-.38-.3-.32-.42-.32h-.38c-.12 0-.32.05-.48.23-.17.18-.65.64-.65 1.57 0 .93.67 1.83.76 1.95.09.12 1.32 2.01 3.2 2.82.46.19.82.31 1.1.4.52.17.98.14 1.35.09.41-.06 1.25-.51 1.42-1 .18-.49.18-.9.12-1-.05-.09-.18-.14-.38-.23z"/></svg>
                                You'll receive booking updates on WhatsApp.
                            </p>
                        )}
                    </div>

                    <div className="mt-8">
                        <Link to="/profile" className="block w-full text-center bg-[#D9BFA9] text-[#4A4A4A] font-bold py-3 px-6 rounded-xl hover:bg-[#c8b09a] transition duration-300">View My Bookings</Link>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;