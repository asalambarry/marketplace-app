
// // 2eme version
// import { Request, Response } from 'express';
// import path from 'path';
// import Product, { VALID_CATEGORIES } from '../models/Product';
// import { geocodeAddress } from '../services/geocodingService';

// interface ProductFilters {
//   category?: string;
//   'price.amount'?: {
//     $gte?: number;
//     $lte?: number;
//   };
// }

// export const createProduct = async (req: Request, res: Response) => {
//   try {
//     const productData = {
//       ...req.body,
//       price: {
//         amount: Number(req.body.price?.amount || req.body['price[amount]']),
//         isNegotiable: req.body.price?.isNegotiable || req.body['price[isNegotiable]'] === 'true'
//       }
//     };

//     if (!productData.title || !productData.description || !productData.category) {
//       return res.status(400).json({
//         message: 'Tous les champs requis doivent être remplis',
//         required: ['title', 'description', 'category']
//       });
//     }

//     if (!VALID_CATEGORIES.includes(productData.category.toLowerCase() as any)) {
//       return res.status(400).json({
//         message: 'Catégorie invalide',
//         validCategories: VALID_CATEGORIES
//       });
//     }

//     if (isNaN(productData.price.amount) || productData.price.amount <= 0) {
//       return res.status(400).json({
//         message: 'Le prix doit être un nombre positif'
//       });
//     }

//     if (productData.address && productData.address.trim()) {
//       try {
//         const geoResult = await geocodeAddress(productData.address);
//         productData.location = {
//           type: 'Point',
//           coordinates: geoResult.coordinates,
//           address: geoResult.formattedAddress
//         };
//       } catch (error) {
//         if (error instanceof Error && error.message.includes('non trouvée')) {
//           return res.status(400).json({
//             message: 'Adresse non trouvée',
//             error: error.message
//           });
//         }
//         return res.status(400).json({
//           message: 'Erreur lors de la géolocalisation de l\'adresse',
//           error: error instanceof Error ? error.message : 'Erreur inconnue'
//         });
//       }
//     }

//     if (req.files && Array.isArray(req.files)) {
//       productData.photos = req.files.map(file => `/uploads/${path.basename(file.path)}`);
//     } else {
//       productData.photos = [];
//     }

//     console.log('Données à sauvegarder:', JSON.stringify(productData, null, 2));

//     const product = await Product.create(productData);
//     res.status(201).json(product);
//   } catch (error) {
//     console.error('Erreur création produit:', error);
//     res.status(500).json({
//       message: 'Erreur lors de la création du produit',
//       error: error instanceof Error ? error.message : 'Erreur inconnue',
//       details: process.env.NODE_ENV === 'development' ? error : undefined
//     });
//   }
// };

// // Obtenir tous les produits avec filtres
// export const getProducts = async (req: Request, res: Response) => {
//   try {
//     const { category, minPrice, maxPrice } = req.query;
//     const filters: ProductFilters = {};

//     // Application des filtres
//     if (category && typeof category === 'string') {
//       if (VALID_CATEGORIES.includes(category.toLowerCase() as any)) {
//         filters.category = category.toLowerCase();
//       } else {
//         return res.status(400).json({
//           message: 'Catégorie invalide',
//           validCategories: VALID_CATEGORIES
//         });
//       }
//     }

//     // Filtre de prix
//     if (minPrice || maxPrice) {
//       filters['price.amount'] = {};
//       if (minPrice) filters['price.amount'].$gte = Number(minPrice);
//       if (maxPrice) filters['price.amount'].$lte = Number(maxPrice);
//     }

//     const products = await Product.find(filters)
//       .sort({ createdAt: -1 })
//       .select('-__v')
//       .lean();

//     res.json(products);
//   } catch (error) {
//     console.error('Erreur récupération produits:', error);
//     res.status(500).json({
//       message: 'Erreur lors de la récupération des produits',
//       error: error instanceof Error ? error.message : 'Erreur inconnue'
//     });
//   }
// };

// // Obtenir un produit par ID
// export const getProductById = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.findById(req.params.id)
//       .select('-__v')
//       .lean();

//     if (!product) {
//       return res.status(404).json({ message: 'Produit non trouvé' });
//     }

//     // Ajout des URLs complètes pour les images
//     const enrichedProduct = {
//       ...product,
//       imageUrls: product.photos.map(photo =>
//         `${req.protocol}://${req.get('host')}${photo}`
//       )
//     };

//     res.json(enrichedProduct);
//   } catch (error) {
//     console.error('Erreur récupération produit:', error);
//     res.status(500).json({
//       message: 'Erreur lors de la récupération du produit',
//       error: error instanceof Error ? error.message : 'Erreur inconnue'
//     });
//   }
// };
// // Mise à jour d'un produit
// export const updateProduct = async (req: Request, res: Response) => {
//     try {
//       const productId = req.params.id;
//       const updateData = { ...req.body };

//       // Gestion du prix
//       if (updateData.price) {
//         updateData.price = {
//           amount: Number(updateData.price?.amount || updateData['price[amount]']),
//           isNegotiable: updateData.price?.isNegotiable || updateData['price[isNegotiable]'] === 'true'
//         };
//       }
//       // Géocodage si nouvelle adresse
//     if (updateData.address) {
//         try {
//           const geoResult = await geocodeAddress(updateData.address);
//           updateData.location = {
//             type: 'Point',
//             coordinates: geoResult.coordinates,
//             address: geoResult.formattedAddress
//           };
//         } catch (error) {
//           return res.status(400).json({
//             message: 'Erreur lors de la géolocalisation de la nouvelle adresse',
//             error: error instanceof Error ? error.message : 'Erreur inconnue'
//           });
//         }
//       }

//       // Gestion des nouvelles photos
//       if (req.files && Array.isArray(req.files)) {
//         const newPhotos = req.files.map(file => `/uploads/${path.basename(file.path)}`);
//         // Ajouter aux photos existantes ou remplacer
//         updateData.photos = updateData.replacePhotos ? newPhotos : [...(updateData.photos || []), ...newPhotos];
//       }
//       const updatedProduct = await Product.findByIdAndUpdate(
//         productId,
//         updateData,
//         { new: true, runValidators: true }
//       );

//       if (!updatedProduct) {
//         return res.status(404).json({ message: 'Produit non trouvé' });
//       }

//       res.json(updatedProduct);
//     } catch (error) {
//       console.error('Erreur mise à jour produit:', error);
//       res.status(500).json({
//         message: 'Erreur lors de la mise à jour du produit',
//         error: error instanceof Error ? error.message : 'Erreur inconnue'
//       });
//     }
//   };
//   // Suppression d'un produit
// export const deleteProduct = async (req: Request, res: Response) => {
//     try {
//       const productId = req.params.id;
//       const product = await Product.findByIdAndDelete(productId);

//       if (!product) {
//         return res.status(404).json({ message: 'Produit non trouvé' });
//       }

//       // Suppression des photos associées
//       if (product.photos && product.photos.length > 0) {
//         product.photos.forEach(photo => {
//           const photoPath = path.join(__dirname, '../../uploads', path.basename(photo));
//           // Utiliser le module fs importé
//           const fs = require('fs');
//           fs.promises.unlink(photoPath).catch((err: any) => {
//             console.error('Erreur suppression photo:', err);
//           });
//         });
//       }

//       res.json({ message: 'Produit supprimé avec succès' });
//     } catch (error) {
//       console.error('Erreur suppression produit:', error);
//       res.status(500).json({
//         message: 'Erreur lors de la suppression du produit',
//         error: error instanceof Error ? error.message : 'Erreur inconnue'
//       });
//     }
//   };
//   // Recherche avancée de produits
// export const searchProducts = async (req: Request, res: Response) => {
//     try {
//       const {
//         query,
//         category,
//         minPrice,
//         maxPrice,
//         sortBy = 'createdAt',
//         sortOrder = 'desc',
//         page = 1,
//         limit = 10
//       } = req.query;

//       const filter: any = {};

//       // Recherche textuelle
//       if (query) {
//         filter.$or = [
//           { title: { $regex: query, $options: 'i' } },
//           { description: { $regex: query, $options: 'i' } }
//         ];
//       }
//        // Filtres
//     if (category) {
//         filter.category = category;
//       }

//       if (minPrice || maxPrice) {
//         filter['price.amount'] = {};
//         if (minPrice) filter['price.amount'].$gte = Number(minPrice);
//         if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
//       }

//       // Pagination
//       const skip = (Number(page) - 1) * Number(limit);

//       // Construction du tri
//       const sort: any = {};
//       sort[String(sortBy)] = sortOrder === 'desc' ? -1 : 1;

//       const [products, total] = await Promise.all([
//         Product.find(filter)
//           .sort(sort)
//           .skip(skip)
//           .limit(Number(limit))
//           .select('-__v')
//           .lean(),
//         Product.countDocuments(filter)
//       ]);
//        // Enrichir les URLs des images
//     const enrichedProducts = products.map(product => ({
//         ...product,
//         imageUrls: product.photos.map(photo =>
//           `${req.protocol}://${req.get('host')}${photo}`
//         )
//       }));

//       res.json({
//         results: enrichedProducts,
//         metadata: {
//           total,
//           page: Number(page),
//           totalPages: Math.ceil(total / Number(limit)),
//           hasMore: skip + products.length < total
//         }
//       });
//     } catch (error) {
//       console.error('Erreur recherche produits:', error);
//       res.status(500).json({
//         message: 'Erreur lors de la recherche des produits',
//         error: error instanceof Error ? error.message : 'Erreur inconnue'
//       });
//     }
//   };
//   // Statistiques des produits
// export const getProductStats = async (req: Request, res: Response) => {
//     try {
//       const stats = await Product.aggregate([
//         {
//           $group: {
//             _id: '$category',
//             count: { $sum: 1 },
//             avgPrice: { $avg: '$price.amount' },
//             minPrice: { $min: '$price.amount' },
//             maxPrice: { $max: '$price.amount' }
//           }
//         },
//         {
//           $project: {
//             category: '$_id',
//             count: 1,
//             avgPrice: { $round: ['$avgPrice', 2] },
//             minPrice: 1,
//             maxPrice: 1,
//             _id: 0
//           }
//         }
//       ]);
//       const total = await Product.countDocuments();
//       const withLocation = await Product.countDocuments({
//         'location.coordinates': { $exists: true }
//       });

//       res.json({
//         categoryStats: stats,
//         overall: {
//           total,
//           withLocation,
//           withoutLocation: total - withLocation
//         }
//       });
//     } catch (error) {
//       console.error('Erreur statistiques produits:', error);
//       res.status(500).json({
//         message: 'Erreur lors de la récupération des statistiques',
//         error: error instanceof Error ? error.message : 'Erreur inconnue'
//       });
//     }
//   };


import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import Product, { VALID_CATEGORIES } from '../models/Product';
import { geocodeAddress } from '../services/geocodingService';

interface ProductFilters {
  category?: string;
  'price.amount'?: {
    $gte?: number;
    $lte?: number;
  };
  $or?: Array<{
    [key: string]: {
      $regex: unknown;
      $options: string;
    };
  }>;
}

// Fonctions utilitaires
const validatePrice = (price: any): boolean => {
  const amount = Number(price?.amount || price['amount']);
  return !isNaN(amount) && amount > 0;
};

const formatImageUrls = (photos: string[], req: Request): string[] => {
  return photos.map(photo => `${req.protocol}://${req.get('host')}${photo}`);
};

// Création d'un produit
export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = {
      ...req.body,
      price: {
        amount: Number(req.body.price?.amount || req.body['price[amount]']),
        isNegotiable: req.body.price?.isNegotiable || req.body['price[isNegotiable]'] === 'true'
      }
    };

    // Validation de base
    if (!productData.title?.trim() || !productData.description?.trim() || !productData.category) {
      return res.status(400).json({
        message: 'Tous les champs requis doivent être remplis',
        required: ['title', 'description', 'category']
      });
    }

    // Normalisation de la catégorie
    productData.category = productData.category.toLowerCase();
    if (!VALID_CATEGORIES.includes(productData.category as any)) {
      return res.status(400).json({
        message: 'Catégorie invalide',
        validCategories: VALID_CATEGORIES
      });
    }

    // Validation du prix
    if (!validatePrice(productData.price)) {
      return res.status(400).json({
        message: 'Le prix doit être un nombre positif'
      });
    }

    // Géocodage de l'adresse
    if (productData.address?.trim()) {
      try {
        const geoResult = await geocodeAddress(productData.address);
        productData.location = {
          type: 'Point',
          coordinates: geoResult.coordinates,
          address: geoResult.formattedAddress
        };
      } catch (error) {
        return res.status(400).json({
          message: 'Erreur lors de la géolocalisation de l\'adresse',
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    // Gestion des photos
    if (req.files && Array.isArray(req.files)) {
      productData.photos = req.files.map(file => `/uploads/${path.basename(file.path)}`);
    } else {
      productData.photos = [];
    }

    const product = await Product.create(productData);
    res.status(201).json({
      ...product.toObject(),
      imageUrls: formatImageUrls(product.photos, req)
    });
  } catch (error) {
    console.error('Erreur création produit:', error);
    res.status(500).json({
      message: 'Erreur lors de la création du produit',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
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

    const enrichedProducts = products.map(product => ({
      ...product,
      imageUrls: formatImageUrls(product.photos, req)
    }));

    res.json(enrichedProducts);
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

      const enrichedProduct = {
        ...product,
        imageUrls: formatImageUrls(product.photos, req)
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

  // Mise à jour d'un produit
  export const updateProduct = async (req: Request, res: Response) => {
    try {
      const productId = req.params.id;
      const updateData = { ...req.body };

      // Validation du prix si présent
      if (updateData.price) {
        updateData.price = {
          amount: Number(updateData.price?.amount || updateData['price[amount]']),
          isNegotiable: updateData.price?.isNegotiable || updateData['price[isNegotiable]'] === 'true'
        };

        if (!validatePrice(updateData.price)) {
          return res.status(400).json({
            message: 'Le prix doit être un nombre positif'
          });
        }
      }

      // Validation de la catégorie si présente
      if (updateData.category) {
        updateData.category = updateData.category.toLowerCase();
        if (!VALID_CATEGORIES.includes(updateData.category as any)) {
          return res.status(400).json({
            message: 'Catégorie invalide',
            validCategories: VALID_CATEGORIES
          });
        }
      }

      // Géocodage si nouvelle adresse
      if (updateData.address?.trim()) {
        try {
          const geoResult = await geocodeAddress(updateData.address);
          updateData.location = {
            type: 'Point',
            coordinates: geoResult.coordinates,
            address: geoResult.formattedAddress
          };
        } catch (error) {
          return res.status(400).json({
            message: 'Erreur lors de la géolocalisation de la nouvelle adresse',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          });
        }
      }

      // Gestion des photos
      if (req.files && Array.isArray(req.files)) {
        const newPhotos = req.files.map(file => `/uploads/${path.basename(file.path)}`);
        const existingProduct = await Product.findById(productId);

        if (!existingProduct) {
          return res.status(404).json({ message: 'Produit non trouvé' });
        }

        updateData.photos = updateData.replacePhotos
          ? newPhotos
          : [...existingProduct.photos, ...newPhotos];
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true }
      ).lean();

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Produit non trouvé' });
      }

      res.json({
        ...updatedProduct,
        imageUrls: formatImageUrls(updatedProduct.photos, req)
      });
    } catch (error) {
      console.error('Erreur mise à jour produit:', error);
      res.status(500).json({
        message: 'Erreur lors de la mise à jour du produit',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  // Suppression d'un produit
  export const deleteProduct = async (req: Request, res: Response) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: 'Produit non trouvé' });
      }

      // Suppression des photos associées
      if (product.photos && product.photos.length > 0) {
        await Promise.all(product.photos.map(async (photo) => {
          const photoPath = path.join(__dirname, '../../uploads', path.basename(photo));
          try {
            await fs.unlink(photoPath);
          } catch (err) {
            console.error('Erreur suppression photo:', err);
          }
        }));
      }

      await Product.findByIdAndDelete(productId);
      res.json({ message: 'Produit supprimé avec succès' });
    } catch (error) {
      console.error('Erreur suppression produit:', error);
      res.status(500).json({
        message: 'Erreur lors de la suppression du produit',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  // Recherche de produits
  export const searchProducts = async (req: Request, res: Response) => {
    try {
      const {
        query,
        category,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = '1',
        limit = '10'
      } = req.query;

      const filter: ProductFilters = {};

      // Recherche textuelle
      if (query && typeof query === 'string') {
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ];
      }

      // Filtre par catégorie
      if (category && typeof category === 'string') {
        if (VALID_CATEGORIES.includes(category.toLowerCase() as any)) {
          filter.category = category.toLowerCase();
        } else {
          return res.status(400).json({
            message: 'Catégorie invalide',
            validCategories: VALID_CATEGORIES
          });
        }
      }

      // Filtre de prix
      if (minPrice || maxPrice) {
        filter['price.amount'] = {};
        if (minPrice) filter['price.amount'].$gte = Number(minPrice);
        if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
      }

      // Pagination
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(50, Math.max(1, Number(limit))); // Maximum 50 items par page
      const skip = (pageNum - 1) * limitNum;

      // Construction du tri
      const sort: { [key: string]: 1 | -1 } = {};
      sort[String(sortBy)] = sortOrder === 'desc' ? -1 : 1;

      const [products, total] = await Promise.all([
        Product.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .select('-__v')
          .lean(),
        Product.countDocuments(filter)
      ]);

      const enrichedProducts = products.map(product => ({
        ...product,
        imageUrls: formatImageUrls(product.photos, req)
      }));

      res.json({
        results: enrichedProducts,
        metadata: {
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum),
          hasMore: skip + products.length < total
        }
      });
    } catch (error) {
      console.error('Erreur recherche produits:', error);
      res.status(500).json({
        message: 'Erreur lors de la recherche des produits',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };