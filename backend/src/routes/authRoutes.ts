import express, { Router } from 'express';
import {
    login,
    logout,
    refreshToken,
    register
} from '../controllers/authController';
import { auth } from '../middleware/auth';
import { validateLogin, validateRegistration } from '../middleware/validateAuth';

const router: Router = express.Router();

// Routes publiques
router.post('/register', validateRegistration, register as express.RequestHandler);
router.post('/login', validateLogin, login as express.RequestHandler);
router.post('/refresh-token', refreshToken as express.RequestHandler);

// Routes protégées
router.use(auth);
router.post('/logout', logout as express.RequestHandler);

export default router;