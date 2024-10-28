import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface GeocodingResult {
  coordinates: [number, number];
  formattedAddress: string;
}

export const geocodeAddress = async (address: string): Promise<GeocodingResult> => {
  if (!address) {
    throw new Error('Adresse non fournie');
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    throw new Error('Clé API Google Maps non configurée');
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address: address,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    );

    if (response.data.status === 'ZERO_RESULTS') {
      throw new Error('Adresse non trouvée');
    }

    if (response.data.status !== 'OK') {
      throw new Error(`Erreur Google Maps: ${response.data.status}`);
    }

    const location = response.data.results[0].geometry.location;

    return {
      coordinates: [location.lng, location.lat], // MongoDB attend [longitude, latitude]
      formattedAddress: response.data.results[0].formatted_address
    };
  } catch (error) {
    console.error('Erreur de géocodage détaillée:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Erreur de géocodage: ${error.response?.data?.error_message || error.message}`);
    }
    throw error;
  }
};