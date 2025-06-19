
import React, { useMemo } from 'react';
import { Laptop, LaptopCondition } from '../types';

interface StockValueSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  laptopsInStock: Laptop[];
  formatCurrency: (amount: number | undefined) => string;
}

const StockValueSummaryModal: React.FC<StockValueSummaryModalProps> = ({ 
  isOpen, 
  onClose, 
  laptopsInStock,
  formatCurrency 
}) => {
  const summary = useMemo(() => {
    const totalStockValue = laptopsInStock.reduce((sum, laptop) => sum + laptop.buyingCost, 0);
    
    const valueByBrand: { [key: string]: number } = {};
    const valueByCondition: { [key in LaptopCondition]: number } = {
      [LaptopCondition.NEW]: 0,
      [LaptopCondition.USED]: 0,
    };

    laptopsInStock.forEach(laptop => {
      valueByBrand[laptop.brand] = (valueByBrand[laptop.brand] || 0) + laptop.buyingCost;
      valueByCondition[laptop.condition] = (valueByCondition[laptop.condition] || 0) + laptop.buyingCost;
    });

    const averageBuyingCost = laptopsInStock.length > 0 ? totalStockValue / laptopsInStock.length : 0;

    return {
      totalStockValue,
      valueByBrand: Object.entries(valueByBrand).sort((a,b) => b[1] - a[1]), // Sort by value desc
      valueByCondition: Object.entries(valueByCondition),
      averageBuyingCost,
      totalStockCount: laptopsInStock.length,
    };
  }, [laptopsInStock]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-slate-50 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Stock Value Summary</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {summary.totalStockCount === 0 ? (
          <p className="text-gray-600 text-center py-4">Your inventory is currently empty.</p>
        ) : (
          <div className="space-y-6">
            <div className="pt-2">
              <p className="text-lg font-semibold text-gray-800 flex justify-between">
                <span>Total Stock Value:</span>
                <span>{formatCurrency(summary.totalStockValue)}</span>
              </p>
               <p className="text-sm text-gray-600 flex justify-between">
                <span>Average Buying Cost per Unit:</span>
                <span>{formatCurrency(summary.averageBuyingCost)}</span>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Value by Brand:</h3>
              {summary.valueByBrand.length > 0 ? (
                <ul className="space-y-1 text-sm text-gray-700 max-h-48 overflow-y-auto pr-2">
                  {summary.valueByBrand.map(([brand, value]) => (
                    <li key={brand} className="flex justify-between p-2 bg-white rounded shadow-sm">
                      <span>{brand}</span>
                      <span className="font-medium">{formatCurrency(value)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No stock value by brand to show.</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Value by Condition:</h3>
               {summary.valueByCondition.length > 0 ? (
                <ul className="space-y-1 text-sm text-gray-700">
                  {summary.valueByCondition.map(([condition, value]) => (
                    <li key={condition} className="flex justify-between p-2 bg-white rounded shadow-sm">
                      <span>{condition}</span>
                      <span className="font-medium">{formatCurrency(value)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                 <p className="text-sm text-gray-500">No stock value by condition to show.</p>
              )}
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

export default StockValueSummaryModal;
