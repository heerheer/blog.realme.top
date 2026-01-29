import { s3 } from "@/server/s3.client";

const list = await s3.list();

console.log("S3 List:", list);
