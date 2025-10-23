import { router, publicProcedure, protectedProcedure } from "../lib/trpc";
import { userRouter } from "./user";
import { itemsRouter } from "./items";
import { imagesRouter } from "./images";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  user: userRouter,
  items: itemsRouter,
  images: imagesRouter,
});

export type AppRouter = typeof appRouter;
