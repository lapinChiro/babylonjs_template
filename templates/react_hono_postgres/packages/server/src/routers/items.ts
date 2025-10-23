import { router, protectedProcedure } from "../lib/trpc";
import { z } from "zod";
import { db } from "../db";
import { items } from "../db/schema";
import { eq } from "drizzle-orm";

// Input validation schemas
const createItemSchema = z.object({
  name: z.string().min(1).max(255),
});

const updateItemSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255),
});

const deleteItemSchema = z.object({
  id: z.number(),
});

const getItemSchema = z.object({
  id: z.number(),
});

export const itemsRouter = router({
  // Get all items
  getAll: protectedProcedure.query(async () => {
    const allItems = await db.select().from(items).orderBy(items.createdAt);
    return allItems;
  }),

  // Get item by ID
  getById: protectedProcedure
    .input(getItemSchema)
    .query(async ({ input }) => {
      const [item] = await db
        .select()
        .from(items)
        .where(eq(items.id, input.id))
        .limit(1);

      if (!item) {
        throw new Error("Item not found");
      }

      return item;
    }),

  // Create new item
  create: protectedProcedure
    .input(createItemSchema)
    .mutation(async ({ input }) => {
      const [newItem] = await db
        .insert(items)
        .values({
          name: input.name,
        })
        .returning();

      return newItem;
    }),

  // Update item
  update: protectedProcedure
    .input(updateItemSchema)
    .mutation(async ({ input }) => {
      const [updatedItem] = await db
        .update(items)
        .set({
          name: input.name,
        })
        .where(eq(items.id, input.id))
        .returning();

      if (!updatedItem) {
        throw new Error("Item not found");
      }

      return updatedItem;
    }),

  // Delete item
  delete: protectedProcedure
    .input(deleteItemSchema)
    .mutation(async ({ input }) => {
      const [deletedItem] = await db
        .delete(items)
        .where(eq(items.id, input.id))
        .returning();

      if (!deletedItem) {
        throw new Error("Item not found");
      }

      return { success: true };
    }),
});
