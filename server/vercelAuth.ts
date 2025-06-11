import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { storage } from "./storage";

// JWT-based authentication for Vercel serverless environment
const JWT_SECRET = process.env.JWT_SECRET || "cuca-jwt-secret-2024";
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "cuca2024"
};

interface JWTPayload {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const vercelLoginHandler: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Usuário e senha são obrigatórios" 
      });
    }

    // Check for admin login first
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const user = {
        id: "admin-1",
        username: "admin",
        email: "admin@cuca.ao",
        firstName: "Admin",
        lastName: "CUCA",
        role: "admin"
      };

      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
      
      // Set JWT as httpOnly cookie
      res.cookie('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });

      return res.json({ 
        success: true, 
        message: "Login realizado com sucesso",
        user
      });
    }

    // Check for regular user login
    const user = await storage.getCustomerByUsername(username);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Usuário não encontrado" 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Senha incorreta" 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: "Conta desativada" 
      });
    }

    const userPayload = {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: "user"
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    return res.json({ 
      success: true, 
      message: "Login realizado com sucesso",
      user: userPayload
    });
  } catch (error) {
    console.error("Error during Vercel login:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erro interno do servidor" 
    });
  }
};

export const vercelLogoutHandler: RequestHandler = (req, res) => {
  res.clearCookie('auth-token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });
  res.json({ success: true, message: "Logout realizado com sucesso" });
};

export const vercelRequireAuth: RequestHandler = (req, res, next) => {
  const token = req.cookies['auth-token'];
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Simulate session structure for compatibility
    (req as any).session = {
      isAuthenticated: true,
      user: decoded
    };
    (req as any).user = decoded;
    
    return next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const vercelGetUserHandler: RequestHandler = (req, res) => {
  const token = req.cookies['auth-token'];
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    res.json(decoded);
  } catch (error) {
    console.error("JWT verification failed:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const vercelRegisterHandler: RequestHandler = async (req, res) => {
  const { name, email, username, password } = req.body;

  if (!name || !email || !username || !password) {
    return res.status(400).json({
      success: false,
      message: "Todos os campos são obrigatórios"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "A senha deve ter pelo menos 6 caracteres"
    });
  }

  try {
    const existingUser = await storage.getCustomerByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Nome de usuário já está em uso"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    const newUser = await storage.createCustomer({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword
    });

    const userPayload = {
      id: newUser.id.toString(),
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: "user"
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.json({
      success: true,
      message: "Conta criada com sucesso!",
      user: userPayload
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};