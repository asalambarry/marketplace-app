import express from 'express';
import {
    createProduct,
    deleteProduct,
    getProductById,
    getProducts,
    searchProducts,
    updateProduct,
} from '../controllers/productController';
import { upload } from '../middleware/upload';
import { validateProduct } from '../middleware/validateProduct';

const router = express.Router();

// Middleware pour gérer les erreurs asynchrones
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes pour les produits
router.post('/',
  upload.array('photos', 5), // Maximum 5 photos
  validateProduct,
  asyncHandler(createProduct)
);

// Route de recherche (doit être avant /:id pour éviter les conflits)
router.get('/search',
  asyncHandler(searchProducts)
);

// Route pour les statistiques
// router.get('/stats',
//   asyncHandler(getProductStats)
// );

// Routes CRUD standard
router.get('/',
  asyncHandler(getProducts)
);

router.get('/:id',
  asyncHandler(getProductById)
);

router.put('/:id',
  upload.array('photos', 5),
  validateProduct,
  asyncHandler(updateProduct)
);

router.delete('/:id',
  asyncHandler(deleteProduct)
);

export default router;