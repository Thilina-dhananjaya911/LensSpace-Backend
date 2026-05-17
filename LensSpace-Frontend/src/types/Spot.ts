export interface Spot {
  _id: string;
  title: string;
  location: string;
  description: string;
  category: string;
  bestTimeToVisit?: string;
  safetyLevel?: 'Safe' | 'Caution' | 'High Risk';
  imageUrl?: string;
  image?: string; // legacy fallback
  latitude?: number | null;
  longitude?: number | null;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SpotFormData = {
  title: string;
  location: string;
  description: string;
  category: string;
  bestTimeToVisit: string;
  safetyLevel: 'Safe' | 'Caution' | 'High Risk';
  image: File | null;
};
