import mongoose, { Document, Schema } from 'mongoose';

export const VALID_CATEGORIES = [
  'electronics',
  'furniture',
  'clothing',
  'books',
  'sports',
  'other',
  'telephone',
] as const;

interface Price {
  amount: number;
  isNegotiable: boolean;
}

interface Location {
  type: string;
  coordinates: number[];
  address: string;
}

export interface IProduct extends Document {
  title: string;
  description: string;
  category: string;
  price: Price;
  photos: string[];
  location?: Location;
  createdAt: Date;
}

const ProductSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    minlength: [3, 'Le titre doit contenir au moins 3 caractères'],
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    minlength: [10, 'La description doit contenir au moins 10 caractères']
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: {
      values: VALID_CATEGORIES,
      message: 'Catégorie non valide'
    }
  },
  price: {
    amount: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix doit être positif']
    },
    isNegotiable: {
      type: Boolean,
      default: false
    }
  },
  photos: [{
    type: String
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false
    },
    address: {
      type: String,
      required: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ProductSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });

export default mongoose.model<IProduct>('Product', ProductSchema);