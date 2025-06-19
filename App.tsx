
import React, { useState, useEffect, useCallback } from 'react';
import { Laptop, SoldLaptop, Tab, LaptopCondition, GroupedLaptop } from './types';
import { APP_TITLE, TAB_OPTIONS } from './constants';
import BottomNavBar from './components/BottomNavBar';
import FloatingActionButton from './components/FloatingActionButton';
import AddLaptopModal from './components/AddLaptopModal';
import SellLaptopModal from './components/SellLaptopModal';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import SalesView from './components/SalesView';

// API Endpoints
const API_BASE_URL = 'http://localhost:3001/api'; // Assuming API is served from http://localhost:3001

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [laptopsInStock, setLaptopsInStock] = useState<Laptop[]>([]);
  const [soldLaptops, setSoldLaptops] = useState<SoldLaptop[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [laptopToSell, setLaptopToSell] = useState<GroupedLaptop | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [stockResponse, salesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/laptops`),
          fetch(`${API_BASE_URL}/sales`)
        ]);

        if (!stockResponse.ok) throw new Error(`Failed to fetch stock: ${stockResponse.statusText || stockResponse.status}`);
        const stockData = await stockResponse.json();
        setLaptopsInStock(Array.isArray(stockData) ? stockData : []);

        if (!salesResponse.ok) throw new Error(`Failed to fetch sales: ${salesResponse.statusText || salesResponse.status}`);
        const salesData = await salesResponse.json();
        setSoldLaptops(Array.isArray(salesData) ? salesData : []);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddLaptop = useCallback(async (
    newLaptopData: Omit<Laptop, 'id' | 'dateAdded' | 'imageUrl' | 'targetSellingPrice'>, 
    quantity: number
  ): Promise<boolean> => {
    setIsLoading(true);
    const baseId = `laptop-${Date.now()}`;
    const newLaptops: Laptop[] = [];
    const currentTimestamp = new Date();
    const brandQuery = encodeURIComponent(newLaptopData.brand.toLowerCase().replace(/\s+/g, '-'));

    for (let i = 0; i < quantity; i++) {
      const uniqueId = `${baseId}-${i}-${Math.random().toString(36).substring(2, 9)}`;
      const laptopWithDefaults: Laptop = {
        ...newLaptopData,
        id: uniqueId,
        dateAdded: new Date(currentTimestamp.getTime() + i).toISOString(),
        imageUrl: `https://source.unsplash.com/400x300/?${brandQuery}-laptop,laptop&random=${uniqueId}`,
      };
      newLaptops.push(laptopWithDefaults);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/laptops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLaptops),
      });
      if (!response.ok) throw new Error(`Failed to add laptop(s): ${response.statusText || response.status}`);
      // const addedLaptops = await response.json(); // Backend sends back the added laptops
      
       const stockResponse = await fetch(`${API_BASE_URL}/laptops`);
       if (!stockResponse.ok) throw new Error(`Failed to re-fetch stock: ${stockResponse.statusText || stockResponse.status}`);
       const updatedStock = await stockResponse.json();
       setLaptopsInStock(Array.isArray(updatedStock) ? updatedStock : []);

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error("Error adding laptop(s):", err);
      setError(err instanceof Error ? err.message : 'Failed to add laptop(s).');
      setIsLoading(false);
      return false;
    }
  }, []);

  const handleSellLaptop = useCallback(async (
    groupToSellFrom: GroupedLaptop,
    quantityToSell: number,
    finalSellingPricePerUnit: number
  ) => {
    setIsLoading(true);
    const sortedLaptopsInGroup = [...groupToSellFrom.laptopsInGroup].sort(
      (a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
    );

    const laptopsBeingActuallySold = sortedLaptopsInGroup.slice(0, quantityToSell);
    const idsOfLaptopsBeingRemoved = laptopsBeingActuallySold.map(l => l.id);

    const representative = groupToSellFrom.representative;
    const totalProfitForSale = (finalSellingPricePerUnit - representative.buyingCost) * quantityToSell;

    const newSaleRecord: SoldLaptop = {
      saleId: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      brand: representative.brand,
      model: representative.model,
      processor: representative.processor,
      ram: representative.ram,
      storage: representative.storage,
      graphicsCard: representative.graphicsCard,
      condition: representative.condition,
      buyingCostPerUnit: representative.buyingCost,
      finalSellingPricePerUnit: finalSellingPricePerUnit,
      quantitySold: quantityToSell,
      totalProfit: totalProfitForSale,
      dateSold: new Date().toISOString(),
      dateAddedOriginal: representative.dateAdded,
      imageUrl: representative.imageUrl,
    };

    const salePayload = {
        laptopsToRemoveIds: idsOfLaptopsBeingRemoved,
        newSaleRecord: newSaleRecord
    };

    try {
      const response = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salePayload),
      });
      if (!response.ok) throw new Error(`Failed to record sale: ${response.statusText || response.status}`);
      
      const [stockResponse, salesDataResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/laptops`),
          fetch(`${API_BASE_URL}/sales`)
      ]);
      if (!stockResponse.ok) throw new Error(`Failed to re-fetch stock after sale: ${stockResponse.statusText || stockResponse.status}`);
      if (!salesDataResponse.ok) throw new Error(`Failed to re-fetch sales after sale: ${salesDataResponse.statusText || salesDataResponse.status}`);

      const updatedStock = await stockResponse.json();
      const updatedSales = await salesDataResponse.json();

      setLaptopsInStock(Array.isArray(updatedStock) ? updatedStock : []);
      setSoldLaptops(Array.isArray(updatedSales) ? updatedSales : []);
      setLaptopToSell(null);
    } catch (err) {
      console.error("Error selling laptop:", err);
      setError(err instanceof Error ? err.message : 'Failed to record sale.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openSellModal = (group: GroupedLaptop) => {
    setLaptopToSell(group);
  };

  const renderActiveTabContent = () => {
    if (isLoading && (laptopsInStock.length === 0 && soldLaptops.length === 0)) { 
      return <div className="text-center p-10 text-gray-500">Loading data...</div>;
    }
    if (error) {
      return <div className="text-center p-10 text-red-500">Error: {error} <button onClick={() => window.location.reload()} className="ml-2 px-3 py-1 bg-primary text-white rounded">Retry</button></div>;
    }

    switch (activeTab) {
      case Tab.Dashboard:
        return <DashboardView laptopsInStock={laptopsInStock} soldLaptops={soldLaptops} setActiveTab={setActiveTab} />;
      case Tab.Inventory:
        return <InventoryView laptops={laptopsInStock} onSellClick={openSellModal} />;
      case Tab.Sales:
        return <SalesView soldLaptops={soldLaptops} />;
      default:
        return <DashboardView laptopsInStock={laptopsInStock} soldLaptops={soldLaptops} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex flex-col h-screen antialiased text-gray-800 bg-slate-50">
      <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-center">{APP_TITLE} - {activeTab}</h1>
         {isLoading && <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-500 animate-pulse"></div>}
      </header>

      <main className="flex-grow overflow-y-auto p-4 pb-20 sm:pb-24">
        {renderActiveTabContent()}
      </main>

      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} tabs={TAB_OPTIONS} />
      <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />

      {isAddModalOpen && (
        <AddLaptopModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddLaptop={handleAddLaptop}
        />
      )}

      {laptopToSell && (
        <SellLaptopModal
          isOpen={!!laptopToSell}
          onClose={() => setLaptopToSell(null)}
          laptopToSell={laptopToSell}
          onSell={handleSellLaptop}
        />
      )}
    </div>
  );
};

export default App;
