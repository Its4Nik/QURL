export const handleQr = (url: URL) => {
  const filePath = `public${url.pathname}`;
  const file = Bun.file(filePath);

  return new Response(file, { headers: { "Content-Type": "image/png" } });
};
