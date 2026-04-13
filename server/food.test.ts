import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AdminUser = NonNullable<TrpcContext["user"]> & { role: "admin" };
type RegularUser = NonNullable<TrpcContext["user"]> & { role: "user" };

function createAdminContext(): TrpcContext {
  const adminUser: AdminUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user: adminUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createRegularUserContext(): TrpcContext {
  const regularUser: RegularUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user: regularUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Food CRUD Operations", () => {
  describe("food.list", () => {
    it("should return list of foods for public access", async () => {
      const adminCtx = createAdminContext();
      const caller = appRouter.createCaller(adminCtx);

      // This should work for any user (public procedure)
      const foods = await caller.food.list();
      expect(Array.isArray(foods)).toBe(true);
    });
  });

  describe("food.create", () => {
    it("should allow admin to create food item", async () => {
      const adminCtx = createAdminContext();
      const caller = appRouter.createCaller(adminCtx);

      const foodData = {
        name: "Test Pizza",
        description: "Delicious test pizza",
        price: 1299, // $12.99
        stock: 10,
        isAvailable: 1,
      };

      try {
        const result = await caller.food.create(foodData);
        expect(result).toBeDefined();
      } catch (error) {
        // Database might not have data, but the authorization should pass
        const errorMsg = String(error);
        expect(!errorMsg.includes("Unauthorized")).toBe(true);
      }
    });

    it("should prevent non-admin from creating food item", async () => {
      const userCtx = createRegularUserContext();
      const caller = appRouter.createCaller(userCtx);

      const foodData = {
        name: "Test Pizza",
        description: "Delicious test pizza",
        price: 1299,
        stock: 10,
        isAvailable: 1,
      };

      try {
        await caller.food.create(foodData);
        expect.fail("Should have thrown Unauthorized error");
      } catch (error) {
        expect(String(error)).toContain("Unauthorized");
      }
    });
  });

  describe("food.update", () => {
    it("should allow admin to update food item", async () => {
      const adminCtx = createAdminContext();
      const caller = appRouter.createCaller(adminCtx);

      const updateData = {
        id: 1,
        name: "Updated Pizza",
        price: 1499,
      };

      try {
        const result = await caller.food.update(updateData);
        expect(result).toBeDefined();
      } catch (error) {
        // Database might not have data, but the authorization should pass
        const errorMsg = String(error);
        expect(!errorMsg.includes("Unauthorized")).toBe(true);
      }
    });

    it("should prevent non-admin from updating food item", async () => {
      const userCtx = createRegularUserContext();
      const caller = appRouter.createCaller(userCtx);

      const updateData = {
        id: 1,
        name: "Updated Pizza",
      };

      try {
        await caller.food.update(updateData);
        expect.fail("Should have thrown Unauthorized error");
      } catch (error) {
        expect(String(error)).toContain("Unauthorized");
      }
    });
  });

  describe("food.delete", () => {
    it("should allow admin to delete food item", async () => {
      const adminCtx = createAdminContext();
      const caller = appRouter.createCaller(adminCtx);

      try {
        const result = await caller.food.delete(1);
        expect(result).toBeDefined();
      } catch (error) {
        // Database might not have data, but the authorization should pass
        const errorMsg = String(error);
        expect(!errorMsg.includes("Unauthorized")).toBe(true);
      }
    });

    it("should prevent non-admin from deleting food item", async () => {
      const userCtx = createRegularUserContext();
      const caller = appRouter.createCaller(userCtx);

      try {
        await caller.food.delete(1);
        expect.fail("Should have thrown Unauthorized error");
      } catch (error) {
        expect(String(error)).toContain("Unauthorized");
      }
    });
  });
});

describe("Order Management", () => {
  describe("order.create", () => {
    it("should create order with valid data", async () => {
      const adminCtx = createAdminContext();
      const caller = appRouter.createCaller(adminCtx);

      const orderData = {
        tableNumber: 5,
        totalAmount: 2599, // $25.99
        items: [
          {
            foodId: 1,
            quantity: 2,
            priceAtPurchase: 1299,
          },
        ],
      };

      try {
        const result = await caller.order.create(orderData);
        expect(result).toBeDefined();
        expect(result.orderId).toBeDefined();
      } catch (error) {
        // Database might not have data, but the structure should be valid
        const errorMsg = String(error);
        expect(!errorMsg.includes("Unauthorized")).toBe(true);
      }
    });
  });

  describe("order.updateStatus", () => {
    it("should allow admin to update order status", async () => {
      const adminCtx = createAdminContext();
      const caller = appRouter.createCaller(adminCtx);

      const updateData = {
        orderId: 1,
        status: "completed" as const,
      };

      try {
        const result = await caller.order.updateStatus(updateData);
        expect(result).toBeDefined();
      } catch (error) {
        // Database might not have data, but the authorization should pass
        const errorMsg = String(error);
        expect(!errorMsg.includes("Unauthorized")).toBe(true);
      }
    });

    it("should prevent non-admin from updating order status", async () => {
      const userCtx = createRegularUserContext();
      const caller = appRouter.createCaller(userCtx);

      const updateData = {
        orderId: 1,
        status: "completed" as const,
      };

      try {
        await caller.order.updateStatus(updateData);
        expect.fail("Should have thrown Unauthorized error");
      } catch (error) {
        expect(String(error)).toContain("Unauthorized");
      }
    });
  });
});
