
import React, { useState } from 'react';
import { Laptop } from '../types';

interface LaptopCardProps {
  laptop: Laptop;
  onSellClick: (laptop: Laptop) => void;
  quantity?: number; 
}

const LaptopCard: React.FC<LaptopCardProps> = ({ laptop, onSellClick, quantity }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleSellClick = () => {
    onSellClick(laptop); 
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Fallback if Unsplash image fails or returns an error image
    e.currentTarget.src = `https://picsum.photos/seed/${laptop.id}/400/300`; 
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl animate-fadeIn">
      <div className="relative">
        <img 
          src={laptop.imageUrl || `https://picsum.photos/seed/${laptop.id}/400/300`} 
          alt={`${laptop.brand} ${laptop.model}`} 
          className="w-full h-48 object-cover" 
          onError={handleError} // Add onError handler
        />
        <div 
          className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold text-white rounded
                      ${laptop.condition === 'New' ? 'bg-green-500' : 'bg-yellow-500'}`}
        >
          {laptop.condition}
        </div>
        {quantity && quantity > 0 && (
            <div className="absolute top-2 left-2 bg-primary text-white text-xs font-semibold px-2 py-1 rounded">
                QTY: {quantity}
            </div>
        )}
      </div>
      
      <div className="p-4">
        <div onClick={toggleExpand} className="cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-800">{laptop.brand} {laptop.model}</h3>
           {quantity && quantity > 1 && <p className="text-sm text-gray-500">{quantity} units in stock</p>}
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600 space-y-1 animate-fadeIn">
            <p><strong>ID (Representative):</strong> <span className="text-xs">{laptop.id}</span></p>
            <p><strong>Processor:</strong> {laptop.processor || 'N/A'}</p>
            <p><strong>RAM:</strong> {laptop.ram} GB</p>
            <p><strong>Storage:</strong> {laptop.storage}</p>
            {laptop.graphicsCard && <p><strong>Graphics:</strong> {laptop.graphicsCard}</p>}
            <p><strong>Buying Cost:</strong> ₹{laptop.buyingCost.toFixed(2)}</p>
            <p><strong>Date Added (Representative):</strong> {new Date(laptop.dateAdded).toLocaleDateString()}</p>
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSellClick}
            className="bg-secondary hover:bg-secondary-hover text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-150"
            aria-label={`Sell ${laptop.brand} ${laptop.model}`}
            disabled={!quantity || quantity === 0}
          >
            Sell Laptop
          </button>
        </div>
      </div>
    </div>
  );
};

export default LaptopCard;
