

export enum ActivityType {
  CAMPING = 'Camping',
  TREKKING = 'Trekking',
  BEACH = 'Beach',
  WINTER = 'Winter',
  EVENT = 'Event',
  LAKESIDE = 'Lakeside',
}

export interface Kit {
  id: string;
  name:string;
  price: string;
  description: string;
  items: string[];
  imageUrl: string;
  activityType: ActivityType[];
  features: string[];
}

export enum AddOnCategory {
  COMFORT_UTILITY = 'Comfort & Utility',
  LIGHTING_AMBIENCE = 'Lighting & Ambience',
  ENTERTAINMENT_TECH = 'Entertainment & Tech',
  COOKING_FOOD = 'Cooking & Food',
  SAFETY_HEALTH = 'Safety & Health',
  GAMES_FUN = 'Games & Fun',
}

export enum PriceType {
  PER_NIGHT = 'per night',
  PER_ITEM = 'per item',
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  priceType: PriceType;
  category: AddOnCategory;
  description?: string;
}

export enum BookingStatus {
  PENDING = 'Pending Confirmation',
  CONFIRMED = 'Confirmed',
  DISPATCHED = 'Kit Dispatched',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export interface User {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  isAdmin?: boolean;
  loyaltyPoints?: number;
}

// Fix: Add missing types for map feature.
export enum MarkerType {
  TENT = 'TENT',
  COOKING = 'COOKING',
}

export interface MapMarkerData {
  id: string;
  type: MarkerType;
  title: string;
  description: string;
  coordinates: {
    top: string;
    left: string;
  };
}

export interface TouristLocation {
  id: string;
  name: string;
  description: string;
  mapImageUrl: string;
  activityType: ActivityType;
  markers: MapMarkerData[];
}
