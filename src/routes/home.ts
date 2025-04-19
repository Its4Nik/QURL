import db, { type database } from "../db";

export const handleHome = () => {
  const rows = db.query("SELECT * FROM short_urls").all() as database[];

  return new Response(
    `<html>
      <head>
        <title>QURL - ${rows.length} URLs</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
          line-height: 1.6;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        h1 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          color: #00ff9d;
          text-shadow: 0 0 8px rgba(0, 255, 157, 0.3);
        }

        h2 {
          color: #7d7dff;
          margin: 2rem 0 1rem;
          border-bottom: 2px solid #333;
          padding-bottom: 0.5rem;
        }

        form {
          background: #2d2d2d;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          margin-bottom: 2rem;
          display: flex;
          gap: 1rem;
        }

        input[type="url"] {
          flex: 1;
          padding: 0.8rem;
          border: 2px solid #444;
          border-radius: 8px;
          background: #1f1f1f;
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        input[type="url"]:focus {
          outline: none;
          border-color: #7d7dff;
          box-shadow: 0 0 8px rgba(125, 125, 255, 0.3);
        }

        button {
          padding: 0.8rem 1.5rem;
          background: linear-gradient(135deg, #7d7dff, #5e5eff);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(125, 125, 255, 0.3);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1.5rem;
          background: #2d2d2d;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #3d3d3d;
        }

        th {
          background: linear-gradient(0deg, #3d3d3d, #333);
          color: #7d7dff;
          font-weight: 600;
        }

        tr:hover {
          background-color: #363636;
        }

        td a {
          color: #7d7dff;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        td a:hover {
          color: #00ff9d;
          text-decoration: underline;
        }

        .qr-thumb {
          width: 50px;
          height: 50px;
          border-radius: 6px;
          border: 2px solid #444;
          transition: transform 0.2s ease;
        }

        .qr-thumb:hover {
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          body {
            padding: 1rem;
          }

          h1 {
            font-size: 2rem;
          }

          form {
            flex-direction: column;
          }

          button {
            width: 100%;
          }
        }

        .delete-btn {
          background: linear-gradient(135deg, #ff7d7d, #ff5e5e);
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }

        .delete-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 125, 125, 0.3);
        }
      </style>
      </head>
      <body>
        <h1>QURL</h1>
        <form method="POST" action="/shorten">
          <input type="url" name="url" required placeholder="Enter URL" style="width: 300px;">
          <button type="submit">Shorten</button>
        </form>

        <h2>All Shortened Links</h2>
        <table>
        <thead>
          <tr>
            <th>Short URL</th>
            <th>Original URL</th>
            <th>Visits</th>
            <th>QR Code</th>
            <th>Actions</th>
          </tr>
        </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
              <tr>
                <td>
                  <a href="/${row.code}">/${row.code}</a><br>
                </td>
                <td>${row.original_url.slice(0, 50)}${row.original_url.length > 50 ? "..." : ""}</td>
                <td>${row.visits}</td>
                <td>
                  <a href="/qr/${row.code}.png" target="_blank">
                    <img src="/qr/${row.code}.png" class="qr-thumb">
                  </a>
                </td>
                <td>
                  <button class="delete-btn" onclick="deleteCode('${row.code}')">Delete</button>
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        <script>
          function deleteCode(code) {
            if (confirm('Delete this short URL?')) {
              fetch('/delete/' + code, { method: 'DELETE' })
                .then(response => response.ok && location.reload())
                .catch(console.error);
            }
          }
        </script>
      </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } },
  );
};
