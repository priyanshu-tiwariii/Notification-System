import { Hono } from "hono";

const app = new Hono().get("/", (c) => {
   return c.json({
    message: "Hello from the user service!",
    timestamp: new Date().toISOString(),
    });
}
);

export default app;