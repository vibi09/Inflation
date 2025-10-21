import { Commodity, Prediction } from '../types';

interface CommodityCardProps {
  commodity: Commodity;
  prediction?: Prediction;
  onClick: () => void;
  getTrendIcon: (trend: string) => JSX.Element;
  getTrendColor: (trend: string) => string;
}

export default function CommodityCard({
  commodity,
  prediction,
  onClick,
  getTrendIcon,
  getTrendColor
}: CommodityCardProps) {
  const priceChange = prediction
    ? ((prediction.predicted_price - commodity.current_price) / commodity.current_price) * 100
    : 0;

  const getCommodityGradient = (type: string) => {
    const gradients: Record<string, string> = {
      gold: 'from-yellow-500 to-yellow-600',
      silver: 'from-slate-400 to-slate-500',
      platinum: 'from-gray-300 to-gray-400',
      petrol: 'from-orange-500 to-red-500',
      diesel: 'from-amber-600 to-orange-600',
      lpg: 'from-blue-500 to-blue-600',
      cng: 'from-green-500 to-green-600'
    };
    return gradients[type] || 'from-emerald-500 to-cyan-500';
  };

  return (
    <button
      onClick={onClick}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 hover:border-emerald-500/50 transition-all duration-200 hover:scale-105 text-left w-full group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${getCommodityGradient(commodity.type)} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
          <span className="text-white font-bold text-sm">
            {commodity.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        {prediction && (
          <div className="flex items-center space-x-1">
            {getTrendIcon(prediction.trend)}
          </div>
        )}
      </div>

      <h3 className="text-white font-semibold text-xl mb-1">{commodity.name}</h3>
      <p className="text-slate-400 text-sm mb-4">{commodity.unit}</p>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-slate-400 text-sm">Current Price</span>
          <span className="text-white font-bold text-lg">
            ₹{commodity.current_price.toFixed(2)}
          </span>
        </div>

        {prediction && (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-slate-400 text-sm">Predicted</span>
              <span className={`font-bold text-lg ${getTrendColor(prediction.trend)}`}>
                ₹{prediction.predicted_price.toFixed(2)}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-2 border-t border-slate-700/50">
              <span className="text-slate-400 text-sm">Change</span>
              <span className={`font-semibold ${getTrendColor(prediction.trend)}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-slate-400 text-sm">Confidence</span>
              <span className="text-slate-300 font-medium">
                {(prediction.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </>
        )}
      </div>

      {!prediction && (
        <div className="mt-4 text-center py-3 bg-slate-700/30 rounded-lg">
          <p className="text-slate-400 text-sm">No prediction available</p>
        </div>
      )}
    </button>
  );
}
