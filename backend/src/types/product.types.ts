export interface IProductInput {
    title: string;
    description: string;
    category: string;
    price: {
      amount: number;
      isNegotiable: boolean;
    };
    photos: string[];
    location: {
      coordinates: [number, number];
      address: string;
    };
    userId: string;
  }

  export interface IProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: {
      coordinates: [number, number];
      maxDistance: number;
    };
  }