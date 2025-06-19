
import React, { useState, useCallback, useEffect } from 'react';
import { GroupedLaptop } from '../types'; // Changed from Laptop

interface SellLaptopModalProps {
  isOpen: boolean;
  onClose: () => void;
  laptopToSell: GroupedLaptop; // Changed to GroupedLaptop
  onSell: (group: GroupedLaptop, quantity: number, finalSellingPrice: number) => void;
}

const SellLaptopModal: React.FC<SellLaptopModalProps> = ({ isOpen, onClose, laptopToSell, onSell }) => {
  const [finalSellingPrice, setFinalSellingPrice] = useState<string>('');
  const [quantityToSell, setQuantityToSell] = useState<string>('1');
  const [error, setError] = useState<string | null>(null);
  
  const commonInputClasses = "mt-1 block w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary placeholder-gray-500";

  useEffect(() => {
    if (isOpen && laptopToSell) {
      // Use representative's target price if available, otherwise empty or buyingCost + margin.
      // Since targetSellingPrice is removed from add form, it might often be undefined.
      // Defaulting to empty or a calculated price might be better. For now, empty if not set.
      setFinalSellingPrice(laptopToSell.representative.targetSellingPrice?.toString() || laptopToSell.representative.buyingCost.toString());
      setQuantityToSell('1');
      setError(null);
    }
  }, [isOpen, laptopToSell]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const price = parseFloat(finalSellingPrice);
    const quantity = parseInt(quantityToSell, 10);

    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid positive selling price.');
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      setError('Quantity must be a positive number.');
      return;
    }
    if (quantity > laptopToSell.quantity) {
      setError(`Cannot sell more than available quantity (${laptopToSell.quantity}).`);
      return;
    }

    onSell(laptopToSell, quantity, price);
    onClose(); 
  }, [finalSellingPrice, quantityToSell, laptopToSell, onSell, onClose]);

  if (!isOpen || !laptopToSell) return null;

  const { representative, quantity: availableQuantity } = laptopToSell;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-50 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Sell Laptop</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600"><strong>Brand:</strong> {representative.brand}</p>
          <p className="text-sm text-gray-600"><strong>Model:</strong> {representative.model}</p>
          {/* Target Price display removed as it's removed from add form
          {representative.targetSellingPrice && (
            <p className="text-sm text-gray-600"><strong>Target Price:</strong> ₹{representative.targetSellingPrice.toFixed(2)}</p>
          )}
          */}
          <p className="text-sm text-gray-600"><strong>Buying Cost (per unit):</strong> ₹{representative.buyingCost.toFixed(2)}</p>
          <p className="text-sm text-gray-600"><strong>Available Quantity:</strong> {availableQuantity}</p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="quantityToSell" className="block text-sm font-medium text-gray-700">Quantity to Sell</label>
            <input
              type="number"
              id="quantityToSell"
              name="quantityToSell"
              value={quantityToSell}
              onChange={(e) => setQuantityToSell(e.target.value)}
              required
              min="1"
              max={availableQuantity.toString()}
              step="1"
              className={commonInputClasses}
            />
          </div>
          <div>
            <label htmlFor="finalSellingPrice" className="block text-sm font-medium text-gray-700">Final Selling Price (per unit ₹)</label>
            <input
              type="number"
              id="finalSellingPrice"
              name="finalSellingPrice"
              value={finalSellingPrice}
              onChange={(e) => setFinalSellingPrice(e.target.value)}
              required
              min="0.01"
              step="0.01"
              className={commonInputClasses}
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md border border-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-hover rounded-md shadow-sm">Confirm Sale</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellLaptopModal;