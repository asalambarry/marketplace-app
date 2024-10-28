import { Request, Response, NextFunction } from 'express';
import { VALID_CATEGORIES } from '../models/Product';

// Interface pour le type de prix
interface PriceData {
  amount: number;
  isNegotiable: boolean;
}

// Constantes de validation
const VALIDATION_RULES = {
  TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100
  },
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000
  },
  PRICE: {
    MIN: 0,
    MAX: 1000000
  }
};

export const validateProduct = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extraction et nettoyage des données
    const title = req.body.title?.trim();
    const description = req.body.description?.trim();
    const category = req.body.category?.trim().toLowerCase();

    // Gestion du prix qui peut venir sous différents formats
    const priceAmount = req.body.price?.amount || req.body['price[amount]'];
    const price: PriceData = {
      amount: Number(priceAmount),
      isNegotiable: req.body.price?.isNegotiable === true ||
                    req.body['price[isNegotiable]'] === 'true'
    };

    // Validation du titre
    if (!title) {
      res.status(400).json({
        message: 'Le titre est requis',
        field: 'title'
      });
      return;
    }

    if (title.length < VALIDATION_RULES.TITLE.MIN_LENGTH ||
        title.length > VALIDATION_RULES.TITLE.MAX_LENGTH) {
      res.status(400).json({
        message: `Le titre doit contenir entre ${VALIDATION_RULES.TITLE.MIN_LENGTH} et ${VALIDATION_RULES.TITLE.MAX_LENGTH} caractères`,
        field: 'title',
        current: title.length
      });
      return;
    }

    // Validation de la description
    if (!description) {
      res.status(400).json({
        message: 'La description est requise',
        field: 'description'
      });
      return;
    }

    if (description.length < VALIDATION_RULES.DESCRIPTION.MIN_LENGTH ||
        description.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH) {
      res.status(400).json({
        message: `La description doit contenir entre ${VALIDATION_RULES.DESCRIPTION.MIN_LENGTH} et ${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} caractères`,
        field: 'description',
        current: description.length
      });
      return;
    }

    // Validation de la catégorie
    if (!category) {
      res.status(400).json({
        message: 'La catégorie est requise',
        field: 'category'
      });
      return;
    }

    if (!VALID_CATEGORIES.includes(category as any)) {
      res.status(400).json({
        message: 'Catégorie invalide',
        field: 'category',
        validCategories: VALID_CATEGORIES,
        current: category
      });
      return;
    }

    // Validation du prix
    if (!price.amount || isNaN(price.amount)) {
      res.status(400).json({
        message: 'Le prix est requis et doit être un nombre',
        field: 'price.amount'
      });
      return;
    }

    if (price.amount < VALIDATION_RULES.PRICE.MIN) {
      res.status(400).json({
        message: 'Le prix doit être supérieur à 0',
        field: 'price.amount',
        current: price.amount
      });
      return;
    }

    if (price.amount > VALIDATION_RULES.PRICE.MAX) {
      res.status(400).json({
        message: 'Le prix ne peut pas dépasser 1 000 000',
        field: 'price.amount',
        current: price.amount
      });
      return;
    }

    // Validation des photos (si présentes)
    if (req.files && Array.isArray(req.files)) {
      const maxPhotos = 5;
      if (req.files.length > maxPhotos) {
        res.status(400).json({
          message: `Le nombre maximum de photos est de ${maxPhotos}`,
          field: 'photos',
          current: req.files.length
        });
        return;
      }

      // Vérification des types de fichiers
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const invalidFile = req.files.find(file => !allowedTypes.includes(file.mimetype));
      if (invalidFile) {
        res.status(400).json({
          message: 'Type de fichier non autorisé',
          field: 'photos',
          allowedTypes,
          invalidType: invalidFile.mimetype
        });
        return;
      }
    }

    // Nettoyer et assigner les données validées
    req.body = {
      ...req.body,
      title,
      description,
      category,
      price
    };

    next();
  } catch (error) {
    console.error('Erreur de validation:', error);
    res.status(500).json({
      message: 'Erreur lors de la validation des données',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};