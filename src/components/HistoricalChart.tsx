import { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { PriceHistory } from '../types';

interface HistoricalChartProps {
  commodityId: string;
  basePrice: number;
}

// Mock data generation remains the same
const generateMockPriceHistory = (commodityId: string, basePrice: number, days: number): PriceHistory[] => {
  const history: PriceHistory[] = [];
  const pointCount = Math.max(days, 2);
  for (let i = 0; i < pointCount; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (pointCount - 1 - i));
    const randomFactor = 0.85 + Math.random() * 0.3;
    history.push({
      id: `${commodityId}-${i}`,
      commodity_id: commodityId,
      price: basePrice * randomFactor,
      recorded_at: date.toISOString(),
      created_at: new Date().toISOString(),
    });
  }
  return history;
};

// Removed createSmoothPath, we will use straight lines

export default function HistoricalChart({ commodityId, basePrice }: HistoricalChartProps) {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [hoveredPoint, setHoveredPoint] = useState<PriceHistory | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
    const data = generateMockPriceHistory(commodityId, basePrice, days);
    setPriceHistory(data);
  }, [commodityId, basePrice, timeframe]);

  const { maxPrice, minPrice, priceRange } = useMemo(() => {
    if (priceHistory.length === 0) return { maxPrice: 1, minPrice: 0, priceRange: 1 };
    const prices = priceHistory.map(p => p.price);
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    return { maxPrice: max, minPrice: min, priceRange: max - min || 1 };
  }, [priceHistory]);

  const svgWidth = 1000;
  const svgHeight = 300;

  const points = useMemo(() => priceHistory.map((point, i) => {
    const x = (i / (priceHistory.length - 1)) * svgWidth;
    const y = svgHeight - ((point.price - minPrice) / priceRange) * svgHeight;
    return { x, y, original: point };
  }).filter(p => !isNaN(p.x) && !isNaN(p.y)), [priceHistory, minPrice, priceRange]);

  // Use direct points for linePath to make it sharp
  const linePath = useMemo(() => points.map(p => `${p.x},${p.y}`).join(' '), [points]);
  
  // Adjusted areaPath for sharp lines
  const areaPath = useMemo(() => {
    if (points.length < 2) return '';
    return `M ${points[0]?.x},${svgHeight} L ${linePath} L ${points[points.length - 1]?.x},${svgHeight} Z`;
  }, [points, linePath]);


  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentX = x / rect.width;
    const index = Math.round(percentX * (points.length - 1));
    if (points[index]) {
      setHoveredPoint(points[index].original);
    }
  };

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case '1y': return 'Last Year';
    }
  };
  
  const activePoint = points.find(p => p.original.id === hoveredPoint?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-slate-300">
          <Calendar className="w-5 h-5" />
          <span className="font-medium">{getTimeframeLabel()}</span>
        </div>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d', '1y'] as const).map((tf) => (
            <button key={tf} onClick={() => setTimeframe(tf)} className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${timeframe === tf ? 'bg-red-500 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}>
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {priceHistory.length > 1 ? (
        <div className="relative">
          <div className="h-80 bg-slate-900/50 rounded-xl p-6 pr-2 border border-slate-700/50">
            <div className="relative h-full" onMouseLeave={() => setHoveredPoint(null)}>
              <svg ref={svgRef} onMouseMove={handleMouseMove} viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                  {/* Red Area Gradient */}
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" /> {/* Tailwind red-500 */}
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                  {/* Solid Red Line */}
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" /> {/* Tailwind red-500 */}
                    <stop offset="100%" stopColor="#dc2626" /> {/* Tailwind red-600 for a slight gradient effect */}
                  </linearGradient>
                </defs>
                
                {[0, 0.25, 0.5, 0.75, 1].map(v => (
                  <line key={v} x1="0" y1={v * svgHeight} x2={svgWidth} y2={v * svgHeight} stroke="var(--tw-color-slate-700)" strokeWidth="1" strokeDasharray="2 4"/>
                ))}
                
                <path d={areaPath} fill="url(#areaGradient)" />
                <polyline points={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                
                {activePoint && (
                  <g>
                    <line x1={activePoint.x} y1="0" x2={activePoint.x} y2={svgHeight} stroke="var(--tw-color-slate-500)" strokeWidth="1" />
                    <circle cx={activePoint.x} cy={activePoint.y} r="6" fill="var(--tw-color-slate-900)" stroke="#dc2626" strokeWidth="2" /> {/* Red stroke for hover circle */}
                  </g>
                )}
              </svg>

              {activePoint && (
                <div className="absolute top-0 left-0 p-2 bg-slate-800 border border-slate-700 rounded-lg whitespace-nowrap pointer-events-none transition-all duration-100 ease-out"
                  style={{ transform: `translate(${activePoint.x / svgWidth * 100}%, -100%) translateY(-15px) translateX(-50%)`}}>
                  <p className="text-white font-semibold text-sm">₹{activePoint.original.price.toFixed(2)}</p>
                  <p className="text-slate-400 text-xs">{new Date(activePoint.original.recorded_at).toLocaleDateString()}</p>
                </div>
              )}

              <div className="absolute left-0 top-0 -ml-16 h-full flex flex-col justify-between text-slate-400 text-sm">
                <span>₹{maxPrice.toFixed(0)}</span>
                <span>₹{((maxPrice + minPrice) / 2).toFixed(0)}</span>
                <span>₹{minPrice.toFixed(0)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Highest</p>
              <p className="text-white font-bold text-xl">₹{maxPrice.toFixed(2)}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Lowest</p>
              <p className="text-white font-bold text-xl">₹{minPrice.toFixed(2)}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Average</p>
              <p className="text-white font-bold text-xl">₹{(priceHistory.reduce((sum, p) => sum + p.price, 0) / priceHistory.length).toFixed(2)}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Data Points</p>
              <p className="text-white font-bold text-xl">{priceHistory.length}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-900/50 border border-slate-700/50 rounded-xl">
          <p className="text-slate-400">No historical data available for this timeframe</p>
        </div>
      )}
    </div>
  );
}