// src/components/Upload.tsx
import { useState } from "react";
import axios from "../api/axios";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    try {
      // 1. Get a pre-signed URL
      const presignResponse = await axios.post("/pdf/upload", {
        filename: file.name,
        contentType: file.type,
      });

      // 2. Upload the file to S3
      const uploadResponse = await fetch(presignResponse.data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      // 3. Check if S3 upload was successful
      if (!uploadResponse.ok) {
        // Throw an error to be caught by the catch block
        throw new Error("Failed to upload file to S3.");
      }

      // 4. Save the PDF info to your database
      await axios.post("/pdf/save", {
        filename: file.name,
        s3Url: presignResponse.data.s3Url,
      });

      // 5. If everything succeeds, show success message and reset state
      alert("Upload successful!");
      setFile(null);
      // Optionally, you can refresh the dashboard data here
      window.location.reload();
    } catch (error) {
      console.error("Upload process failed:", error);
      alert("Upload failed. Please check the console for details.");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
      />
      <button
        onClick={handleUpload}
        className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-blue-600 transition"
      >
        Upload
      </button>
    </div>
  );
}
