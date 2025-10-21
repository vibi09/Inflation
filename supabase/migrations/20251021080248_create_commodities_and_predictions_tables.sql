/*
  # Inflation Prediction Application - Database Schema

  ## Overview
  This migration creates the complete database schema for the inflation prediction application,
  including tables for commodities, price history, and AI-powered predictions.

  ## 1. New Tables

  ### `commodities`
  Stores information about tracked commodities (gold, silver, platinum, petrol, diesel, LPG, CNG)
  - `id` (uuid, primary key) - Unique identifier for each commodity
  - `name` (text) - Display name of the commodity (e.g., "Gold", "Petrol")
  - `type` (text) - Commodity type identifier (gold, silver, platinum, petrol, diesel, lpg, cng)
  - `current_price` (numeric) - Current market price
  - `unit` (text) - Unit of measurement (e.g., "₹/10g", "₹/L")
  - `last_updated` (timestamptz) - Last price update timestamp
  - `created_at` (timestamptz) - Record creation timestamp

  ### `price_history`
  Maintains historical price data for all commodities to enable trend analysis
  - `id` (uuid, primary key) - Unique identifier for each price record
  - `commodity_id` (uuid, foreign key) - References commodities table
  - `price` (numeric) - Historical price value
  - `recorded_at` (timestamptz) - Timestamp when price was recorded
  - `created_at` (timestamptz) - Record creation timestamp

  ### `predictions`
  Stores AI-generated price predictions with confidence scores
  - `id` (uuid, primary key) - Unique identifier for each prediction
  - `commodity_id` (uuid, foreign key) - References commodities table
  - `predicted_price` (numeric) - Predicted future price
  - `prediction_date` (timestamptz) - Date for which prediction is made
  - `confidence` (numeric) - Confidence score (0.0 to 1.0)
  - `trend` (text) - Price trend indicator (up, down, stable)
  - `created_at` (timestamptz) - Prediction creation timestamp

  ## 2. Security

  ### Row Level Security (RLS)
  - RLS is enabled on all tables for data security
  - Public read access is granted for all commodity data (no authentication required)
  - This allows the application to display predictions to all users

  ### Access Policies
  - **commodities**: Public read access for viewing commodity information
  - **price_history**: Public read access for viewing historical data
  - **predictions**: Public read access for viewing predictions

  ## 3. Indexes
  - Composite index on (commodity_id, recorded_at) for efficient historical queries
  - Index on commodity_id in predictions table for fast lookup
  - Index on created_at in predictions table for sorting latest predictions

  ## 4. Sample Data
  Initial sample data is inserted for all 7 commodities with realistic prices and predictions
*/

-- Create commodities table
CREATE TABLE IF NOT EXISTS commodities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL UNIQUE,
  current_price numeric NOT NULL,
  unit text NOT NULL,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create price_history table
CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity_id uuid NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  price numeric NOT NULL,
  recorded_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity_id uuid NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  predicted_price numeric NOT NULL,
  prediction_date timestamptz DEFAULT now(),
  confidence numeric NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  trend text NOT NULL CHECK (trend IN ('up', 'down', 'stable')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_price_history_commodity_date 
  ON price_history(commodity_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_predictions_commodity 
  ON predictions(commodity_id);

CREATE INDEX IF NOT EXISTS idx_predictions_created 
  ON predictions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for commodities"
  ON commodities FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for price history"
  ON price_history FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for predictions"
  ON predictions FOR SELECT
  TO public
  USING (true);

-- Insert sample commodity data
INSERT INTO commodities (name, type, current_price, unit) VALUES
  ('Gold', 'gold', 63500.00, '₹/10g'),
  ('Silver', 'silver', 76500.00, '₹/kg'),
  ('Platinum', 'platinum', 31200.00, '₹/10g'),
  ('Petrol', 'petrol', 102.50, '₹/L'),
  ('Diesel', 'diesel', 89.75, '₹/L'),
  ('LPG', 'lpg', 1105.00, '₹/cylinder'),
  ('CNG', 'cng', 82.50, '₹/kg')
ON CONFLICT (type) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  last_updated = now();

-- Insert sample predictions
INSERT INTO predictions (commodity_id, predicted_price, confidence, trend)
SELECT 
  id,
  CASE type
    WHEN 'gold' THEN 64200.00
    WHEN 'silver' THEN 78000.00
    WHEN 'platinum' THEN 31800.00
    WHEN 'petrol' THEN 104.25
    WHEN 'diesel' THEN 90.50
    WHEN 'lpg' THEN 1095.00
    WHEN 'cng' THEN 83.75
  END,
  CASE type
    WHEN 'gold' THEN 0.87
    WHEN 'silver' THEN 0.82
    WHEN 'platinum' THEN 0.79
    WHEN 'petrol' THEN 0.91
    WHEN 'diesel' THEN 0.88
    WHEN 'lpg' THEN 0.75
    WHEN 'cng' THEN 0.85
  END,
  CASE type
    WHEN 'gold' THEN 'up'
    WHEN 'silver' THEN 'up'
    WHEN 'platinum' THEN 'up'
    WHEN 'petrol' THEN 'up'
    WHEN 'diesel' THEN 'up'
    WHEN 'lpg' THEN 'down'
    WHEN 'cng' THEN 'up'
  END
FROM commodities
ON CONFLICT DO NOTHING;

-- Generate sample historical data (last 90 days)
INSERT INTO price_history (commodity_id, price, recorded_at)
SELECT 
  c.id,
  c.current_price * (0.85 + (random() * 0.3)),
  now() - (interval '1 day' * generate_series(1, 90))
FROM commodities c
ON CONFLICT DO NOTHING;
