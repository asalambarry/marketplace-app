import { NextFunction, Request, Response } from 'express';

export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password, name } = req.body;
  const errors: string[] = [];

  // Validation email
  if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
    errors.push('Email invalide');
  }

  // Validation mot de passe
  if (!password || password.length < 6) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
  }

  // Validation nom
  if (!name || name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
    errors.push('Email invalide');
  }

  if (!password) {
    errors.push('Mot de passe requis');
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};