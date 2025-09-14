import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { getKit } from '../api/client';
import { ADD_ONS } from '../constants';
import { Kit, AddOn, AddOnCategory, PriceType } from '../types';
import Calendar from './Calendar';
import LoadingSpinner from './LoadingSpinner';

const parsePrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  const match = priceStr.match(/[\d,]+/);
  if (!match) return 0;
  return parseInt(match[0].replace(/,/g, ''), 10);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};


const AddOnItem: React.FC<{
  addOn: AddOn;
  quantity: number;
  onQuantityChange: (id: string, newQuantity: number) => void;
}> = ({ addOn, quantity, onQuantityChange }) => {
  const increment = () => onQuantityChange(addOn.id, quantity + 1);
  const decrement = () => onQuantityChange(addOn.id, Math.max(0, quantity - 1));

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
      <div className="flex items-center gap-3">
         <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
            <span className="text-lg">
              {addOn.category === AddOnCategory.ENTERTAINMENT_TECH && '📸'}
              {addOn.category === AddOnCategory.COOKING_FOOD && '🍳'}
              {addOn.category === AddOnCategory.GAMES_FUN && '🎲'}
              {addOn.category === AddOnCategory.COMFORT_UTILITY && '🛋️'}
              {addOn.category === AddOnCategory.LIGHTING_AMBIENCE && '💡'}
              {addOn.category === AddOnCategory.SAFETY_HEALTH && '🛡️'}
            </span>
         </div>
         <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{addOn.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatCurrency(addOn.price)}
            </p>
         </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={decrement} className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-bold transition-colors">-</button>
        <span className="w-5 text-center font-semibold">{quantity}</span>
        <button type="button" onClick={increment} className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-bold transition-colors">+</button>
      </div>
    </div>
  );
};

const SocialShare: React.FC<{ kitName: string }> = ({ kitName }) => {
  const shareUrl = window.location.href;
  const shareText = `Check out this awesome kit: ${kitName}!`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
  };

  return (
    <div className="mt-8 text-center">
      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-3">Share this Kit</h3>
      <div className="flex justify-center items-center gap-4">
        {/* Facebook */}
        <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-blue-600 hover:text-white transition-colors text-gray-700 dark:text-gray-300" aria-label="Share on Facebook">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06c0 5.52 4.5 10.02 10 10.02s10-4.5 10-10.02C22 6.53 17.5 2.04 12 2.04zM13.5 8H15v3h-1.5v7H11v-7H9V8h2V6.5c0-1.5 1-2.5 2.5-2.5H15v3h-1.5V8z"/></svg>
        </a>
        {/* Twitter */}
        <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-sky-500 hover:text-white transition-colors text-gray-700 dark:text-gray-300" aria-label="Share on Twitter">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm5.1 7.6c.01 0.15.01 0.3 0.01 0.46 0 4.6-3.5 9.9-9.9 9.9-1.97 0-3.8-0.58-5.34-1.56 0.28 0.03 0.55 0.05 0.83 0.05 1.63 0 3.13-0.55 4.33-1.49-1.52-0.03-2.8-1.03-3.25-2.42 0.21 0.04 0.43 0.06 0.65 0.06 0.32 0 0.62-0.04 0.91-0.12-1.59-0.32-2.79-1.72-2.79-3.41v-0.04c0.47 0.26 1 0.42 1.55 0.43-0.92-0.62-1.52-1.68-1.52-2.88 0-0.63 0.17-1.22 0.47-1.74 1.72 2.1 4.28 3.49 7.14 3.62-0.06-0.26-0.09-0.52-0.09-0.8 0-1.92 1.56-3.48 3.48-3.48 1 0 1.9 0.42 2.54 1.1 0.79-0.15 1.53-0.44 2.19-0.84-0.26 0.81-0.81 1.49-1.52 1.92 0.7-0.08 1.36-0.27 1.98-0.54-0.46 0.69-1.04 1.29-1.71 1.74z"/></svg>
        </a>
        {/* WhatsApp */}
        <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-green-500 hover:text-white transition-colors text-gray-700 dark:text-gray-300" aria-label="Share on WhatsApp">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18.24c-4.5 0-8.15-3.65-8.15-8.15s3.65-8.15 8.15-8.15 8.15 3.65 8.15 8.15-3.65 8.15-8.15 8.15zm3.83-5.2c-0.22-0.11-1.3-0.64-1.5-0.72-0.2-0.08-0.35-0.11-0.49 0.11-0.15 0.22-0.57 0.72-0.7 0.86-0.13 0.15-0.26 0.17-0.48 0.06-0.22-0.11-0.93-0.34-1.77-1.09-0.65-0.58-1.09-1.3-1.22-1.52-0.13-0.22 0-0.34 0.1-0.45 0.09-0.1 0.2-0.26 0.3-0.38 0.1-0.13 0.13-0.22 0.2-0.36 0.06-0.15 0.03-0.28-0.01-0.39-0.05-0.11-0.49-1.18-0.68-1.61-0.18-0.42-0.37-0.36-0.49-0.37-0.11-0.01-0.26-0.01-0.4-0.01-0.15 0-0.39 0.06-0.59 0.3-0.2 0.25-0.76 0.75-0.76 1.82 0 1.08 0.78 2.11 0.89 2.26 0.11 0.15 1.53 2.34 3.72 3.29 0.52 0.23 0.93 0.36 1.25 0.46 0.54 0.18 1.04 0.15 1.43 0.09 0.44-0.06 1.3-0.53 1.48-1.04 0.18-0.51 0.18-0.95 0.13-1.04-0.05-0.09-0.18-0.14-0.4-0.25z"/></svg>
        </a>
      </div>
    </div>
  );
};


const DetailsPage: React.FC = () => {
  const { kitId } = useParams<{ kitId: string }>();
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  
  const [kit, setKit] = useState<Kit | null | undefined>(null);
  const [dateRange, setDateRange] = useState<{ startDate: string | null; endDate: string | null }>(() => {
    if (locationState?.date && locationState?.nights) {
        const start = new Date(locationState.date + 'T00:00:00');
        const end = new Date(start);
        end.setDate(start.getDate() + locationState.nights);
        return {
            startDate: locationState.date,
            endDate: end.toISOString().split('T')[0]
        };
    }
    return { startDate: null, endDate: null };
  });

  const [selectedAddOns, setSelectedAddOns] = useState<{ [id: string]: number }>({});
  const [activeAddOnCategory, setActiveAddOnCategory] = useState<AddOnCategory | null>(null);

  useEffect(() => {
    const fetchKit = async () => {
      if (!kitId) return;
      const fetchedKit = await getKit(kitId);
      setKit(fetchedKit);
    };
    fetchKit();
  }, [kitId]);
  
  const { startDate, endDate } = dateRange;

  const nights = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime <= 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [startDate, endDate]);

  const handleProceedToCheckout = () => {
    if (kit && startDate && endDate && nights > 0) {
      const bookingState = {
        kit,
        selectedAddOns,
        date: startDate,
        nights,
        totalPrice
      };
      sessionStorage.setItem('bookingState', JSON.stringify(bookingState));
      navigate('/checkout');
    } else {
      alert("Please select a valid check-in and check-out date.");
    }
  };

  const kitPrice = useMemo(() => kit ? parsePrice(kit.price) : 0, [kit]);

  const addOnsTotal = useMemo(() => {
    return Object.entries(selectedAddOns).reduce((total, [id, quantity]) => {
      const addOn = ADD_ONS.find(a => a.id === id);
      if (!addOn || quantity <= 0) return total;
      const itemTotal = addOn.priceType === PriceType.PER_NIGHT ? addOn.price * nights : addOn.price * quantity;
      return total + itemTotal;
    }, 0);
  }, [selectedAddOns, nights]);

  const totalPrice = useMemo(() => {
    if (!kit || nights <= 0) return 0;
    return (kitPrice * nights) + addOnsTotal;
  }, [kit, kitPrice, nights, addOnsTotal]);
  
  if (kit === undefined) return <Navigate to="/browse" replace />;
  if (kit === null) return <LoadingSpinner />;

  const handleAddOnQuantityChange = (id: string, newQuantity: number) => {
    setSelectedAddOns(prev => ({ ...prev, [id]: newQuantity }));
  };
  
  const groupedAddOns = ADD_ONS.reduce((acc, addOn) => {
    (acc[addOn.category] = acc[addOn.category] || []).push(addOn);
    return acc;
  }, {} as Record<AddOnCategory, AddOn[]>);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 my-8">
      <div className="bg-[#F9F8F4] dark:bg-gray-900 rounded-[40px] shadow-2xl p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column */}
          <div>
            <Link to="/browse" className="text-sm text-gray-600 hover:text-[#5E6D55] dark:text-gray-400 mb-4 inline-block">&larr; Back to Browse</Link>
            <img src={kit.imageUrl} alt={kit.name} className="w-full h-80 object-cover rounded-3xl shadow-lg" />
            <h1 className="text-3xl font-bold text-[#4A4A4A] dark:text-gray-200 mt-6">{kit.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{kit.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {kit.features.map((feature, i) => <span key={i} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-green-900 dark:text-green-300">{feature}</span>)}
            </div>
            
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">What's Included</h2>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-gray-600 dark:text-gray-400">
                    {kit.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#5E6D55]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
             <SocialShare kitName={kit.name} />
          </div>

          {/* Right Column */}
          <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-3xl shadow-inner">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Plan Your Trip</h2>
            <div className="space-y-6">
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">1. Select Your Dates</label>
                <div className="grid grid-cols-2 gap-2 text-center mb-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm">
                    <div>
                        <span className="font-semibold text-gray-500 dark:text-gray-400">CHECK-IN</span>
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{startDate ? new Date(startDate + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Select'}</p>
                    </div>
                    <div className="border-l border-gray-300 dark:border-gray-600">
                        <span className="font-semibold text-gray-500 dark:text-gray-400">CHECK-OUT</span>
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{endDate ? new Date(endDate + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Select'}</p>
                    </div>
                </div>
                <Calendar 
                    startDate={startDate} 
                    endDate={endDate} 
                    onDatesChange={setDateRange}
                />
              </div>

              {nights > 0 && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/40 rounded-xl text-center border border-green-200 dark:border-green-800">
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{nights} Night{nights !== 1 ? 's' : ''} Selected</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">2. Add-Ons</h3>
                <div className="space-y-4">
                  {Object.entries(groupedAddOns).map(([category, addOns]) => (
                    <div key={category}>
                      <button type="button" onClick={() => setActiveAddOnCategory(c => c === category ? null : category as AddOnCategory)} className="w-full text-left p-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        {category}
                      </button>
                      {activeAddOnCategory === category && (
                        <div className="p-4 space-y-3 bg-white dark:bg-gray-800 border border-t-0 border-gray-200 dark:border-gray-600 rounded-b-lg">
                           {addOns.map(addOn => <AddOnItem key={addOn.id} addOn={addOn} quantity={selectedAddOns[addOn.id] || 0} onQuantityChange={handleAddOnQuantityChange} />)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Kit ({nights} {nights === 1 ? 'night' : 'nights'})</span><span>{formatCurrency(kitPrice * nights)}</span></div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Add-ons</span><span>{formatCurrency(addOnsTotal)}</span></div>
                <div className="flex justify-between font-bold text-xl text-gray-800 dark:text-gray-100"><span>Total Price</span><span>{formatCurrency(totalPrice)}</span></div>
              </div>
              <button
                onClick={handleProceedToCheckout}
                disabled={!startDate || !endDate || nights <= 0}
                className="w-full text-center bg-[#5E6D55] text-white font-bold py-4 px-6 rounded-2xl text-lg hover:bg-[#4a5744] transition-all duration-300 shadow-lg active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;