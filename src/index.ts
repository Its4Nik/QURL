import { handleHome } from "./routes/home";
import { handleShorten } from "./routes/shorten";
import { handleQr } from "./routes/qr";
import { handleRedirect } from "./routes/redirect";
import { handleDelete } from "./routes/delete";

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    switch (url.pathname) {
      case "/":
        return handleHome();

      case "/shorten":
        if (req.method === "POST") return await handleShorten(req);
        break;

      default:
        if (url.pathname.startsWith("/qr/")) {
          return handleQr(url);
        } else if (url.pathname.startsWith("/delete/")) {
          if (req.method === "DELETE") return await handleDelete(url);
          return new Response("Method not allowed", { status: 405 });
        }
        return handleRedirect(url);
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log("QURL running on http://localhost:3000");
