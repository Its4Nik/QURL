import db from "../db";

export const handleDelete = async (url: URL) => {
  const code = url.pathname.split("/delete/")[1];
  if (!code) return new Response("Invalid code", { status: 400 });

  db.query("DELETE FROM short_urls WHERE code = ?").run(code);

  try {
    const file = Bun.file(`public/qr/${code}.png`);
    await file.delete();
  } catch (error) {
    console.error(`Error deleting qr code: ${error as string}`);
  }

  return new Response(null, { status: 204 });
};
