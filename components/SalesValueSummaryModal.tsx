
import React, { useMemo } from 'react';
import { SoldLaptop } from '../types';

interface SalesValueSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  soldLaptops: SoldLaptop[];
  formatCurrency: (amount: number | undefined) => string;
}

const SalesValueSummaryModal: React.FC<SalesValueSummaryModalProps> = ({ 
  isOpen, 
  onClose, 
  soldLaptops,
  formatCurrency 
}) => {
  const summary = useMemo(() => {
    const totalSalesValue = soldLaptops.reduce((sum, s) => sum + (s.finalSellingPricePerUnit * s.quantitySold), 0);
    const numberOfSaleTransactions = soldLaptops.length;
    const totalUnitsSold = soldLaptops.reduce((sum, s) => sum + s.quantitySold, 0);
    
    const salesByBrand: { [key: string]: number } = {};
    soldLaptops.forEach(s => {
      salesByBrand[s.brand] = (salesByBrand[s.brand] || 0) + (s.finalSellingPricePerUnit * s.quantitySold);
    });

    const averageSellingPricePerUnit = totalUnitsSold > 0 ? totalSalesValue / totalUnitsSold : 0;

    return {
      totalSalesValue,
      numberOfSaleTransactions,
      totalUnitsSold,
      salesByBrand: Object.entries(salesByBrand).sort((a,b) => b[1] - a[1]), 
      averageSellingPricePerUnit,
    };
  }, [soldLaptops]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-slate-50 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Sales Value Summary</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {summary.numberOfSaleTransactions === 0 ? (
          <p className="text-gray-600 text-center py-4">No sales recorded yet.</p>
        ) : (
          <div className="space-y-6">
            <div className="pt-2">
              <p className="text-lg font-semibold text-gray-800 flex justify-between">
                <span>Total Sales Value:</span>
                <span>{formatCurrency(summary.totalSalesValue)}</span>
              </p>
              <p className="text-sm text-gray-600 flex justify-between">
                <span>Total Sale Transactions:</span>
                <span>{summary.numberOfSaleTransactions}</span>
              </p>
              <p className="text-sm text-gray-600 flex justify-between">
                <span>Total Units Sold:</span>
                <span>{summary.totalUnitsSold}</span>
              </p>
              <p className="text-sm text-gray-600 flex justify-between">
                <span>Average Selling Price per Unit:</span>
                <span>{formatCurrency(summary.averageSellingPricePerUnit)}</span>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Sales Value by Brand:</h3>
              {summary.salesByBrand.length > 0 ? (
                <ul className="space-y-1 text-sm text-gray-700 max-h-60 overflow-y-auto pr-2">
                  {summary.salesByBrand.map(([brand, value]) => (
                    <li key={brand} className="flex justify-between p-2 bg-white rounded shadow-sm">
                      <span>{brand}</span>
                      <span className="font-medium">{formatCurrency(value)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No sales by brand to show.</p>
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

export default SalesValueSummaryModal;
