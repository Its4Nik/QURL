import QRCode from "qrcode";
import db from "../db";
import { generateCode, getUrl, validateUrl } from "../utils/helpers";

export const handleShorten = async (req: Request) => {
  const formData = await req.formData();
  const originalUrl = formData.get("url")?.toString();

  if (!originalUrl || !validateUrl(originalUrl)) {
    return new Response("Invalid URL", { status: 400 });
  }

  const code = generateCode();
  const shortUrl = getUrl(code);
  const qrPath = `public/qr/${code}.png`;

  await QRCode.toFile(qrPath, shortUrl);

  db.query(
    `
    INSERT INTO short_urls (code, original_url, qr_path, created_at)
    VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP)
  `,
  ).run(code, originalUrl, qrPath);

  return new Response(
    `<!DOCTYPE html>
      <html>
        <head>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: 'Segoe UI', system-ui, sans-serif;
            }

            body {
              background-color: #1a1a1a;
              color: #ffffff;
              display: flex;
              flex-direction: column;
              align-items: center;
              min-height: 100vh;
              padding: 2rem;
              text-align: center;
            }

            .container {
              background: #2d2d2d;
              padding: 2rem;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              margin-top: 2rem;
              max-width: 600px;
              width: 100%;
            }

            h2 {
              color: #00ff9d;
              margin-bottom: 1.5rem;
              font-size: 1.8rem;
            }

            a {
              color: #7d7dff;
              text-decoration: none;
              transition: color 0.2s ease;
            }

            a:hover {
              color: #00ff9d;
              text-decoration: underline;
            }

            .qr-code {
              margin: 1.5rem 0;
              padding: 1rem;
              background: #1f1f1f;
              border-radius: 12px;
              display: inline-block;
            }

            .qr-code img {
              width: 150px;
              height: 150px;
              border: 2px solid #3d3d3d;
              border-radius: 8px;
              transition: transform 0.2s ease;
            }

            .qr-code img:hover {
              transform: scale(1.05);
            }

            .back-link {
              display: inline-block;
              margin-top: 2rem;
              padding: 0.8rem 1.5rem;
              background: #3d3d3d;
              border-radius: 8px;
              transition: background 0.2s ease;
            }

            .back-link:hover {
              background: #4d4d4d;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>URL Created Successfully!</h2>
            <p>Short URL: <a href="${shortUrl}">${shortUrl}</a></p>
            <div class="qr-code">
              <p>QR Code:</p>
              <img src="/qr/${code}.png" alt="QR Code">
            </div>
          </div>
            <a href="/" class="back-link">Create Another Short URL</a>
        </body>
      </html>`,
    { headers: { "Content-Type": "text/html" } },
  );
};
