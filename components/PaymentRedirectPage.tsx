import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const PaymentRedirectPage: React.FC = () => {
    const navigate = useNavigate();
    const [bookingState, setBookingState] = useState<any>(null);
    const [isStateLoaded, setIsStateLoaded] = useState(false);

    useEffect(() => {
        const stateJSON = sessionStorage.getItem('bookingState');
        if (stateJSON) {
            setBookingState(JSON.parse(stateJSON));
        }
        setIsStateLoaded(true);
    }, []);
    
    useEffect(() => {
        if (!isStateLoaded || !bookingState) return;

        const timer = setTimeout(() => {
            navigate('/fake-bank', { replace: true });
        }, 2000); // Simulate 2-second redirect delay

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, [isStateLoaded, bookingState, navigate]);

    if (!isStateLoaded) {
      return <LoadingSpinner />;
    }
    
    if (!bookingState || !bookingState.selectedBank) {
        // Redirect if state is missing, which means user shouldn't be here
        return <Navigate to="/payment" replace />;
    }

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center p-4 min-h-screen text-center">
            <div className="bg-[#F9F8F4] dark:bg-gray-900 rounded-[40px] shadow-2xl p-6 sm:p-10">
                <h1 className="text-2xl font-bold text-[#4A4A4A] dark:text-gray-200 mb-2">Connecting to {bookingState.selectedBank}...</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">You are being securely redirected to complete your payment.</p>
                <LoadingSpinner />
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-8">Please do not close or refresh this page.</p>
            </div>
        </div>
    );
};

export default PaymentRedirectPage;
