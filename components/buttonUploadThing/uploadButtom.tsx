"use client";

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export default function FileUpload() {
  return (
    <div>
      <UploadButton<OurFileRouter, "imageUploader">
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          console.log("Files: ", res);
          alert("Upload Completed!");
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`);
        }}
      />
    </div>
  );
}
