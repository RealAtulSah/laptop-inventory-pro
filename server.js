
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // PostgreSQL client

const app = express();

// PostgreSQL Pool Configuration
// Uses environment variables for connection:
// PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT
// Or a single DATABASE_URL environment variable.
const pool = new Pool(); 

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client in PostgreSQL pool', err);
  process.exit(-1);
});


const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

/*
-- SQL DDL for Table Creation (Run these in your PostgreSQL database)

-- Optional: CREATE TYPE laptop_condition_enum AS ENUM ('New', 'Used');

CREATE TABLE IF NOT EXISTS laptops_stock (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    processor TEXT,
    ram INTEGER NOT NULL,
    storage TEXT NOT NULL,
    graphics_card TEXT,
    condition TEXT NOT NULL, -- Or laptop_condition_enum
    buying_cost NUMERIC(10, 2) NOT NULL,
    target_selling_price NUMERIC(10, 2),
    date_added TIMESTAMPTZ NOT NULL,
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS laptops_sold (
    sale_id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    processor TEXT,
    ram INTEGER NOT NULL,
    storage TEXT NOT NULL,
    graphics_card TEXT,
    condition TEXT NOT NULL, -- Or laptop_condition_enum
    buying_cost_per_unit NUMERIC(10, 2) NOT NULL,
    final_selling_price_per_unit NUMERIC(10, 2) NOT NULL,
    quantity_sold INTEGER NOT NULL,
    total_profit NUMERIC(10, 2) NOT NULL,
    date_sold TIMESTAMPTZ NOT NULL,
    date_added_original TIMESTAMPTZ,
    image_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_laptops_stock_date_added ON laptops_stock(date_added DESC);
CREATE INDEX IF NOT EXISTS idx_laptops_sold_date_sold ON laptops_sold(date_sold DESC);
-- Add other indexes as needed, e.g., on brand
*/

// --- API Endpoints ---

// GET all laptops in stock
app.get('/api/laptops', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM laptops_stock ORDER BY date_added DESC;');
    res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ message: 'Failed to fetch stock', error: error.message });
  }
});

// POST new laptop(s) to stock
app.post('/api/laptops', async (req, res) => {
  const newLaptops = req.body; // Expects an array of Laptop objects
  if (!Array.isArray(newLaptops) || newLaptops.length === 0) {
    return res.status(400).json({ message: 'Invalid laptop data: Array of laptops expected.' });
  }
  if (!newLaptops.every(laptop => laptop && typeof laptop.id === 'string')) {
      return res.status(400).json({ message: 'Invalid laptop data: Each laptop must have an id.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertPromises = newLaptops.map(laptop => {
      const query = `
        INSERT INTO laptops_stock 
          (id, brand, model, processor, ram, storage, graphics_card, condition, buying_cost, target_selling_price, date_added, image_url)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO NOTHING; -- Or handle conflict as needed
      `;
      // Ensure target_selling_price is null if undefined, not 'undefined' string or 0
      const targetSellingPrice = laptop.targetSellingPrice !== undefined ? laptop.targetSellingPrice : null;
      const values = [
        laptop.id, laptop.brand, laptop.model, laptop.processor, laptop.ram,
        laptop.storage, laptop.graphicsCard, laptop.condition, laptop.buyingCost,
        targetSellingPrice, laptop.dateAdded, laptop.imageUrl
      ];
      return client.query(query, values);
    });
    await Promise.all(insertPromises);
    await client.query('COMMIT');
    res.status(201).json(newLaptops);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding laptop(s):', error);
    res.status(500).json({ message: 'Failed to add laptop(s)', error: error.message });
  } finally {
    client.release();
  }
});

// GET all sales records
app.get('/api/sales', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM laptops_sold ORDER BY date_sold DESC;');
    res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Failed to fetch sales records', error: error.message });
  }
});

// POST a new sale
app.post('/api/sales', async (req, res) => {
  const { laptopsToRemoveIds, newSaleRecord } = req.body;

  if (!Array.isArray(laptopsToRemoveIds) || laptopsToRemoveIds.length === 0 || !newSaleRecord || typeof newSaleRecord.saleId !== 'string') {
    return res.status(400).json({ message: 'Invalid sale data. Requires laptopsToRemoveIds (array) and newSaleRecord (object).' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete sold laptops from stock
    // Using ANY operator for array of IDs
    const deleteQuery = 'DELETE FROM laptops_stock WHERE id = ANY($1::text[]);';
    const deleteResult = await client.query(deleteQuery, [laptopsToRemoveIds]);

    // Check if the correct number of laptops were removed (optional, but good for validation)
    if (deleteResult.rowCount !== laptopsToRemoveIds.length) {
        // This could happen if some IDs were not found, which might indicate a data inconsistency.
        // For now, we'll log it and proceed, but in a stricter system, you might rollback.
        console.warn(`Attempted to remove ${laptopsToRemoveIds.length} laptops, but ${deleteResult.rowCount} were deleted.`);
        // For a critical app, you might throw an error here to trigger a rollback if rowCount is 0 or less than expected.
        if (deleteResult.rowCount === 0 && laptopsToRemoveIds.length > 0) {
            throw new Error('No laptops found in stock matching IDs to be sold.');
        }
    }


    // Add to sales records
    const insertSaleQuery = `
      INSERT INTO laptops_sold 
        (sale_id, brand, model, processor, ram, storage, graphics_card, condition, 
        buying_cost_per_unit, final_selling_price_per_unit, quantity_sold, total_profit, 
        date_sold, date_added_original, image_url)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);
    `;
    const saleValues = [
      newSaleRecord.saleId, newSaleRecord.brand, newSaleRecord.model, newSaleRecord.processor,
      newSaleRecord.ram, newSaleRecord.storage, newSaleRecord.graphicsCard, newSaleRecord.condition,
      newSaleRecord.buyingCostPerUnit, newSaleRecord.finalSellingPricePerUnit, newSaleRecord.quantitySold,
      newSaleRecord.totalProfit, newSaleRecord.dateSold, newSaleRecord.dateAddedOriginal, newSaleRecord.imageUrl
    ];
    await client.query(insertSaleQuery, saleValues);

    await client.query('COMMIT');
    res.status(201).json(newSaleRecord);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing sale:', error);
    res.status(500).json({ message: 'Failed to process sale', error: error.message });
  } finally {
    client.release();
  }
});

app.listen(PORT, async () => {
  console.log(`Backend server running on port ${PORT}`);
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL for initial check.');
    // Test query
    const res = await client.query('SELECT NOW()');
    console.log('PostgreSQL current time:', res.rows[0].now);
    client.release();
  } catch (err) {
    console.error('Failed to connect to PostgreSQL on startup:', err.stack);
  }
});
