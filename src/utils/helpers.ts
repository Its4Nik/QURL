export const generateCode = () => Math.random().toString(36).substring(2, 10);

export const getUrl = (code: string) =>
  `${new URL(Bun.env.HOST || "http://localhost:3000")}${code}`;

export const validateUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
