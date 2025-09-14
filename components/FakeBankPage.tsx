import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { createBooking } from '../api/client';
import { BookingStatus } from '../types';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
};

const FakeBankPage: React.FC = () => {
    const navigate = useNavigate();
    const [bookingState, setBookingState] = useState<any>(null);
    const [isStateLoaded, setIsStateLoaded] = useState(false);
    const [status, setStatus] = useState<'idle' | 'processing' | 'failed'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const stateJSON = sessionStorage.getItem('bookingState');
        if (stateJSON) {
            setBookingState(JSON.parse(stateJSON));
        }
        setIsStateLoaded(true);
    }, []);

    const handlePaymentAction = async (isSuccess: boolean) => {
        if (!isSuccess) {
            setStatus('failed');
            setErrorMessage('Payment was declined by the user.');
            return;
        }

        setStatus('processing');
        const { kit, date, nights, finalPrice, user, deliveryDetails, selectedAddOns, whatsAppUpdates } = bookingState;

        try {
            const bookingId = await createBooking({
                userEmail: user.email, kit, date, nights,
                totalPrice: finalPrice, deliveryDetails, selectedAddOns,
                // Fix: Added missing 'whatsAppUpdates' property to satisfy the Booking type.
                whatsAppUpdates: whatsAppUpdates ?? true,
            }, BookingStatus.CONFIRMED);

            navigate('/confirmation', {
                state: {
                    kit, name: deliveryDetails.fullName, date, nights, bookingId,
                    totalPrice: finalPrice, phone: deliveryDetails.phone, isPending: false,
                    // Fix: Pass 'whatsAppUpdates' to the confirmation page.
                    whatsAppUpdates: whatsAppUpdates ?? true,
                },
                replace: true
            });
        } catch (err) {
            console.error("Booking creation failed from bank page:", err);
            setStatus('failed');
            setErrorMessage('An unexpected error occurred. Please try again.');
        }
    };

    if (!isStateLoaded) {
        return <div className="min-h-screen flex items-center justify-center"></div>; // Or a loading spinner
    }

    if (!bookingState) {
        return <Navigate to="/payment" replace />;
    }

    return (
        <div className="w-full max-w-7xl mx-auto flex items-center justify-center p-4 min-h-screen">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <header className="bg-gray-100 dark:bg-gray-700 p-4 text-center">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {bookingState.selectedBank} Net Banking
                    </h1>
                </header>
                <main className="p-8">
                    {status === 'failed' ? (
                        <div className="text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-2xl font-bold text-red-500 mt-4">Payment Failed</h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">{errorMessage}</p>
                            <Link to="/payment" className="bg-[#5E6D55] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#4a5744] transition-colors">
                                Return to Payment
                            </Link>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 dark:text-gray-400 text-center">You are paying</p>
                            <p className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200 my-2">
                                {formatCurrency(bookingState.finalPrice)}
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-center text-sm mb-8">
                                to <strong>W3</strong>
                            </p>
                            <div className="space-y-4">
                                <button
                                    onClick={() => handlePaymentAction(true)}
                                    disabled={status === 'processing'}
                                    className="w-full bg-green-600 text-white font-bold py-4 rounded-lg text-lg hover:bg-green-700 transition-colors disabled:bg-green-400 flex items-center justify-center"
                                >
                                    {status === 'processing' && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                    {status === 'processing' ? 'Processing...' : 'Confirm Payment'}
                                </button>
                                <button
                                    onClick={() => handlePaymentAction(false)}
                                    disabled={status === 'processing'}
                                    className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300"
                                >
                                    Cancel Payment
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default FakeBankPage;