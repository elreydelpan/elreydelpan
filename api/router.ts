import { createRouter, publicQuery } from "./middleware";
import { authRouter, catalogRouter, adminRouter } from "./routers";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  catalog: catalogRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
