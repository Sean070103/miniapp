// pages/api/uploadthing.ts
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/utils/uploadthing";

export default createRouteHandler({
  router: ourFileRouter,
});
