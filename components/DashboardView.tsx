
import React, { useMemo, useState } from 'react';
import { Laptop, SoldLaptop, Tab } from '../types';
import StockSummaryModal from './StockSummaryModal';
import StockValueSummaryModal from './StockValueSummaryModal'; 
import SalesValueSummaryModal from './SalesValueSummaryModal'; 
import ProfitSummaryModal from './ProfitSummaryModal';       

interface DashboardViewProps {
  laptopsInStock: Laptop[];
  soldLaptops: SoldLaptop[];
  setActiveTab: (tab: Tab) => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  colorClass: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, colorClass, icon, onClick, ariaLabel }) => (
  <button
    onClick={onClick}
    className={`bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 text-left w-full transition-all hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${colorClass} ${onClick ? 'cursor-pointer' : ''}`}
    aria-label={ariaLabel || title}
    disabled={!onClick}
  >
    {icon && <div className="text-3xl flex-shrink-0">{icon}</div>}
    <div className="flex-grow">
      <p className="text-sm font-medium uppercase tracking-wider opacity-90">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  </button>
);

const DashboardView: React.FC<DashboardViewProps> = ({ laptopsInStock, soldLaptops, setActiveTab }) => {
  const [isStockSummaryModalOpen, setIsStockSummaryModalOpen] = useState(false);
  const [isStockValueModalOpen, setIsStockValueModalOpen] = useState(false); 
  const [isSalesValueModalOpen, setIsSalesValueModalOpen] = useState(false); 
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);         

  const stats = useMemo(() => {
    const totalStockValue = laptopsInStock.reduce((sum, laptop) => sum + laptop.buyingCost, 0);
    // Use new SoldLaptop structure for sales and profit calculations
    const totalSalesValue = soldLaptops.reduce((sum, s) => sum + (s.finalSellingPricePerUnit * s.quantitySold), 0);
    const totalProfit = soldLaptops.reduce((sum, s) => sum + s.totalProfit, 0);
    return {
      totalLaptopsInStock: laptopsInStock.length,
      totalStockValue,
      totalSalesValue,
      totalProfit,
    };
  }, [laptopsInStock, soldLaptops]);

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || isNaN(amount)) return '₹N/A';
    return `₹${amount.toFixed(2)}`;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        <StatCard 
          title="Laptops in Stock" 
          value={stats.totalLaptopsInStock} 
          colorClass="text-blue-700 bg-blue-50 focus:ring-blue-500"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>}
          onClick={() => setIsStockSummaryModalOpen(true)} 
          ariaLabel="View summary of laptops in stock"
        />
        <StatCard 
          title="Total Stock Value" 
          value={formatCurrency(stats.totalStockValue)}
          colorClass="text-indigo-700 bg-indigo-50 focus:ring-indigo-500"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>}
          onClick={() => setIsStockValueModalOpen(true)} 
          ariaLabel="View summary of total stock value"
        />
        <StatCard 
          title="Total Sales Value" 
          value={formatCurrency(stats.totalSalesValue)} 
          colorClass="text-emerald-700 bg-emerald-50 focus:ring-emerald-500"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          onClick={() => setIsSalesValueModalOpen(true)} 
          ariaLabel="View summary of total sales value"
        />
        <StatCard 
          title="Total Profit" 
          value={formatCurrency(stats.totalProfit)} 
          colorClass={`${stats.totalProfit >= 0 ? 'text-green-700 bg-green-50 focus:ring-green-500' : 'text-red-700 bg-red-50 focus:ring-red-500'}`}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>}
          onClick={() => setIsProfitModalOpen(true)} 
          ariaLabel="View summary of total profit"
        />
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Overview</h2>
        {laptopsInStock.length === 0 && soldLaptops.length === 0 ? (
          <p className="text-gray-500">No data available yet. Start by adding laptops to your inventory!</p>
        ) : (
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>You have <button onClick={() => setIsStockSummaryModalOpen(true)} className="font-semibold text-primary hover:underline">{stats.totalLaptopsInStock}</button> laptops currently in stock.</li>
            <li>The total value of your current stock (buying cost) is <button onClick={() => setIsStockValueModalOpen(true)} className="font-semibold text-primary hover:underline">{formatCurrency(stats.totalStockValue)}</button>.</li>
            <li>So far, you've made <button onClick={() => setIsSalesValueModalOpen(true)} className="font-semibold text-secondary hover:underline">{formatCurrency(stats.totalSalesValue)}</button> in total sales.</li>
            <li>Your total profit from these sales is <button onClick={() => setIsProfitModalOpen(true)} className={`font-semibold ${stats.totalProfit >= 0 ? 'text-secondary hover:underline' : 'text-red-500 hover:underline'}`}>{formatCurrency(stats.totalProfit)}</button>.</li>
          </ul>
        )}
      </div>

       <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity (Last 5)</h2>
        {soldLaptops.length === 0 && laptopsInStock.length === 0 ? (
           <p className="text-gray-500">No recent activity.</p>
        ) : null}
        {soldLaptops.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-md font-medium text-gray-600">Recently Sold:</h3>
            {soldLaptops.slice(0, 5).map(s => (
              <div key={s.saleId} className="text-sm p-2 bg-gray-50 rounded-md">
                <span className="font-semibold">{s.brand} {s.model}</span> (Qty: {s.quantitySold}) sold at {formatCurrency(s.finalSellingPricePerUnit)}/unit. 
                (Total Profit: <span className={s.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(s.totalProfit)}</span>)
              </div>
            ))}
          </div>
        )}
         {laptopsInStock.length > 0 && ( 
          <div className="mt-4 space-y-3">
            <h3 className="text-md font-medium text-gray-600">Recently Added to Stock:</h3>
            {laptopsInStock.slice(0, 5).map(laptop => (
              <div key={laptop.id} className="text-sm p-2 bg-gray-50 rounded-md">
                <span className="font-semibold">{laptop.brand} {laptop.model}</span> 
                {formatCurrency(laptop.targetSellingPrice) !== '₹N/A'
                  ? ` (Target: ${formatCurrency(laptop.targetSellingPrice)})`
                  : ` (Buying Cost: ${formatCurrency(laptop.buyingCost)})`} 
              </div>
            ))}
          </div>
         )}
         {soldLaptops.length === 0 && laptopsInStock.length > 0 && (
             <p className="text-gray-500 mt-3">No sales recorded yet.</p>
         )}
      </div>

      {isStockSummaryModalOpen && (
        <StockSummaryModal
          isOpen={isStockSummaryModalOpen}
          onClose={() => setIsStockSummaryModalOpen(false)}
          laptopsInStock={laptopsInStock}
        />
      )}
      {isStockValueModalOpen && (
        <StockValueSummaryModal
          isOpen={isStockValueModalOpen}
          onClose={() => setIsStockValueModalOpen(false)}
          laptopsInStock={laptopsInStock}
          formatCurrency={formatCurrency}
        />
      )}
      {isSalesValueModalOpen && (
        <SalesValueSummaryModal
          isOpen={isSalesValueModalOpen}
          onClose={() => setIsSalesValueModalOpen(false)}
          soldLaptops={soldLaptops}
          formatCurrency={formatCurrency}
        />
      )}
      {isProfitModalOpen && (
        <ProfitSummaryModal
          isOpen={isProfitModalOpen}
          onClose={() => setIsProfitModalOpen(false)}
          soldLaptops={soldLaptops}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

export default DashboardView;
