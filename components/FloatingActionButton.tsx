
import React from 'react';
import { PLUS_ICON } from '../constants.tsx';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 bg-accent hover:bg-accent-hover text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-pink-500 focus:ring-opacity-50 transition-all duration-150 ease-in-out z-20"
      aria-label="Add new laptop"
    >
      {PLUS_ICON}
    </button>
  );
};

export default FloatingActionButton;
