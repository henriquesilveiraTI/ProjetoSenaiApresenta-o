import { access, copyFile, readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const apiDir = path.join(root, "apps", "api");
const envExample = path.join(apiDir, ".env.example");
const envFile = path.join(apiDir, ".env");

try {
  await access(envFile);
  console.log("apps/api/.env já existe. Nada foi alterado.");
} catch {
  const template = await readFile(envExample, "utf8");
  const secret = randomBytes(48).toString("hex");
  const contents = template.replace(
    /^JWT_SECRET=.*$/m,
    `JWT_SECRET=${secret}`,
  );
  await writeFile(envFile, contents, "utf8");
  console.log("apps/api/.env criado com um JWT_SECRET aleatório.");
}

console.log("\nPróximos passos:");
console.log("  1. docker compose up -d");
console.log("  2. npm run db:migrate");
console.log("  3. npm run dev");
console.log("\nWeb: http://localhost:5173");
console.log("API: http://localhost:3333/api/health");
