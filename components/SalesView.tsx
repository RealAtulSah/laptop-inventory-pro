
import React from 'react';
import { SoldLaptop } from '../types';
import SoldLaptopCard from './SoldLaptopCard';

interface SalesViewProps {
  soldLaptops: SoldLaptop[];
}

const SalesView: React.FC<SalesViewProps> = ({ soldLaptops }) => {
  if (soldLaptops.length === 0) {
    return (
      <div className="text-center py-10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 012.25 4.5h.75A2.25 2.25 0 015.25 6.75v1.5H6.75A2.25 2.25 0 019 10.5v1.5H4.5A2.25 2.25 0 012.25 9.75V7.5M3 12h18M3 15h18M3 18h18" />
        </svg>
        <p className="text-xl text-gray-600 font-semibold">No sales recorded yet.</p>
        <p className="text-gray-500">Sell a laptop from the Inventory tab to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {soldLaptops.map((laptop) => (
        <SoldLaptopCard key={laptop.saleId} soldLaptop={laptop} />
      ))}
    </div>
  );
};

export default SalesView;
