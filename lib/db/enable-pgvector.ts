import { config } from "dotenv";
import postgres from "postgres";

config({
  path: ".env.local",
});

const enablePgVector = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });

  console.log("⏳ Enabling pgvector extension...");

  try {
    await connection`CREATE EXTENSION IF NOT EXISTS vector`;
    console.log("✅ pgvector extension enabled successfully");
  } catch (error) {
    console.error("❌ Failed to enable pgvector extension");
    console.error(error);
    process.exit(1);
  }

  await connection.end();
  process.exit(0);
};

enablePgVector().catch((err) => {
  console.error("❌ Script failed");
  console.error(err);
  process.exit(1);
});
