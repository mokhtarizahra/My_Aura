import dotenv from "dotenv";
import mongoose from "mongoose";

import { beforeAll, afterAll, beforeEach } from "vitest";

dotenv.config({
  path: ".env.test",
});

const MONGO_TEST_URI =
  process.env.MONGODB_TEST_URI || "mongodb://localhost:27018/my_aura_test";

beforeAll(async () => {
  await mongoose.connect(MONGO_TEST_URI);
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
