
import React, { useState } from 'react';
import { SoldLaptop } from '../types';

interface SoldLaptopCardProps {
  soldLaptop: SoldLaptop;
}

const SoldLaptopCard: React.FC<SoldLaptopCardProps> = ({ soldLaptop }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const profitColor = soldLaptop.totalProfit >= 0 ? 'text-green-600' : 'text-red-600';
  const totalSaleValue = soldLaptop.finalSellingPricePerUnit * soldLaptop.quantitySold;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://picsum.photos/seed/${soldLaptop.saleId}/200/150`; // Use saleId for seed
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 transition-shadow duration-300 hover:shadow-lg animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
        <img 
          src={soldLaptop.imageUrl || `https://picsum.photos/seed/${soldLaptop.saleId}/200/150`} 
          alt={`${soldLaptop.brand} ${soldLaptop.model}`} 
          className="w-full sm:w-32 h-32 sm:h-auto object-cover rounded-md mb-3 sm:mb-0 cursor-pointer"
          onClick={toggleExpand}
          onError={handleError}
        />
        <div className="flex-grow">
          <div onClick={toggleExpand} className="cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-800">{soldLaptop.brand} {soldLaptop.model}</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700">
              <p><strong>Quantity Sold:</strong> {soldLaptop.quantitySold}</p>
              <p><strong>Price/Unit:</strong> ₹{soldLaptop.finalSellingPricePerUnit.toFixed(2)}</p>
              <p><strong>Total Sale:</strong> ₹{totalSaleValue.toFixed(2)}</p>
              <p className={`font-semibold ${profitColor}`}><strong>Total Profit:</strong> ₹{soldLaptop.totalProfit.toFixed(2)}</p>
              <p><strong>Sold On:</strong> {new Date(soldLaptop.dateSold).toLocaleDateString()}</p>
              <p><strong>Sale ID:</strong> <span className="text-xs">{soldLaptop.saleId}</span></p>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600 space-y-1">
              <h4 className="text-md font-semibold text-gray-700 mb-1">Item Details:</h4>
              <p><strong>Original Condition:</strong> {soldLaptop.condition}</p>
              <p><strong>Processor:</strong> {soldLaptop.processor || 'N/A'}</p>
              <p><strong>RAM:</strong> {soldLaptop.ram} GB</p>
              <p><strong>Storage:</strong> {soldLaptop.storage}</p>
              {soldLaptop.graphicsCard && <p><strong>Graphics:</strong> {soldLaptop.graphicsCard}</p>}
              <p><strong>Buying Cost (per unit):</strong> ₹{soldLaptop.buyingCostPerUnit.toFixed(2)}</p>
              {soldLaptop.dateAddedOriginal && <p><strong>Rep. Item Added:</strong> {new Date(soldLaptop.dateAddedOriginal).toLocaleDateString()}</p>}
              <p>
                <button 
                  onClick={toggleExpand} 
                  className="text-xs text-primary hover:underline mt-2"
                  aria-expanded="true"
                >
                  Show Less
                </button>
              </p>
            </div>
          )}
           {!isExpanded && (
             <button 
                onClick={toggleExpand} 
                className="text-xs text-primary hover:underline mt-2"
                aria-expanded="false"
              >
                Show More Details...
              </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default SoldLaptopCard;
