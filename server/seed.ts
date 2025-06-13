import { getDb } from "./db";
import { products, adminUsers, contactMessages } from "../shared/schema";

export async function seedDatabase() {
  try {
    const db = getDb();
    
    // Seed admin users
    await db.insert(adminUsers).values([
      {
        id: "admin-1",
        username: "admin",
        email: "admin@cuca.ao",
        firstName: "Admin",
        lastName: "CUCA",
        role: "admin",
        isActive: true,
      }
    ]).onConflictDoNothing();

    // Seed products
    await db.insert(products).values([
      {
        name: "CUCA Original",
        description: "A cerveja original que conquistou Angola com seu sabor único e refrescante.",
        price: "1500.00",
        category: "Cerveja",
        alcoholContent: "5.0",
        volume: 350,
        imageUrl: "/images/cuca-original.jpg",
        stock: 100,
        isActive: true,
      },
      {
        name: "CUCA Light",
        description: "Versão mais leve da CUCA, mantendo todo o sabor com menos calorias.",
        price: "1600.00",
        category: "Cerveja",
        alcoholContent: "4.2",
        volume: 350,
        imageUrl: "/images/cuca-light.jpg",
        stock: 75,
        isActive: true,
      },
      {
        name: "CUCA Premium",
        description: "A versão premium da CUCA com ingredientes selecionados e sabor refinado.",
        price: "2000.00",
        category: "Cerveja Premium",
        alcoholContent: "5.5",
        volume: 500,
        imageUrl: "/images/cuca-premium.jpg",
        stock: 50,
        isActive: true,
      }
    ]).onConflictDoNothing();

    // Seed contact messages
    await db.insert(contactMessages).values([
      {
        name: "João Silva",
        email: "joao@example.com",
        subject: "Pergunta sobre distribuidores",
        message: "Gostaria de saber mais sobre como me tornar um distribuidor da CUCA na minha região.",
        status: "unread",
      },
      {
        name: "Maria Santos",
        email: "maria@example.com",
        subject: "Produto defeituoso",
        message: "Comprei um pack de CUCA e uma das garrafas veio com defeito. Como posso resolver?",
        status: "read",
        adminResponse: "Obrigado pelo contato. Entraremos em contato para resolver a situação.",
      },
      {
        name: "Pedro Costa",
        email: "pedro@example.com",
        subject: "Sugestão de novo sabor",
        message: "Que tal criar uma versão da CUCA com sabor tropical? Seria um sucesso!",
        status: "unread",
      }
    ]).onConflictDoNothing();

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}