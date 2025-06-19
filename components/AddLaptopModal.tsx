
import React, { useState, useCallback } from 'react';
import { Laptop, LaptopCondition } from '../types'; 
import { LAPTOP_BRANDS, RAM_OPTIONS, STORAGE_TYPES, STORAGE_SIZES } from '../constants.tsx';

interface AddLaptopModalProps {
  isOpen: boolean;
  onClose: () => void;
  // targetSellingPrice is now optional on Laptop and removed from this form
  onAddLaptop: (laptopData: Omit<Laptop, 'id' | 'dateAdded' | 'imageUrl' | 'targetSellingPrice'>, quantity: number) => Promise<boolean>; // Changed to Promise<boolean>
}

const AddLaptopModal: React.FC<AddLaptopModalProps> = ({ isOpen, onClose, onAddLaptop }) => {
  const initialFormState = {
    brand: LAPTOP_BRANDS[0],
    model: '',
    processor: '',
    ram: RAM_OPTIONS[1].toString(), 
    storageSize: STORAGE_SIZES[1].toString(), 
    storageType: STORAGE_TYPES[0], 
    graphicsCard: '',
    condition: LaptopCondition.NEW,
    buyingCost: '',
    // targetSellingPrice: '', // Removed
    quantity: '1',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);

  const commonInputClasses = "mt-1 block w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary placeholder-gray-500";

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => { // Made handleSubmit async
    e.preventDefault();
    setError(null);

    if (!formData.model.trim()) {
        setError('Model is required.');
        return;
    }
     if (isNaN(parseFloat(formData.buyingCost)) || parseFloat(formData.buyingCost) <= 0) {
        setError('Buying Cost must be a positive number.');
        return;
    }
    // Target selling price validation removed
    const quantity = parseInt(formData.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
        setError('Quantity must be a positive number.');
        return;
    }
    
    const laptopData = {
      brand: formData.brand,
      model: formData.model,
      processor: formData.processor,
      ram: parseInt(formData.ram, 10),
      storage: `${formData.storageSize}GB ${formData.storageType}`,
      graphicsCard: formData.graphicsCard || undefined,
      condition: formData.condition,
      buyingCost: parseFloat(formData.buyingCost),
      // targetSellingPrice: parseFloat(formData.targetSellingPrice), // Removed
    };

    const success = await onAddLaptop(laptopData, quantity); // Await the async call
    if(success) {
      setFormData(initialFormState); 
      onClose();
    }
  }, [formData, onAddLaptop, onClose, initialFormState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-slate-50 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">Add New Laptop</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
              <select id="brand" name="brand" value={formData.brand} onChange={handleChange} className={commonInputClasses}>
                {LAPTOP_BRANDS.map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model Name/Number</label>
              <input type="text" id="model" name="model" value={formData.model} onChange={handleChange} required className={commonInputClasses} />
            </div>
          </div>

          <div>
            <label htmlFor="processor" className="block text-sm font-medium text-gray-700">Processor</label>
            <input type="text" id="processor" name="processor" value={formData.processor} onChange={handleChange} className={commonInputClasses} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ram" className="block text-sm font-medium text-gray-700">RAM (GB)</label>
              <select id="ram" name="ram" value={formData.ram} onChange={handleChange} className={commonInputClasses}>
                {RAM_OPTIONS.map(ram => <option key={ram} value={ram}>{ram} GB</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700">Condition</label>
              <select id="condition" name="condition" value={formData.condition} onChange={handleChange} className={commonInputClasses}>
                {Object.values(LaptopCondition).map(condition => <option key={condition} value={condition}>{condition}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Storage</label>
            <div className="grid grid-cols-2 gap-4 mt-1">
              <select name="storageSize" value={formData.storageSize} onChange={handleChange} className={commonInputClasses}>
                {STORAGE_SIZES.map(size => <option key={size} value={size}>{size >= 1000 ? `${size/1000}TB` : `${size}GB`}</option>)}
              </select>
              <select name="storageType" value={formData.storageType} onChange={handleChange} className={commonInputClasses}>
                {STORAGE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="graphicsCard" className="block text-sm font-medium text-gray-700">Graphics Card (Optional)</label>
            <input type="text" id="graphicsCard" name="graphicsCard" value={formData.graphicsCard} onChange={handleChange} className={commonInputClasses} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4"> {/* Changed to single column for buying cost */}
            <div>
              <label htmlFor="buyingCost" className="block text-sm font-medium text-gray-700">Buying Cost (₹)</label>
              <input type="number" id="buyingCost" name="buyingCost" value={formData.buyingCost} onChange={handleChange} required min="0.01" step="0.01" className={commonInputClasses} />
            </div>
            {/* Target Selling Price Input Removed
            <div>
              <label htmlFor="targetSellingPrice" className="block text-sm font-medium text-gray-700">Target Selling Price (₹)</label>
              <input type="number" id="targetSellingPrice" name="targetSellingPrice" value={formData.targetSellingPrice} onChange={handleChange} required min="0.01" step="0.01" className={commonInputClasses} />
            </div>
            */}
          </div>
          
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
            <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" step="1" className={commonInputClasses} />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md border border-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm">Add Laptop(s)</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLaptopModal;