import express from 'express';
import {
  createProduct,
  getProductById,
  getProducts,
  searchNearby
} from '../controllers/productController';
import { upload } from '../middleware/upload';
import { validateProduct } from '../middleware/validateProduct';
import { errorHandler } from '../middleware/errorHandler';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// Routes
router.post('/',
  upload.array('photos', 5),
  validateProduct,
  asyncHandler(createProduct)
);

router.get('/',
  asyncHandler(getProducts)
);

router.get('/nearby',
  asyncHandler(searchNearby)
);

router.get('/:id',
  asyncHandler(getProductById)
);

// Gestion d'erreur
// router.use(errorHandler);

export default router;