export interface Spot {
  _id: string;
  name: string;
  location: string;
  description: string;
  category: string;
  bestTime: string;
  tips: string;
  safetyLevel: 'Safe' | 'Caution' | 'High Risk';
  liveStatus: 'Crowded' | 'Quiet' | 'Rainy' | 'Clear Sky';
  ecoFriendlyNotes: string;
  accessibility: string;
  localBusinessHint: string;
  ecoScore: number;
  latitude: number;
  longitude: number;
  image?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SpotFormData = Omit<Spot, '_id' | 'createdAt' | 'updatedAt' | 'image'> & {
  image?: File | null;
};
