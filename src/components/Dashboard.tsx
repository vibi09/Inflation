import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowLeft } from 'lucide-react';
import Pusher from 'pusher-js';
import { Commodity, Prediction } from '../types';
import CommodityCard from './CommodityCard';
import HistoricalChart from './HistoricalChart';

// Predictions can be static for now, as they don't change in real-time in our simulation.
const staticPredictions: Prediction[] = [
    { id: 'p1', commodity_id: '1', predicted_price: 64200.0, confidence: 0.87, trend: 'up', prediction_date: '', created_at: '' },
    { id: 'p2', commodity_id: '2', predicted_price: 78000.0, confidence: 0.82, trend: 'up', prediction_date: '', created_at: '' },
    { id: 'p3', commodity_id: '3', predicted_price: 31800.0, confidence: 0.79, trend: 'up', prediction_date: '', created_at: '' },
    { id: 'p4', commodity_id: '4', predicted_price: 104.25, confidence: 0.91, trend: 'up', prediction_date: '', created_at: '' },
    { id: 'p5', commodity_id: '5', predicted_price: 90.5, confidence: 0.88, trend: 'up', prediction_date: '', created_at: '' },
    { id: 'p6', commodity_id: '6', predicted_price: 1095.0, confidence: 0.75, trend: 'down', prediction_date: '', created_at: '' },
    { id: 'p7', commodity_id: '7', predicted_price: 83.75, confidence: 0.85, trend: 'up', prediction_date: '', created_at: '' },
];

interface DashboardProps {
  onBack: () => void;
}

export default function Dashboard({ onBack }: DashboardProps) {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [predictions] = useState<Prediction[]>(staticPredictions);
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch('http://localhost:4000/commodities');
        const data = await response.json();
        setCommodities(data);
      } catch (error) {
        console.error('Could not fetch initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe('commodities-channel');

    channel.bind('price-update', (updatedCommodity: Commodity) => {
      setCommodities((prevCommodities) =>
        prevCommodities.map((c) => (c.id === updatedCommodity.id ? updatedCommodity : c))
      );
    });

    return () => {
      channel.unbind_all && channel.unbind_all();
      pusher.unsubscribe('commodities-channel');
      pusher.disconnect();
    };
  }, []);

  const getCommodityPrediction = (commodityId: string) => {
    return predictions.find((p) => p.commodity_id === commodityId);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <Minus className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Connecting to data stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-300" />
              </button>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
                <span className="text-2xl font-bold text-white">PricePredict</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Live Dashboard</p>
              <p className="text-xs text-slate-500">Real-time predictions</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Market Predictions</h1>
          <p className="text-slate-400">AI-powered predictions for commodity prices</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {commodities.map((commodity) => {
            const prediction = getCommodityPrediction(commodity.id);
            return (
              <CommodityCard
                key={commodity.id}
                commodity={commodity}
                prediction={prediction}
                onClick={() => setSelectedCommodity(commodity)}
                getTrendIcon={getTrendIcon}
                getTrendColor={getTrendColor}
              />
            );
          })}
        </div>

        {selectedCommodity && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedCommodity.name} - Historical Data</h2>
              <button
                onClick={() => setSelectedCommodity(null)}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
            <HistoricalChart commodityId={selectedCommodity.id} basePrice={selectedCommodity.current_price} />
          </div>
        )}
      </main>
    </div>
  );
}