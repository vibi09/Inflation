export type CommodityType = 'gold' | 'silver' | 'platinum' | 'petrol' | 'diesel' | 'lpg' | 'cng';

export interface Commodity {
  id: string;
  name: string;
  type: CommodityType;
  current_price: number;
  unit: string;
  last_updated: string;
}

export interface PriceHistory {
  id: string;
  commodity_id: string;
  price: number;
  recorded_at: string;
  created_at: string;
}

export interface Prediction {
  id: string;
  commodity_id: string;
  predicted_price: number;
  prediction_date: string;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  created_at: string;
}
