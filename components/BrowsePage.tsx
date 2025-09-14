import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getKits } from '../api/client';
import KitCard from './KitCard';
import LoadingSpinner from './LoadingSpinner';
import { ActivityType, Kit } from '../types';

const LogoHeader = () => (
  <div className="text-center text-[#4A4A4A] dark:text-gray-200 bg-[#F9F8F4] dark:bg-gray-800 py-6 px-8 rounded-t-[40px]">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-[#5E6D55]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3L2 12h3v8h14v-8h3L12 3z" />
      <path d="M9 21V15a1 1 0 011-1h4a1 1 0 011 1v6" />
    </svg>
    <h1 className="text-xl font-bold tracking-wider mt-2">W3</h1>
    <p className="text-xs text-gray-500 dark:text-gray-400">Wish World Wonders</p>
  </div>
);

const BrowsePage: React.FC = () => {
  const [kits, setKits] = useState<Kit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('w3-wishlist') || '[]');
  });

  useEffect(() => {
    const fetchKits = async () => {
      try {
        const fetchedKits = await getKits();
        setKits(fetchedKits);
      } catch (error) {
        console.error("Failed to fetch kits:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchKits();
  }, []);

  const handleToggleWishlist = (kitId: string) => {
    setWishlist(prev => {
      const newWishlist = prev.includes(kitId)
        ? prev.filter(id => id !== kitId)
        : [...prev, kitId];
      localStorage.setItem('w3-wishlist', JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  const toggleActivityFilter = (activity: ActivityType) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const filteredKits = selectedActivities.length === 0
    ? kits
    : kits.filter(kit =>
        kit.activityType.some(activity => selectedActivities.includes(activity))
      );

  const activityFilters = [ActivityType.CAMPING, ActivityType.BEACH, ActivityType.TREKKING, ActivityType.WINTER, ActivityType.EVENT, ActivityType.LAKESIDE];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 my-8">
      <div className="bg-[#F9F8F4] dark:bg-gray-900 rounded-[40px] shadow-2xl">
        <LogoHeader />
        
        <main className="px-6 sm:px-10 py-8">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {activityFilters.map(activity => (
              <button
                key={activity}
                onClick={() => toggleActivityFilter(activity)}
                className={`px-6 py-2 text-md font-semibold rounded-full transition-colors duration-300 focus:outline-none  ${
                  selectedActivities.includes(activity)
                    ? 'bg-[#5E6D55] text-white'
                    : 'bg-white text-[#4A4A4A] border border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
                aria-pressed={selectedActivities.includes(activity)}
              >
                {activity}
              </button>
            ))}
          </div>
          
          <h2 className="text-2xl font-bold text-center text-[#4A4A4A] dark:text-gray-200 mb-8">Browse Our Kits</h2>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredKits.length > 0 ? (
                filteredKits.map((kit) => (
                  <KitCard 
                      key={kit.id} 
                      kit={kit}
                      isWishlisted={wishlist.includes(kit.id)}
                      onToggleWishlist={handleToggleWishlist}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
                  <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">🏕️ No Kits Found</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters to find the perfect kit for your adventure.</p>
                </div>
              )}
            </div>
          )}
           <div className="text-center mt-12">
            <Link to="/" className="text-[#5E6D55] hover:underline font-semibold transition duration-300 dark:text-[#a6c19a]">
              Back to Home
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BrowsePage;