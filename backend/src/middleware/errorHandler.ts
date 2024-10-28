import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Erreur:', err);

  // Erreur de validation Multer
  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: 'Erreur lors de l\'upload des fichiers',
      error: err.message
    });
  }

  // Erreur de validation mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Erreur de validation',
      error: err.message
    });
  }

  // Erreur d'ID invalide
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'ID invalide',
      error: err.message
    });
  }

  // Erreur par défaut
  res.status(500).json({
    message: 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne du serveur'
  });
};