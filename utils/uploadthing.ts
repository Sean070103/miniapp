import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
   image: { maxFileSize: "4MB", maxFileCount: 1 }, // accept images
   
  })
    .middleware(async ({ req }) => {
      // optional authentication here
      return { userId: "test-user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", file.url);
      return { fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;