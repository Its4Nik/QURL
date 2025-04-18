import { handleHome } from "./routes/home";
import { handleShorten } from "./routes/shorten";
import { handleQr } from "./routes/qr";
import { handleRedirect } from "./routes/redirect";

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
        }

        return handleRedirect(url);
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log("Server running on http://localhost:3000");
