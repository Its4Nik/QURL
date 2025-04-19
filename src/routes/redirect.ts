import db, { type database } from "../db";

export const handleRedirect = (url: URL) => {
  const code = url.pathname.slice(1);
  const row = db
    .query("SELECT * FROM short_urls WHERE code = ?1")
    .get(code) as database;

  if (row) {
    db.query("UPDATE short_urls SET visits = visits + 1 WHERE code = ?1").run(
      code,
    );
    return Response.redirect(row.original_url, 302);
  }

  return new Response("Not found", { status: 404 });
};
