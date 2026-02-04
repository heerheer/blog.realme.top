import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { server } from "./server/index";
import index from "public/index.html";
new Elysia()
  .get("/", index)
  .use(
    await staticPlugin({
      prefix: "/",
      indexHTML: false,
      alwaysStatic: true,
    }),
  )
  .use(server)
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
