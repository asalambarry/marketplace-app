import { Request, Response } from 'express';
import User from '../models/User';
const jwt = require('jsonwebtoken');

// Inscription
export const register = async (req: Request, res: Response) => {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT secrets must be defined in environment variables');
      }
      
  try {
    const { email, password, name } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'Un compte existe déjà avec cet email'
      });
    }

    // Créer le nouvel utilisateur
    const user = new User({
      email,
      password,
      name
    });

    // Sauvegarder l'utilisateur
    await user.save();

    // Générer les tokens
    const authToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    await user.save();

    res.status(201).json({
      message: 'Inscription réussie',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      tokens: {
        authToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      message: 'Erreur lors de l\'inscription',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Connexion
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer les tokens
    const authToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    await user.save();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      tokens: {
        authToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      message: 'Erreur lors de la connexion',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Déconnexion
export const logout = async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    res.status(500).json({
      message: 'Erreur lors de la déconnexion',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Rafraîchir le token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({
        message: 'Refresh token manquant'
      });
    }

    // Vérifier le refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({
        message: 'Refresh token invalide'
      });
    }

    // Vérifier la validité du refresh token
    try {

      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    } catch (error) {
      user.refreshToken = undefined;
      await user.save();
      return res.status(401).json({
        message: 'Refresh token expiré'
      });
    }

    // Générer un nouveau auth token
    const newAuthToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();
    await user.save();

    res.json({
      tokens: {
        authToken: newAuthToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Erreur refresh token:', error);
    res.status(500).json({
      message: 'Erreur lors du rafraîchissement du token',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};