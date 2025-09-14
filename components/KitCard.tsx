import React from 'react';
import { Link } from 'react-router-dom';
import type { Kit } from '../types';

interface KitCardProps {
  kit: Kit;
  isWishlisted: boolean;
  onToggleWishlist: (kitId: string) => void;
}

const KitCard: React.FC<KitCardProps> = ({ kit, isWishlisted, onToggleWishlist }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="relative">
        <img src={kit.imageUrl} alt={kit.name} className="w-full h-48 object-cover" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(kit.id);
          }}
          className="absolute top-3 right-3 bg-white/70 p-2 rounded-full backdrop-blur-sm hover:bg-white transition-colors focus:outline-none"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isWishlisted ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`} fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" />
          </svg>
        </button>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h2 className="text-lg font-bold text-[#4A4A4A] dark:text-gray-200 uppercase tracking-wide">{kit.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{kit.description}</p>
        <p className="text-md font-semibold text-[#4A4A4A] dark:text-gray-200 mb-4">{kit.price}</p>
        <Link
          to={`/details/${kit.id}`}
          className="mt-auto block text-center w-full bg-[#5E6D55] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#4a5744] transition duration-300"
        >
          Quick View
        </Link>
      </div>
    </div>
  );
};

export default KitCard;