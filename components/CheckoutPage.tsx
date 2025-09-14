import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { createBooking } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import { BookingStatus } from '../types';

declare const Razorpay: any;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
};

const Breadcrumbs: React.FC = () => (
    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span>Kit Details</span>
        <span className="font-bold text-[#5E6D55]">&gt;</span>
        <span className="font-bold text-[#5E6D55]">Checkout & Payment</span>
        <span>&gt;</span>
        <span>Confirmation</span>
    </div>
);


const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { getUser } = useAuth();
  const user = getUser();
  
  const [bookingState, setBookingState] = useState<any>(null);
  const [isStateLoaded, setIsStateLoaded] = useState(false);
  
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isLoading, setIsLoading] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [sendWhatsAppUpdates, setSendWhatsAppUpdates] = useState(true);

  useEffect(() => {
      const stateJSON = sessionStorage.getItem('bookingState');
      if (stateJSON) {
          setBookingState(JSON.parse(stateJSON));
      }
      setIsStateLoaded(true);
  }, []);

  useEffect(() => {
    if (user) {
        setFullName(user.fullName);
        setPhone(user.phone);
        setAddress(user.address);
    }
  }, [user]);

  const { kit, date, nights, totalPrice, selectedAddOns } = bookingState || {};
  
  const userPoints = user?.loyaltyPoints || 0;
  const DISCOUNT_AMOUNT = 50;
  const CAN_REDEEM = userPoints >= DISCOUNT_AMOUNT;

  const pointsDiscount = redeemPoints && CAN_REDEEM ? DISCOUNT_AMOUNT : 0;
  const finalPrice = Math.max(0, (totalPrice || 0) - pointsDiscount);


  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhone(value);
    }
  };

  const handleProceedToPayment = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user || !kit) {
      console.error("User or Kit data is missing.");
      alert("An unexpected error occurred. Please go back and try again.");
      setIsLoading(false);
      return;
    }
    
    if (deliveryMethod === 'delivery' && !address) {
      alert("Please provide a delivery address.");
      setIsLoading(false);
      return;
    }
    
    if (!fullName || !phone) {
        alert("Please fill in your name and phone number.");
        setIsLoading(false);
        return;
    }
    
    const deliveryDetails = { fullName, phone, address, deliveryMethod };

    const options = {
        key: "rzp_test_RGgcKKbLCjgEoc",
        amount: finalPrice * 100, // Amount in the smallest currency unit (paise)
        currency: "INR",
        name: "W3 - Wish World Wonders",
        description: `Booking for ${kit.name}`,
        image: "https://via.placeholder.com/150", // A URL for your logo
        handler: async (response: any) => {
            console.log('Payment successful:', response);
            try {
                const bookingId = await createBooking({
                    userEmail: user.email,
                    kit,
                    date,
                    nights,
                    totalPrice: finalPrice,
                    deliveryDetails,
                    selectedAddOns,
                    whatsAppUpdates: sendWhatsAppUpdates,
                }, BookingStatus.CONFIRMED);

                navigate('/confirmation', {
                    state: {
                        kit,
                        name: fullName,
                        date,
                        nights,
                        bookingId,
                        totalPrice: finalPrice,
                        phone,
                        isPending: false,
                        whatsAppUpdates: sendWhatsAppUpdates,
                    },
                    replace: true
                });

            } catch (bookingError) {
                console.error("Booking creation failed after payment:", bookingError);
                alert('Payment was successful, but we failed to confirm your booking. Please contact support.');
                setIsLoading(false);
            }
        },
        prefill: {
            name: fullName,
            email: user.email,
            contact: phone,
        },
        notes: {
            address: deliveryMethod === 'delivery' ? address : 'Self Pickup',
        },
        theme: {
            color: "#5E6D55"
        },
        modal: {
            ondismiss: () => {
                console.log('Razorpay modal dismissed.');
                setIsLoading(false); // Re-enable button if user closes modal
            }
        }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response: any){
        console.error('Payment failed:', response);
        alert(`Payment Failed: ${response.error.description}`);
        setIsLoading(false);
    });
    
    rzp.open();
  };

  if (!isStateLoaded) {
    return <LoadingSpinner />;
  }

  if (!bookingState) {
    return <Navigate to="/browse" replace />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 my-8">
      <div className="bg-[#F9F8F4] dark:bg-gray-900 rounded-[40px] shadow-2xl p-6 sm:p-10">
        <Breadcrumbs />
        <h1 className="text-3xl font-bold text-center text-[#4A4A4A] dark:text-gray-200 mb-8">Confirm & Pay</h1>
        
        <form onSubmit={handleProceedToPayment}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side - Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-[#4A4A4A] dark:text-gray-200 mb-4">Delivery Options</h2>
                <div className="flex space-x-4">
                  <label className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-colors ${deliveryMethod === 'delivery' ? 'border-[#5E6D55] bg-green-50 dark:bg-green-900/50' : 'border-gray-300 dark:border-gray-600'}`}>
                    <input type="radio" name="deliveryMethod" value="delivery" checked={deliveryMethod === 'delivery'} onChange={() => setDeliveryMethod('delivery')} className="sr-only" />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">🚚 Home Delivery</span>
                  </label>
                  <label className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-colors ${deliveryMethod === 'pickup' ? 'border-[#5E6D55] bg-green-50 dark:bg-green-900/50' : 'border-gray-300 dark:border-gray-600'}`}>
                    <input type="radio" name="deliveryMethod" value="pickup" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} className="sr-only" />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">📍 Self Pickup</span>
                  </label>
                </div>
              </div>
              
              <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-2xl space-y-4">
                <h2 className="text-xl font-bold text-[#4A4A4A] dark:text-gray-200 mb-4">Your Details</h2>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E6D55] dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input type="tel" id="phone" value={phone} onChange={handlePhoneChange} required maxLength={10} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E6D55] dark:bg-gray-700 dark:text-white" />
                </div>
                {deliveryMethod === 'delivery' && (
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Address</label>
                    <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} required rows={3} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E6D55] dark:bg-gray-700 dark:text-white"></textarea>
                  </div>
                )}
                {deliveryMethod === 'pickup' && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <strong>Pickup Point:</strong> Flat No:402, Brindavanam Apartments, Sri Maruthi Nagar Colony, Kondapur, HYDERABAD, TELANGANA 500084. <br/> We'll contact you with pickup details.
                    </div>
                )}
                 <div className="pt-2">
                    <label htmlFor="whatsapp-updates" className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            id="whatsapp-updates"
                            checked={sendWhatsAppUpdates}
                            onChange={(e) => setSendWhatsAppUpdates(e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-[#5E6D55] focus:ring-[#5E6D55]"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Send order confirmation & shipping updates to my WhatsApp.
                        </span>
                    </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-2xl">
                 <h2 className="text-xl font-bold text-[#4A4A4A] dark:text-gray-200 mb-4">Booking Summary</h2>
                 <div className="flex items-center gap-4">
                    <img src={kit.imageUrl} alt={kit.name} className="w-24 h-24 object-cover rounded-lg"/>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">{kit.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Start: {new Date(date + 'T00:00:00').toLocaleDateString('en-GB')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{nights} Night(s)</p>
                    </div>
                 </div>
                 <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                 <div className="space-y-2 text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between"><span>Base Price</span> <span className="font-semibold">{formatCurrency(totalPrice)}</span></div>
                    {pointsDiscount > 0 && <div className="flex justify-between text-green-600 dark:text-green-400"><span>Points Discount</span> <span className="font-semibold">-{formatCurrency(pointsDiscount)}</span></div>}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-gray-100"><span>Total</span> <span>{formatCurrency(finalPrice)}</span></div>
                 </div>

                 {CAN_REDEEM && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/50 p-4 rounded-lg mt-4 border border-yellow-200 dark:border-yellow-800">
                        <label htmlFor="redeemPoints" className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="redeemPoints"
                                    checked={redeemPoints}
                                    onChange={(e) => setRedeemPoints(e.target.checked)}
                                    className="h-5 w-5 rounded border-gray-300 text-[#D9BFA9] focus:ring-[#D9BFA9]"
                                />
                                <span className="ml-3 font-semibold text-gray-700 dark:text-gray-200">
                                    Apply Loyalty Discount
                                </span>
                            </div>
                            <span className="font-bold text-green-600 dark:text-green-400">
                                -{formatCurrency(DISCOUNT_AMOUNT)}
                            </span>
                        </label>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-8">
                            As a loyalty member, you get a special discount on every booking!
                        </p>
                    </div>
                  )}
              </div>
              <button
                type="submit"
                className="w-full text-center bg-[#5E6D55] text-white font-bold py-4 px-6 rounded-2xl text-lg hover:bg-[#4a5744] transition-all duration-300 shadow-lg active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isLoading}
              >
                  {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  {isLoading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </form>
        <div className="text-center mt-8">
            <Link to={`/details/${kit.id}`} className="text-sm text-gray-600 hover:text-[#5E6D55] hover:underline dark:text-gray-400">
                &larr; Back to Kit Details
            </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;