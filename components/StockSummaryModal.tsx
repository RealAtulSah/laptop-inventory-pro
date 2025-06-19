
import React, { useMemo } from 'react';
import { Laptop, LaptopCondition } from '../types';

interface StockSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  laptopsInStock: Laptop[];
}

const StockSummaryModal: React.FC<StockSummaryModalProps> = ({ isOpen, onClose, laptopsInStock }) => {
  const summary = useMemo(() => {
    const brandCounts: { [key: string]: number } = {};
    const conditionCounts: { [key in LaptopCondition]: number } = {
      [LaptopCondition.NEW]: 0,
      [LaptopCondition.USED]: 0,
    };

    laptopsInStock.forEach(laptop => {
      brandCounts[laptop.brand] = (brandCounts[laptop.brand] || 0) + 1;
      conditionCounts[laptop.condition] = (conditionCounts[laptop.condition] || 0) + 1;
    });

    return {
      brandCounts: Object.entries(brandCounts).sort((a,b) => b[1] - a[1]), // Sort by count desc
      conditionCounts: Object.entries(conditionCounts),
      totalStock: laptopsInStock.length,
    };
  }, [laptopsInStock]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-slate-50 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Stock Summary</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {summary.totalStock === 0 ? (
          <p className="text-gray-600 text-center py-4">Your inventory is currently empty.</p>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">By Brand:</h3>
              {summary.brandCounts.length > 0 ? (
                <ul className="space-y-1 text-sm text-gray-700 max-h-60 overflow-y-auto pr-2">
                  {summary.brandCounts.map(([brand, count]) => (
                    <li key={brand} className="flex justify-between p-2 bg-white rounded shadow-sm">
                      <span>{brand}</span>
                      <span className="font-medium">{count} unit(s)</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No laptops by brand to show.</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">By Condition:</h3>
               {summary.conditionCounts.length > 0 ? (
                <ul className="space-y-1 text-sm text-gray-700">
                  {summary.conditionCounts.map(([condition, count]) => (
                    <li key={condition} className="flex justify-between p-2 bg-white rounded shadow-sm">
                      <span>{condition}</span>
                      <span className="font-medium">{count} unit(s)</span>
                    </li>
                  ))}
                </ul>
              ) : (
                 <p className="text-sm text-gray-500">No laptops by condition to show.</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-md font-semibold text-gray-800 flex justify-between">
                <span>Total Laptops in Stock:</span>
                <span>{summary.totalStock} unit(s)</span>
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockSummaryModal;
