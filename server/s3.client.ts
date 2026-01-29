import { Elysia } from "elysia";
import { S3Client } from "bun";

export const s3 = new S3Client({
  region: Bun.env.S3_REGION,
  endpoint: Bun.env.S3_ENDPOINT,
  accessKeyId: Bun.env.S3_ACCESS_KEY_ID || "",
  secretAccessKey: Bun.env.S3_SECRET_ACCESS_KEY || "",
  bucket: Bun.env.S3_BUCKET || "blogs",
});

export const s3client = new Elysia().decorate("s3", s3);
