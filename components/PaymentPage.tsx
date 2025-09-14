import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { createBooking } from '../api/client';
import LoadingSpinner from './LoadingSpinner';
import { BookingStatus } from '../types';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
};

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

const Breadcrumbs: React.FC = () => (
    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span>Kit Details</span>
        <span>&gt;</span>
        <span>Checkout</span>
        <span className="font-bold text-[#5E6D55]">&gt;</span>
        <span className="font-bold text-[#5E6D55]">Payment</span>
        <span>&gt;</span>
        <span>Confirmation</span>
    </div>
);

const ProcessingModal: React.FC<{ message: string }> = ({ message }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50 p-4 text-center">
        <div className="bg-[#F9F8F4] dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5E6D55] dark:border-[#a6c19a] mx-auto"></div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-6">{message}</p>
        </div>
    </div>
);


const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const [bookingState, setBookingState] = useState<any>(null);
    const [isStateLoaded, setIsStateLoaded] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    
    // Card details state
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    
    // UPI state
    const [upiId, setUpiId] = useState('');

    // Net Banking state
    const [selectedBank, setSelectedBank] = useState('');
    const popularBanks = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank'];
    
    useEffect(() => {
        const stateJSON = sessionStorage.getItem('bookingState');
        if (stateJSON) {
            const state = JSON.parse(stateJSON);
            setBookingState(state);
            setCardName(state.deliveryDetails?.fullName || '');
        }
        setIsStateLoaded(true);
    }, []);

    const { kit, date, nights, finalPrice, user, deliveryDetails, selectedAddOns, whatsAppUpdates } = bookingState || {};

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        const formattedValue = value.replace(/(.{4})/g, '$1 ').trim(); // Add spaces every 4 digits
        if (formattedValue.length <= 19) {
            setCardNumber(formattedValue);
        }
    };
    
    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        let formattedValue = value;
        if (value.length > 2) {
            formattedValue = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
        }
        if (formattedValue.length <= 5) {
            setExpiry(formattedValue);
        }
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 3) {
            setCvv(value);
        }
    };
    
    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (paymentMethod === 'upi' && !upiId) {
            alert('Please enter your UPI ID.');
            return;
        }
        if (paymentMethod === 'netbanking' && !selectedBank) {
            alert('Please select your bank.');
            return;
        }
        
        setIsProcessing(true);

        if (paymentMethod === 'netbanking') {
            const updatedState = { ...bookingState, selectedBank };
            sessionStorage.setItem('bookingState', JSON.stringify(updatedState));
            navigate('/payment-redirect', { replace: true });
            return; 
        }

        try {
            // Simulate real-time processing for Card & UPI
            setProcessingMessage('Initiating secure transaction...');
            await simulateDelay(1500);
            setProcessingMessage('Contacting your bank...');
            await simulateDelay(2000);
            setProcessingMessage('Awaiting confirmation...');


            const bookingId = await createBooking({
                userEmail: user.email,
                kit,
                date,
                nights,
                totalPrice: finalPrice,
                deliveryDetails,
                selectedAddOns,
                // Fix: Added missing 'whatsAppUpdates' property to satisfy the Booking type.
                whatsAppUpdates: whatsAppUpdates ?? true,
            }, BookingStatus.CONFIRMED);
            
            setProcessingMessage('Payment successful!');
            await simulateDelay(1000);

            navigate('/confirmation', {
                state: {
                    kit,
                    name: deliveryDetails.fullName,
                    date,
                    nights,
                    bookingId,
                    totalPrice: finalPrice,
                    phone: deliveryDetails.phone,
                    isPending: false,
                    // Fix: Pass 'whatsAppUpdates' to the confirmation page.
                    whatsAppUpdates: whatsAppUpdates ?? true,
                },
                replace: true
            });
        } catch (error) {
            console.error("Payment and booking failed:", error);
            alert('There was an error confirming your booking. Please try again.');
            setIsProcessing(false);
            setProcessingMessage('');
        }
    };
    
    if (!isStateLoaded) {
      return <LoadingSpinner />;
    }

    if (!bookingState) {
        return <Navigate to="/browse" replace />;
    }
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=w3@okhdfc&pn=W3&am=${finalPrice}&cu=INR`;
    
    const getButtonText = () => {
        if (paymentMethod === 'netbanking') {
            return 'Proceed to Bank';
        }
        return `Pay Securely (${formatCurrency(finalPrice)})`;
    };

    return (
        <>
        {isProcessing && paymentMethod !== 'netbanking' && <ProcessingModal message={processingMessage} />}
        <div className="w-full max-w-7xl mx-auto p-4 my-8">
            <div className="bg-[#F9F8F4] dark:bg-gray-900 rounded-[40px] shadow-2xl p-6 sm:p-10">
                <Breadcrumbs />
                <h1 className="text-3xl font-bold text-center text-[#4A4A4A] dark:text-gray-200 mb-8">Secure Payment</h1>

                <form onSubmit={handlePayment}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Side: Payment Form */}
                        <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 p-6 rounded-2xl">
                             <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                                <button type="button" onClick={() => setPaymentMethod('card')} className={`px-4 py-2 font-semibold transition-colors ${paymentMethod === 'card' ? 'text-[#5E6D55] border-b-2 border-[#5E6D55]' : 'text-gray-500 dark:text-gray-400'}`}>Credit/Debit Card</button>
                                <button type="button" onClick={() => setPaymentMethod('upi')} className={`px-4 py-2 font-semibold transition-colors ${paymentMethod === 'upi' ? 'text-[#5E6D55] border-b-2 border-[#5E6D55]' : 'text-gray-500 dark:text-gray-400'}`}>UPI</button>
                                <button type="button" onClick={() => setPaymentMethod('netbanking')} className={`px-4 py-2 font-semibold transition-colors ${paymentMethod === 'netbanking' ? 'text-[#5E6D55] border-b-2 border-[#5E6D55]' : 'text-gray-500 dark:text-gray-400'}`}>Net Banking</button>
                             </div>
                             
                             {paymentMethod === 'card' && (
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number</label>
                                        <input type="text" id="cardNumber" value={cardNumber} onChange={handleCardNumberChange} placeholder="0000 0000 0000 0000" required className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E6D55] dark:bg-gray-700 dark:text-white"/>
                                    </div>
                                    <div>
                                        <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cardholder Name</label>
                                        <input type="text" id="cardName" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="John Doe" required className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E6D55] dark:bg-gray-700 dark:text-white"/>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                                            <input type="text" id="expiry" value={expiry} onChange={handleExpiryChange} placeholder="MM/YY" required className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E6D55] dark:bg-gray-700 dark:text-white"/>
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                                            <input type="text" id="cvv" value={cvv} onChange={handleCvvChange} placeholder="123" required className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E6D55] dark:bg-gray-700 dark:text-white"/>
                                        </div>
                                    </div>
                                </div>
                             )}

                             {paymentMethod === 'upi' && (
                                <div className="text-center p-4">
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">Scan the QR code with your UPI app</p>
                                    <img src={qrCodeUrl} alt="UPI QR Code" className="mx-auto w-40 h-40 rounded-lg shadow-md mb-4"/>
                                    <div className="flex items-center my-6">
                                        <hr className="flex-grow border-gray-300 dark:border-gray-600"/>
                                        <span className="px-4 text-gray-500 dark:text-gray-400">OR</span>
                                        <hr className="flex-grow border-gray-300 dark:border-gray-600"/>
                                    </div>
                                    <div>
                                        <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">Enter your UPI ID</label>
                                        <input type="text" id="upiId" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@bank" required className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E6D55] dark:bg-gray-700 dark:text-white"/>
                                    </div>
                                </div>
                             )}

                             {paymentMethod === 'netbanking' && (
                                <div className="p-4">
                                     <label htmlFor="bankSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select your bank</label>
                                     <select id="bankSelect" value={selectedBank} onChange={e => setSelectedBank(e.target.value)} required className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E6D55] dark:bg-gray-700 dark:text-white">
                                        <option value="" disabled>-- Choose a bank --</option>
                                        {popularBanks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                                     </select>
                                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">You will be securely redirected to your bank's portal to complete the payment.</p>
                                </div>
                             )}
                        </div>
                        
                        {/* Right Side: Order Summary */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-2xl">
                                <h2 className="text-xl font-bold text-[#4A4A4A] dark:text-gray-200 mb-4">Order Summary</h2>
                                <div className="flex items-center gap-4">
                                    <img src={kit.imageUrl} alt={kit.name} className="w-24 h-24 object-cover rounded-lg"/>
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-200">{kit.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Start: {new Date(date + 'T00:00:00').toLocaleDateString('en-GB')}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{nights} Night(s)</p>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                                <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-gray-100">
                                    <span>Total to Pay</span>
                                    <span>{formatCurrency(finalPrice)}</span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full text-center bg-[#5E6D55] text-white font-bold py-4 px-6 rounded-2xl text-lg hover:bg-[#4a5744] transition-all duration-300 shadow-lg active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                disabled={isProcessing}
                            >
                                {isProcessing && paymentMethod !== 'netbanking' ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : getButtonText()}
                            </button>
                        </div>
                    </div>
                </form>
                <div className="text-center mt-8">
                    <Link 
                        to="/checkout"
                        className="text-sm text-gray-600 hover:text-[#5E6D55] hover:underline dark:text-gray-400"
                    >
                        &larr; Back to Checkout Details
                    </Link>
                </div>
            </div>
        </div>
        </>
    );
};

export default PaymentPage;