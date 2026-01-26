import "dotenv/config";
import { defineConfig } from "prisma/config";

// Use fallback for CI builds where DATABASE_URL isn't available
// prisma generate doesn't actually need a real connection
const databaseUrl =
  process.env.DATABASE_URL ||
  "sqlserver://localhost:1433;database=placeholder;encrypt=true";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
