export enum LaptopCondition {
  NEW = 'New',
  USED = 'Used',
}

export interface Laptop {
  id: string; // Auto-generated unique ID
  brand: string;
  model: string;
  processor: string;
  ram: number; // in GB
  storage: string;
  graphicsCard?: string;
  condition: LaptopCondition;
  buyingCost: number;
  targetSellingPrice?: number; // Made optional
  dateAdded: string; // ISO 8601 date string
  imageUrl?: string; // Optional image URL
}

export interface SoldLaptop {
  saleId: string; // Unique ID for this sale transaction
  brand: string;
  model: string;
  processor: string;
  ram: number; // in GB
  storage: string;
  graphicsCard?: string;
  condition: LaptopCondition; // Condition of the items sold
  buyingCostPerUnit: number;
  finalSellingPricePerUnit: number;
  quantitySold: number;
  totalProfit: number; // (finalSellingPricePerUnit - buyingCostPerUnit) * quantitySold
  dateSold: string; // ISO 8601 date string
  dateAddedOriginal?: string; // dateAdded of the representative item from stock
  imageUrl?: string; // Image URL of the representative item
}

export enum Tab {
  Dashboard = 'Dashboard',
  Inventory = 'Inventory',
  Sales = 'Sales',
}

// Interface for representing a group of identical laptops in the inventory
export interface GroupedLaptop {
  representative: Laptop; // One laptop instance to represent the group's common properties
  quantity: number;       // How many laptops are in this group
  laptopsInGroup: Laptop[]; // Array of the actual laptop instances in this group
}