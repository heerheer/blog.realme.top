import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { server } from "./server/index";

new Elysia()
  .use(
    await staticPlugin({
      prefix: "/",
    }),
  )
  .use(server)
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
