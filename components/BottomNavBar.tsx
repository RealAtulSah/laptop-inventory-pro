
import React from 'react';
import { Tab } from '../types';
import { ICONS } from '../constants.tsx';

interface BottomNavBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  tabs: Tab[];
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange, tabs }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t-lg border-t border-gray-200 z-20">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex flex-col items-center justify-center p-2 w-1/4 text-xs sm:text-sm transition-colors duration-200 ease-in-out
                        ${activeTab === tab ? 'text-primary scale-105' : 'text-gray-500 hover:text-primary'}`}
            aria-current={activeTab === tab ? "page" : undefined}
          >
            <span className={`transform transition-transform duration-200 ${activeTab === tab ? 'scale-110' : ''}`}>
              {ICONS[tab]}
            </span>
            <span className="mt-1">{tab}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavBar;
