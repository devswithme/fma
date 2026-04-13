import type { ResultSetHeader } from "mysql2/promise";
import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, foods, orders, orderItems, InsertFood, InsertOrder, InsertOrderItem } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

/** Drizzle mysql2 insert returns `[ResultSetHeader, FieldPacket[]]` — `insertId` is on `[0]`. */
function readInsertId(result: unknown): number {
  const header = (Array.isArray(result) ? result[0] : result) as ResultSetHeader;
  const id = header?.insertId;
  if (typeof id !== "number" || id < 1) {
    throw new Error("Insert did not return a valid insertId");
  }
  return id;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      _db = drizzle(ENV.databaseUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllFoods() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(foods).orderBy(foods.createdAt);
}

export async function getFoodById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(foods).where(eq(foods.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createFood(data: InsertFood) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(foods).values(data);
  return result;
}

export async function updateFood(id: number, data: Partial<InsertFood>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(foods).set(data).where(eq(foods.id, id));
}

export async function deleteFood(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(foods).where(eq(foods.id, id));
}

export async function createOrder(data: InsertOrder): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  return readInsertId(result);
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrder(id: number, data: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set(data).where(eq(orders.id, id));
}

type OrderStatus = "pending" | "completed" | "cancelled";

/**
 * Updates order status and adjusts food stock when moving to/from `completed`
 * (deduct on complete, restore if leaving completed).
 */
export async function updateOrderStatus(orderId: number, newStatus: OrderStatus) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  const prev = order.status;
  if (prev === newStatus) {
    return db.update(orders).set({ status: newStatus }).where(eq(orders.id, orderId));
  }

  const items = await getOrderItems(orderId);

  if (newStatus === "completed" && prev !== "completed") {
    for (const item of items) {
      await db
        .update(foods)
        .set({
          stock: sql`GREATEST(0, ${foods.stock} - ${item.quantity})`,
        })
        .where(eq(foods.id, item.foodId));
    }
  } else if (prev === "completed" && newStatus !== "completed") {
    for (const item of items) {
      await db
        .update(foods)
        .set({
          stock: sql`${foods.stock} + ${item.quantity}`,
        })
        .where(eq(foods.id, item.foodId));
    }
  }

  return db.update(orders).set({ status: newStatus }).where(eq(orders.id, orderId));
}

export async function createOrderItem(data: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orderItems).values(data);
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}
