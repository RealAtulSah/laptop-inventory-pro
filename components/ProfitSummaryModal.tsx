
import React, { useMemo } from 'react';
import { SoldLaptop } from '../types';

interface ProfitSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  soldLaptops: SoldLaptop[];
  formatCurrency: (amount: number | undefined) => string;
}

const ProfitSummaryModal: React.FC<ProfitSummaryModalProps> = ({ 
  isOpen, 
  onClose, 
  soldLaptops,
  formatCurrency 
}) => {
  const summary = useMemo(() => {
    const totalOverallProfit = soldLaptops.reduce((sum, s) => sum + s.totalProfit, 0);
    const totalBuyingCostOfSoldItems = soldLaptops.reduce((sum, s) => sum + (s.buyingCostPerUnit * s.quantitySold), 0);
    const numberOfSaleTransactions = soldLaptops.length;
    const totalUnitsSold = soldLaptops.reduce((sum, s) => sum + s.quantitySold, 0);

    let profitableSalesCount = 0;
    let lossSalesCount = 0;
    soldLaptops.forEach(s => {
      if (s.totalProfit > 0) profitableSalesCount++;
      else if (s.totalProfit < 0) lossSalesCount++;
    });
    
    const profitByBrand: { [key: string]: number } = {};
    soldLaptops.forEach(s => {
      profitByBrand[s.brand] = (profitByBrand[s.brand] || 0) + s.totalProfit;
    });

    const averageProfitPerUnitSold = totalUnitsSold > 0 ? totalOverallProfit / totalUnitsSold : 0;
    const overallProfitMargin = totalBuyingCostOfSoldItems > 0 ? (totalOverallProfit / totalBuyingCostOfSoldItems) * 100 : 0;


    return {
      totalOverallProfit,
      numberOfSaleTransactions,
      totalUnitsSold,
      profitableSalesCount,
      lossSalesCount,
      profitByBrand: Object.entries(profitByBrand).sort((a,b) => b[1] - a[1]), 
      averageProfitPerUnitSold,
      overallProfitMargin,
    };
  }, [soldLaptops]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-slate-50 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Profit Summary</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {summary.numberOfSaleTransactions === 0 ? (
          <p className="text-gray-600 text-center py-4">No sales recorded to analyze profit.</p>
        ) : (
          <div className="space-y-6">
            <div className="pt-2">
              <p className={`text-lg font-semibold flex justify-between ${summary.totalOverallProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                <span>Total Overall Profit:</span>
                <span>{formatCurrency(summary.totalOverallProfit)}</span>
              </p>
               <p className="text-sm text-gray-600 flex justify-between">
                <span>Overall Profit Margin:</span>
                <span className={summary.overallProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {summary.overallProfitMargin.toFixed(2)}%
                </span>
              </p>
              <p className="text-sm text-gray-600 flex justify-between">
                <span>Average Profit per Unit Sold:</span>
                <span className={summary.averageProfitPerUnitSold >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(summary.averageProfitPerUnitSold)}
                </span>
              </p>
              <p className="text-sm text-gray-600 flex justify-between">
                <span>Profitable Sale Transactions:</span>
                <span className="text-green-600">{summary.profitableSalesCount}</span>
              </p>
              <p className="text-sm text-gray-600 flex justify-between">
                <span>Loss-making Sale Transactions:</span>
                <span className="text-red-600">{summary.lossSalesCount}</span>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Profit by Brand:</h3>
              {summary.profitByBrand.length > 0 ? (
                <ul className="space-y-1 text-sm text-gray-700 max-h-60 overflow-y-auto pr-2">
                  {summary.profitByBrand.map(([brand, profit]) => (
                    <li key={brand} className="flex justify-between p-2 bg-white rounded shadow-sm">
                      <span>{brand}</span>
                      <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(profit)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No profit by brand to show.</p>
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

export default ProfitSummaryModal;
