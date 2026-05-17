// prisma.config.ts
// Prisma 7 — central config for CLI (migrate, generate, studio)
// Connection URL อยู่ที่นี่แทน datasource.url ใน schema.prisma
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
  },
});
