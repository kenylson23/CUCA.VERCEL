import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { 
  insertContactMessageSchema,
  insertProductSchema,
  insertOrderSchema,
  insertAnalyticsEventSchema,
  insertFanPhotoSchema 
} from "../shared/schema.js";
import { getSimpleSession, requireAuth, loginHandler, logoutHandler, getUserHandler, registerHandler } from "./simpleAuth.js";
import { vercelLoginHandler, vercelLogoutHandler, vercelRequireAuth, vercelGetUserHandler, vercelRegisterHandler } from "./vercelAuth.js";
import cookieParser from "cookie-parser";
import { seedDatabase } from "./seed.js";
import { z } from "zod";
import type { RequestHandler } from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add cookie parser for JWT authentication
  app.use(cookieParser());
  
  // Initialize session middleware
  app.use(getSimpleSession());
  
  // Seed database on startup
  await seedDatabase();

  // Detect environment and use appropriate auth handlers
  const isVercel = process.env.VERCEL === '1';
  console.log('Authentication mode:', isVercel ? 'JWT (Vercel)' : 'Session (Traditional)');

  // Auth routes - use Vercel handlers if in Vercel environment
  if (isVercel) {
    app.post('/api/auth/login', vercelLoginHandler);
    app.post('/api/auth/register', vercelRegisterHandler);
    app.post('/api/auth/logout', vercelLogoutHandler);
    app.get('/api/auth/user', vercelGetUserHandler);
  } else {
    app.post('/api/auth/login', loginHandler);
    app.post('/api/auth/register', registerHandler);
    app.post('/api/auth/logout', logoutHandler);
    app.get('/api/auth/user', getUserHandler);
  }

  // Set the appropriate auth middleware based on environment
  const authMiddleware: RequestHandler = isVercel ? vercelRequireAuth : requireAuth;

  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.json({ success: true, message: "Mensagem enviada com sucesso!" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Erro interno do servidor" 
        });
      }
    }
  });

  // Admin routes (protected)
  app.get("/api/admin/contact-messages", authMiddleware, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.patch("/api/admin/contact-messages/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const message = await storage.updateContactMessage(id, updates);
      res.json(message);
    } catch (error) {
      console.error("Error updating contact message:", error);
      res.status(500).json({ message: "Failed to update message" });
    }
  });

  // Product management routes
  app.get("/api/admin/products", authMiddleware, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const activeProducts = products.filter(p => p.isActive);
      res.json(activeProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", authMiddleware, async (req, res) => {
    try {
      const result = insertProductSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: result.error.issues,
        });
      }

      const product = await storage.createProduct(result.data);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/admin/products/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const product = await storage.updateProduct(id, updates);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Customer management routes
  app.get("/api/admin/customers", authMiddleware, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.patch("/api/admin/customers/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const customer = await storage.updateCustomer(id, updates);
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  // Order management routes
  app.get("/api/admin/orders", authMiddleware, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch("/api/admin/orders/:id/status", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const order = await storage.updateOrderStatus(id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Analytics routes
  app.post("/api/analytics", async (req, res) => {
    try {
      const result = insertAnalyticsEventSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: result.error.issues,
        });
      }

      const event = await storage.createAnalyticsEvent(result.data);
      res.json(event);
    } catch (error) {
      console.error("Error creating analytics event:", error);
      res.status(500).json({ message: "Failed to create analytics event" });
    }
  });

  app.get("/api/admin/analytics", authMiddleware, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const events = await storage.getAnalyticsEvents(limit);
      res.json(events);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Dashboard stats
  app.get("/api/admin/stats", authMiddleware, async (req, res) => {
    try {
      const [products, customers, orders, messages] = await Promise.all([
        storage.getProducts(),
        storage.getCustomers(),
        storage.getOrders(),
        storage.getContactMessages()
      ]);

      const stats = {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isActive).length,
        totalCustomers: customers.length,
        activeCustomers: customers.filter(c => c.isActive).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        unreadMessages: messages.filter(m => !m.isRead).length,
        totalRevenue: orders
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0)
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Fan Gallery routes
  app.post("/api/fan-gallery", authMiddleware, async (req, res) => {
    try {
      // Check if session is properly initialized
      if (!req.session) {
        return res.status(500).json({ message: "Erro de configuração da sessão" });
      }

      const result = insertFanPhotoSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Dados inválidos",
          errors: result.error.issues,
        });
      }

      const userId = (req.session as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Create photo data with metadata (image already uploaded via frontend)
      const photoData = { ...result.data, userId };
      const photo = await storage.createFanPhoto(photoData);
      
      res.json({ 
        success: true, 
        message: "Foto enviada com sucesso! Aguardando aprovação.", 
        photo 
      });
    } catch (error) {
      console.error("Error in fan gallery upload:", error);
      res.status(500).json({ message: "Erro ao processar foto" });
    }
  });

  app.get("/api/fan-gallery", async (req, res) => {
    try {
      const photos = await storage.getApprovedFanPhotos();
      res.json(photos);
    } catch (error) {
      console.error("Error fetching approved photos:", error);
      res.status(500).json({ message: "Erro ao buscar fotos" });
    }
  });

  // Admin fan gallery routes
  app.get("/api/admin/fan-gallery", authMiddleware, async (req, res) => {
    try {
      const photos = await storage.getFanPhotos();
      res.json(photos);
    } catch (error) {
      console.error("Error fetching all photos:", error);
      res.status(500).json({ message: "Erro ao buscar fotos" });
    }
  });

  app.get("/api/admin/fan-gallery/pending", authMiddleware, async (req, res) => {
    try {
      const photos = await storage.getPendingFanPhotos();
      res.json(photos);
    } catch (error) {
      console.error("Error fetching pending photos:", error);
      res.status(500).json({ message: "Erro ao buscar fotos pendentes" });
    }
  });

  app.patch("/api/admin/fan-gallery/:id/approve", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const adminUser = (req.session as any).user?.username || "admin";
      
      const photo = await storage.updateFanPhotoStatus(id, "approved", adminUser);
      res.json({ success: true, message: "Foto aprovada com sucesso!", photo });
    } catch (error) {
      console.error("Error approving photo:", error);
      res.status(500).json({ message: "Erro ao aprovar foto" });
    }
  });

  app.patch("/api/admin/fan-gallery/:id/reject", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const adminUser = (req.session as any).user?.username || "admin";
      
      const photo = await storage.updateFanPhotoStatus(id, "rejected", adminUser);
      res.json({ success: true, message: "Foto rejeitada com sucesso!", photo });
    } catch (error) {
      console.error("Error rejecting photo:", error);
      res.status(500).json({ message: "Erro ao rejeitar foto" });
    }
  });

  app.delete("/api/admin/fan-gallery/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get photo details before deletion to check if it has storage key
      const photo = await storage.getFanPhoto(id);
      
      // Delete from Supabase Storage if it exists
      if (photo?.storageKey) {
        try {
          const { deleteImageFromSupabase, isSupabaseConfigured } = await import('./supabaseStorage');
          
          if (isSupabaseConfigured()) {
            await deleteImageFromSupabase(photo.storageKey);
          }
        } catch (storageError) {
          console.warn('Failed to delete image from Supabase Storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }
      
      await storage.deleteFanPhoto(id);
      res.json({ success: true, message: "Foto removida com sucesso!" });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ message: "Erro ao remover foto" });
    }
  });

  // User photo routes (authenticated)
  app.get("/api/user/my-photos", authMiddleware, async (req, res) => {
    try {
      const userId = (req.session as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const photos = await storage.getUserPhotos(userId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching user photos:", error);
      res.status(500).json({ message: "Erro ao buscar suas fotos" });
    }
  });

  // API 404 handler - catch any unmatched API routes and return JSON instead of HTML
  app.use('/api/*', (req, res) => {
    res.status(404).json({ 
      message: "API endpoint not found",
      path: req.path,
      method: req.method
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
