
import React, { useMemo } from 'react';
import { Laptop, GroupedLaptop } from '../types'; // Import GroupedLaptop
import LaptopCard from './LaptopCard';

interface InventoryViewProps {
  laptops: Laptop[];
  onSellClick: (group: GroupedLaptop) => void; // Changed to accept GroupedLaptop
}

// GroupedLaptop interface is now in types.ts

const InventoryView: React.FC<InventoryViewProps> = ({ laptops, onSellClick }) => {
  const groupedLaptops = useMemo(() => {
    const groups: { [key: string]: GroupedLaptop } = {};
    
    // Sort laptops by dateAdded to ensure laptopsInGroup is somewhat ordered for consistent selling (oldest first)
    const sortedLaptops = [...laptops].sort((a,b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime());

    sortedLaptops.forEach(laptop => {
      const groupKey = [
        laptop.brand,
        laptop.model,
        laptop.processor,
        laptop.ram,
        laptop.storage,
        laptop.graphicsCard || 'N/A',
        laptop.condition,
        laptop.buyingCost.toFixed(2)
      ].join('|');

      if (groups[groupKey]) {
        groups[groupKey].quantity++;
        groups[groupKey].laptopsInGroup.push(laptop);
      } else {
        groups[groupKey] = {
          representative: laptop, // The first encountered laptop (oldest if sorted) acts as representative
          quantity: 1,
          laptopsInGroup: [laptop]
        };
      }
    });
    return Object.values(groups).sort((a, b) => {
        if (a.representative.brand < b.representative.brand) return -1;
        if (a.representative.brand > b.representative.brand) return 1;
        if (a.representative.model < b.representative.model) return -1;
        if (a.representative.model > b.representative.model) return 1;
        // Fallback sort by date added for representatives if all else is equal
        return new Date(a.representative.dateAdded).getTime() - new Date(b.representative.dateAdded).getTime();
    });
  }, [laptops]);

  if (laptops.length === 0) {
    return (
      <div className="text-center py-10 animate-fadeIn">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.353-.026.715-.026 1.068 0 1.13.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5M8.25 7.5c0 1.135-.845 2.098-1.976 2.192a48.424 48.424 0 00-1.068 0C3.845 9.598 3 8.635 3 7.5m6.75 0v.108c0 .354.026.708.075.996M15 7.5V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.068 0c-1.13.094-1.976 1.057-1.976-2.192V7.5m0 0h3.75m-3.75 0c0 1.135.845 2.098 1.976 2.192.353.026.715-.026 1.068 0 1.13-.094 1.976-1.057 1.976-2.192V7.5M3 13.5l6.75 6.75L21 7.5" />
        </svg>
        <p className="text-xl text-gray-600 font-semibold">Your inventory is empty.</p>
        <p className="text-gray-500">Click the (+) button to add your first laptop!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {groupedLaptops.map((group) => (
        <LaptopCard 
          key={group.representative.id + '-' + group.quantity} 
          laptop={group.representative} 
          quantity={group.quantity}
          onSellClick={() => onSellClick(group)} // Pass the whole group object
        />
      ))}
    </div>
  );
};

export default InventoryView;