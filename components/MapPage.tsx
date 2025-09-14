import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TOURIST_LOCATIONS } from '../mapData';
import { TouristLocation, MapMarkerData, MarkerType } from '../types';

const MarkerIcon: React.FC<{ type: MarkerType }> = ({ type }) => {
    if (type === MarkerType.TENT) {
        return <span role="img" aria-label="Tent Spot">⛺</span>;
    }
    return <span role="img" aria-label="Cooking Zone">🔥</span>;
};


const MapPage: React.FC = () => {
    const [selectedLocationId, setSelectedLocationId] = useState<string>(TOURIST_LOCATIONS[0].id);
    const [activeMarker, setActiveMarker] = useState<MapMarkerData | null>(null);
    const [activeSidebarTab, setActiveSidebarTab] = useState<'destinations' | 'favorites'>('destinations');
    const [likedMarkers, setLikedMarkers] = useState<string[]>(() => {
        return JSON.parse(localStorage.getItem('w3-liked-markers') || '[]');
    });
    const navigate = useNavigate();

    const selectedLocation = useMemo(() => {
        return TOURIST_LOCATIONS.find(loc => loc.id === selectedLocationId)!;
    }, [selectedLocationId]);

    const likedSpots = useMemo(() => {
        const spots: { location: TouristLocation; marker: MapMarkerData }[] = [];
        TOURIST_LOCATIONS.forEach(location => {
            location.markers.forEach(marker => {
                if (likedMarkers.includes(marker.id)) {
                    spots.push({ location, marker });
                }
            });
        });
        return spots;
    }, [likedMarkers]);

    const handleLocationSelect = (id: string) => {
        setSelectedLocationId(id);
        setActiveMarker(null);
    };

    const handleMarkerClick = (e: React.MouseEvent, marker: MapMarkerData) => {
        e.stopPropagation();
        setActiveMarker(marker);
    };

    const handleClosePopup = () => {
        setActiveMarker(null);
    };
    
    const handleToggleLike = (markerId: string) => {
        setLikedMarkers(prev => {
            const newLikedMarkers = prev.includes(markerId)
                ? prev.filter(id => id !== markerId)
                : [...prev, markerId];
            localStorage.setItem('w3-liked-markers', JSON.stringify(newLikedMarkers));
            return newLikedMarkers;
        });
    };
    
    const handleFavoriteClick = (locationId: string, marker: MapMarkerData) => {
        handleLocationSelect(locationId);
        setActiveMarker(marker);
    };

    const handlePlanTrip = () => {
        if (selectedLocation) {
            navigate('/browse', { 
                state: { preselectActivity: selectedLocation.activityType } 
            });
        }
    };


    return (
        <div className="w-full max-w-7xl mx-auto p-4 my-8">
            <div className="bg-[#F9F8F4] dark:bg-gray-900 rounded-[40px] shadow-2xl overflow-hidden">
                <header className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-3xl font-bold text-center text-[#4A4A4A] dark:text-gray-200">Explore Camp Sites</h1>
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-1">Discover and save the best spots for your next adventure.</p>
                </header>
                
                <div className="flex flex-col lg:flex-row min-h-[70vh]">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-1/3 xl:w-1/4 p-6 bg-white/50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                            <button
                                onClick={() => setActiveSidebarTab('destinations')}
                                className={`w-1/2 py-2 text-md font-semibold transition-colors ${activeSidebarTab === 'destinations' ? 'text-[#5E6D55] border-b-2 border-[#5E6D55]' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Destinations
                            </button>
                            <button
                                onClick={() => setActiveSidebarTab('favorites')}
                                className={`w-1/2 py-2 text-md font-semibold transition-colors ${activeSidebarTab === 'favorites' ? 'text-[#5E6D55] border-b-2 border-[#5E6D55]' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Favorites ({likedSpots.length})
                            </button>
                        </div>
                        
                        {activeSidebarTab === 'destinations' && (
                            <div className="space-y-3">
                                {TOURIST_LOCATIONS.map(location => (
                                    <button
                                        key={location.id}
                                        onClick={() => handleLocationSelect(location.id)}
                                        className={`w-full text-left p-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#5E6D55] ${selectedLocationId === location.id ? 'bg-[#5E6D55] text-white shadow-lg' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    >
                                        <h3 className="font-semibold">{location.name}</h3>
                                        <p className={`text-sm ${selectedLocationId === location.id ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{location.description}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {activeSidebarTab === 'favorites' && (
                            <div className="space-y-3">
                                {likedSpots.length > 0 ? (
                                    likedSpots.map(({ location, marker }) => (
                                        <button
                                            key={marker.id}
                                            onClick={() => handleFavoriteClick(location.id, marker)}
                                            className="w-full text-left p-4 rounded-xl transition-colors duration-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                                <MarkerIcon type={marker.type} /> {marker.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{location.name}</p>
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                         <p className="text-gray-500 dark:text-gray-400">Click the heart on a spot to save it here.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </aside>

                    {/* Map View */}
                    <main className="flex-1 p-6 relative" onClick={handleClosePopup}>
                        <div
                            className="w-full h-full bg-cover bg-center rounded-2xl shadow-inner overflow-hidden relative"
                            style={{ backgroundImage: `url(${selectedLocation.mapImageUrl})` }}
                            role="application"
                            aria-label={`Map of ${selectedLocation.name}`}
                        >
                            {selectedLocation.markers.map(marker => (
                                <button
                                    key={marker.id}
                                    onClick={(e) => handleMarkerClick(e, marker)}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 text-3xl transition-transform duration-300 hover:scale-125 focus:outline-none"
                                    style={{ top: marker.coordinates.top, left: marker.coordinates.left }}
                                    aria-label={`View details for ${marker.title}`}
                                >
                                    <MarkerIcon type={marker.type} />
                                </button>
                            ))}

                            {activeMarker && (
                                <div
                                    className="absolute w-64 bg-[#F9F8F4] dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300"
                                    style={{ 
                                        top: `calc(${activeMarker.coordinates.top} - 80px)`, 
                                        left: `calc(${activeMarker.coordinates.left} + 20px)`,
                                        animation: 'fadeIn 0.3s ease-out'
                                    }}
                                    onClick={e => e.stopPropagation()}
                                    role="dialog"
                                    aria-labelledby="marker-title"
                                >
                                     <button 
                                        onClick={handleClosePopup} 
                                        className="absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        aria-label="Close popup"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 id="marker-title" className="font-bold text-lg text-[#4A4A4A] dark:text-gray-200 flex items-center gap-2 pr-2">
                                            <MarkerIcon type={activeMarker.type} />
                                            {activeMarker.title}
                                        </h4>
                                        <button
                                            onClick={() => handleToggleLike(activeMarker.id)}
                                            className="p-1 rounded-full text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                            aria-label={likedMarkers.includes(activeMarker.id) ? "Unlike this spot" : "Like this spot"}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={likedMarkers.includes(activeMarker.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: likedMarkers.includes(activeMarker.id) ? '#ef4444' : 'inherit' }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activeMarker.description}</p>
                                    <button
                                        onClick={handlePlanTrip}
                                        className="w-full mt-4 bg-[#5E6D55] text-white text-sm font-semibold py-2 px-3 rounded-lg hover:bg-[#4a5744] transition-colors"
                                    >
                                        Plan Trip Here
                                    </button>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
                 <div className="text-center p-6 border-t border-gray-200 dark:border-gray-700">
                    <Link to="/" className="text-[#5E6D55] hover:underline font-semibold transition duration-300 dark:text-[#a6c19a]">
                    &larr; Back to Home
                    </Link>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default MapPage;