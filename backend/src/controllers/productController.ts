// import { Request, Response } from 'express';
// import path from 'path';
// import Product from '../models/Product';
// import { geocodeAddress } from '../services/geocodingService';
// export const createProduct = async (req: Request, res: Response) => {
//     try {
//         const productData = req.body;

//         // Géocodage de l'adresse
//         if (productData.address) {
//           try {
//             const geoResult = await geocodeAddress(productData.address);
//             productData.location = {
//               type: 'Point',
//               coordinates: geoResult.coordinates,
//               address: geoResult.formattedAddress
//             };
//           } catch (error) {
//             console.error('Erreur de géocodage:', error);
//             productData.location = {
//               type: 'Point',
//               coordinates: [0, 0],
//               address: productData.address
//             };
//           }
//         }
//     // Gestion des photos
//     if (req.files && Array.isArray(req.files)) {
//         productData.photos = req.files.map(file => {
//           // Créer une URL relative pour accéder aux images
//           return `/uploads/${path.basename(file.path)}`;
//         });
//       }

//       const product = await Product.create(productData);
//       res.status(201).json(product);
//     } catch (error) {
//       console.error('Erreur lors de la création du produit:', error);
//       if (error instanceof Error) {
//         res.status(500).json({
//           message: 'Erreur lors de la création du produit',
//           error: error.message
//         });
//       } else {
//         res.status(500).json({
//           message: 'Erreur lors de la création du produit',
//           error: 'Une erreur inconnue est survenue'
//         });
//       }
//     }
//   };
//   export const getProducts = async (req: Request, res: Response) => {
//     try {
//       const products = await Product.find().sort({ createdAt: -1 });
//       res.json(products);
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         res.status(500).json({ message: error.message });
//       } else {
//         res.status(500).json({ message: 'Une erreur inconnue est survenue' });
//       }
//     }
//   };

// export const getProductById = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return res.status(404).json({ message: 'Produit non trouvé' });
//     }
//     res.json(product);
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       res.status(500).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: 'Une erreur inconnue est survenue' });
//     }
//   }
// };


// 1ere version

// import { Request, Response } from 'express';
// import path from 'path';
// import Product from '../models/Product';
// import { geocodeAddress } from '../services/geocodingService';

// export const createProduct = async (req: Request, res: Response) => {
//     try {
//         const productData = {
//           ...req.body,
//           price: {
//             amount: Number(req.body.price?.amount || req.body['price[amount]']),
//             isNegotiable: req.body.price?.isNegotiable || req.body['price[isNegotiable]'] === 'true'
//           }
//         };

//         // Géocodage de l'adresse avec Google Maps
//         if (productData.address) {
//           try {
//             const geoResult = await geocodeAddress(productData.address);
//             productData.location = {
//               type: 'Point',
//               coordinates: geoResult.coordinates,
//               address: geoResult.formattedAddress // Utilise l'adresse formatée de Google
//             };
//           } catch (error) {
//             return res.status(400).json({
//               message: 'Erreur lors de la géolocalisation de l\'adresse',
//               error: (error instanceof Error ? error.message : 'Une erreur inconnue est survenue')
//             });
//           }
//         }
//     // Gestion des photos
//     if (req.files && Array.isArray(req.files)) {
//       productData.photos = req.files.map(file => {
//         // Créer une URL relative pour accéder aux images
//         return `/uploads/${path.basename(file.path)}`;
//       });
//     }

//     // Log des données avant la création
//     console.log('Données à sauvegarder:', productData);

//     // Validation des données requises
//     if (!productData.title || !productData.description || !productData.category) {
//       return res.status(400).json({
//         message: 'Tous les champs requis doivent être remplis'
//       });
//     }

//     // Validation du prix
//     if (!productData.price?.amount || isNaN(productData.price.amount)) {
//       return res.status(400).json({
//         message: 'Le prix doit être un nombre valide'
//       });
//     }

//     const product = await Product.create(productData);
//     res.status(201).json(product);
//   } catch (error) {
//     console.error('Erreur détaillée:', error); // Pour le débogage
//     if (error instanceof Error) {
//       res.status(500).json({
//         message: 'Erreur lors de la création du produit',
//         error: error.message,
//         details: process.env.NODE_ENV === 'development' ? error.stack : undefined
//       });
//     } else {
//       res.status(500).json({
//         message: 'Erreur lors de la création du produit',
//         error: 'Une erreur inconnue est survenue'
//       });
//     }
//   }
// };

// // Ajout d'une fonction pour rechercher par proximité
// export const searchNearby = async (req: Request, res: Response) => {
//     try {
//       const { address, maxDistance = 5000 } = req.query; // maxDistance en mètres

//       if (!address) {
//         return res.status(400).json({ message: 'Une adresse est requise' });
//       }

//       // Convertir l'adresse en coordonnées
//       const geoResult = await geocodeAddress(String(address));

//       // Recherche des produits à proximité
//       const products = await Product.find({
//         location: {
//           $near: {
//             $geometry: {
//               type: 'Point',
//               coordinates: geoResult.coordinates
//             },
//             $maxDistance: Number(maxDistance)
//           }
//         }
//       }).select('-__v');

//       res.json(products);
//     } catch (error) {
//       res.status(500).json({
//         message: 'Erreur lors de la recherche par proximité',
//         error: error instanceof Error ? error.message : 'Erreur inconnue'
//       });
//     }
//   };

// export const getProducts = async (req: Request, res: Response) => {
//   try {
//     // Ajout des filtres de recherche
//     const filters: any = {};
//     const { category, minPrice, maxPrice } = req.query;

//     if (category) {
//       filters.category = category;
//     }

//     if (minPrice || maxPrice) {
//       filters.price = {};
//       if (minPrice) filters.price.$gte = Number(minPrice);
//       if (maxPrice) filters.price.$lte = Number(maxPrice);
//     }

//     const products = await Product.find(filters)
//       .sort({ createdAt: -1 })
//       .select('-__v'); // Exclure le champ __v

//     res.json(products);
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       res.status(500).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: 'Une erreur inconnue est survenue' });
//     }
//   }
// };

// export const getProductById = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id)
//       .select('-__v'); // Exclure le champ __v

//     if (!product) {
//       return res.status(404).json({ message: 'Produit non trouvé' });
//     }

//     // Ajouter des informations supplémentaires si nécessaire
//     const enrichedProduct = {
//       ...product.toObject(),
//       imageUrls: product.photos.map(photo => `${req.protocol}://${req.get('host')}${photo}`),
//     };

//     res.json(enrichedProduct);
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       res.status(500).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: 'Une erreur inconnue est survenue' });
//     }
//   }
// };

// // Ajout d'une nouvelle fonction pour la recherche de produits
// export const searchProducts = async (req: Request, res: Response) => {
//   try {
//     const { query, category, minPrice, maxPrice } = req.query;
//     const searchCriteria: any = {};

//     if (query) {
//       searchCriteria.$or = [
//         { title: new RegExp(String(query), 'i') },
//         { description: new RegExp(String(query), 'i') }
//       ];
//     }

//     if (category) {
//       searchCriteria.category = category;
//     }

//     if (minPrice || maxPrice) {
//       searchCriteria['price.amount'] = {};
//       if (minPrice) searchCriteria['price.amount'].$gte = Number(minPrice);
//       if (maxPrice) searchCriteria['price.amount'].$lte = Number(maxPrice);
//     }

//     const products = await Product.find(searchCriteria)
//       .sort({ createdAt: -1 })
//       .select('-__v');

//     res.json(products);
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       res.status(500).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: 'Une erreur inconnue est survenue' });
//     }
//   }
// };

// 2eme version
import { Request, Response } from 'express';
import path from 'path';
import Product, { VALID_CATEGORIES } from '../models/Product';
import { geocodeAddress } from '../services/geocodingService';

interface ProductFilters {
  category?: string;
  'price.amount'?: {
    $gte?: number;
    $lte?: number;
  };
}

export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = {
      ...req.body,
      price: {
        amount: Number(req.body.price?.amount || req.body['price[amount]']),
        isNegotiable: req.body.price?.isNegotiable || req.body['price[isNegotiable]'] === 'true'
      }
    };

    if (!productData.title || !productData.description || !productData.category) {
      return res.status(400).json({
        message: 'Tous les champs requis doivent être remplis',
        required: ['title', 'description', 'category']
      });
    }

    if (!VALID_CATEGORIES.includes(productData.category.toLowerCase() as any)) {
      return res.status(400).json({
        message: 'Catégorie invalide',
        validCategories: VALID_CATEGORIES
      });
    }

    if (isNaN(productData.price.amount) || productData.price.amount <= 0) {
      return res.status(400).json({
        message: 'Le prix doit être un nombre positif'
      });
    }

    if (productData.address && productData.address.trim()) {
      try {
        const geoResult = await geocodeAddress(productData.address);
        productData.location = {
          type: 'Point',
          coordinates: geoResult.coordinates,
          address: geoResult.formattedAddress
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes('non trouvée')) {
          return res.status(400).json({
            message: 'Adresse non trouvée',
            error: error.message
          });
        }
        return res.status(400).json({
          message: 'Erreur lors de la géolocalisation de l\'adresse',
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    if (req.files && Array.isArray(req.files)) {
      productData.photos = req.files.map(file => `/uploads/${path.basename(file.path)}`);
    } else {
      productData.photos = [];
    }

    console.log('Données à sauvegarder:', JSON.stringify(productData, null, 2));

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Erreur création produit:', error);
    res.status(500).json({
      message: 'Erreur lors de la création du produit',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Obtenir tous les produits avec filtres
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    const filters: ProductFilters = {};

    // Application des filtres
    if (category && typeof category === 'string') {
      if (VALID_CATEGORIES.includes(category.toLowerCase() as any)) {
        filters.category = category.toLowerCase();
      } else {
        return res.status(400).json({
          message: 'Catégorie invalide',
          validCategories: VALID_CATEGORIES
        });
      }
    }

    // Filtre de prix
    if (minPrice || maxPrice) {
      filters['price.amount'] = {};
      if (minPrice) filters['price.amount'].$gte = Number(minPrice);
      if (maxPrice) filters['price.amount'].$lte = Number(maxPrice);
    }

    const products = await Product.find(filters)
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    res.json(products);
  } catch (error) {
    console.error('Erreur récupération produits:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des produits',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Obtenir un produit par ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('-__v')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Ajout des URLs complètes pour les images
    const enrichedProduct = {
      ...product,
      imageUrls: product.photos.map(photo =>
        `${req.protocol}://${req.get('host')}${photo}`
      )
    };

    res.json(enrichedProduct);
  } catch (error) {
    console.error('Erreur récupération produit:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération du produit',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Recherche de produits à proximité
export const searchNearby = async (req: Request, res: Response) => {
  try {
    const { address } = req.query;
    const maxDistance = 5000; // 5km fixe

    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        message: 'Une adresse valide est requise'
      });
    }

    const geoResult = await geocodeAddress(address);

    const products = await Product.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: geoResult.coordinates
          },
          $maxDistance: maxDistance
        }
      }
    })
    .select('-__v')
    .lean();

    res.json({
      results: products,
      metadata: {
        searchLocation: geoResult.formattedAddress,
        radius: maxDistance,
        count: products.length
      }
    });
  } catch (error) {
    console.error('Erreur recherche proximité:', error);
    res.status(500).json({
      message: 'Erreur lors de la recherche par proximité',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};