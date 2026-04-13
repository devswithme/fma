import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import {
  adminProcedure,
  publicProcedure,
  protectedProcedure,
  router,
} from "./_core/trpc";
import {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  createOrder,
  createOrderItem,
  getOrderById,
  getOrderItems,
  getAllOrders,
  updateOrderStatus,
  upsertUser,
} from "./db";

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    loginWithPhone: publicProcedure
      .input(z.object({ phone: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const digits = digitsOnly(input.phone);
        if (digits !== ENV.staticAdminPhone) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid phone number",
          });
        }
        const openId = `phone:${digits}`;
        await upsertUser({
          openId,
          name: "Admin",
          loginMethod: "phone",
          role: "admin",
          lastSignedIn: new Date(),
        });
        const token = await sdk.createSessionToken(openId, {
          name: "Admin",
          expiresInMs: ONE_YEAR_MS,
        });
        const opts = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...opts, maxAge: ONE_YEAR_MS });
        return { success: true as const };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  food: router({
    list: publicProcedure.query(async () => {
      return getAllFoods();
    }),
    getById: publicProcedure
      .input(z.number().int())
      .query(async ({ input }) => {
        return getFoodById(input);
      }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          price: z.number().int().positive(),
          imageUrl: z.string().optional(),
          imageKey: z.string().optional(),
          stock: z.number().int().nonnegative(),
          isAvailable: z.number().int(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return createFood(input);
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number().int(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          price: z.number().int().positive().optional(),
          imageUrl: z.string().optional(),
          imageKey: z.string().optional(),
          stock: z.number().int().nonnegative().optional(),
          isAvailable: z.number().int().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        const { id, ...data } = input;
        return updateFood(id, data);
      }),
    delete: protectedProcedure
      .input(z.number().int())
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return deleteFood(input);
      }),
  }),

  order: router({
    create: publicProcedure
      .input(
        z.object({
          tableNumber: z.number().int().positive(),
          totalAmount: z.number().int().positive(),
          items: z.array(
            z.object({
              foodId: z.number().int(),
              quantity: z.number().int().positive(),
              priceAtPurchase: z.number().int().positive(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const orderId = await createOrder({
          tableNumber: input.tableNumber,
          totalAmount: input.totalAmount,
          status: "pending",
        });
        for (const item of input.items) {
          await createOrderItem({
            orderId,
            foodId: item.foodId,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
          });
        }
        return { orderId };
      }),
    getById: publicProcedure
      .input(z.number().int())
      .query(async ({ input }) => {
        const order = await getOrderById(input);
        if (!order) return null;
        const items = await getOrderItems(input);
        return { ...order, items };
      }),
    list: adminProcedure.query(async () => getAllOrders()),
    updateStatus: protectedProcedure
      .input(
        z.object({
          orderId: z.number().int(),
          status: z.enum(["pending", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return updateOrderStatus(input.orderId, input.status);
      }),
  }),
});

export type AppRouter = typeof appRouter;
