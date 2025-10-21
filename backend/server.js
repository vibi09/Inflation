require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Pusher = require('pusher');

const app = express();
app.use(cors());

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Store the current state of commodities
let commodities = [
    { id: '1', name: 'Gold', type: 'gold', current_price: 63500.00, unit: '₹/10g' },
    { id: '2', name: 'Silver', type: 'silver', current_price: 76500.00, unit: '₹/kg' },
    { id: '3', name: 'Platinum', type: 'platinum', current_price: 31200.00, unit: '₹/10g' },
    { id: '4', name: 'Petrol', type: 'petrol', current_price: 102.50, unit: '₹/L' },
    { id: '5', name: 'Diesel', type: 'diesel', current_price: 89.75, unit: '₹/L' },
    { id: '6', name: 'LPG', type: 'lpg', current_price: 1105.00, unit: '₹/cylinder' },
    { id: '7', name: 'CNG', type: 'cng', current_price: 82.50, unit: '₹/kg' },
];

// Endpoint for the frontend to get the initial list of commodities
app.get('/commodities', (req, res) => {
  res.json(commodities);
});

// Simulate real-time price updates every 3 seconds
setInterval(() => {
  // Update a random commodity's price
  const commodityIndex = Math.floor(Math.random() * commodities.length);
  const commodity = commodities[commodityIndex];
  const fluctuation = (Math.random() - 0.5) * 0.02; // +/- 1%
  commodity.current_price *= (1 + fluctuation);

  // Add other properties the frontend expects
  const updatedCommodity = {
      ...commodity,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
  };

  console.log(`Updating ${updatedCommodity.name}: ₹${updatedCommodity.current_price.toFixed(2)}`);

  // Trigger a Pusher event with the updated data
  pusher.trigger('commodities-channel', 'price-update', updatedCommodity)
  .catch(error => console.error('Pusher trigger error:', error));
}, 3000);

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));