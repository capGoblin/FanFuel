import { useState } from "react";
import { PinataSDK } from "pinata";

interface UsePinataUploadResult {
  uploadImage: (file: File) => Promise<string>;
  loading: boolean;
  error: string | null;
  progress: number;
}

export function usePinataUpload(): UsePinataUploadResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);

      // Validate file
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file");
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error("Image must be smaller than 10MB");
      }

      // Initialize Pinata SDK
      const pinata = new PinataSDK({
        pinataJwt:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1ODJhZjYyNC00Mjk1LTQ4MWItOTE0OC00NzUyZWJiOGI3NzMiLCJlbWFpbCI6ImRoYXJzaGFuMjQ1N0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZWExM2M1N2MxYTdmYTU1MDFlZjciLCJzY29wZWRLZXlTZWNyZXQiOiJjYjVhZjhjYTZlZmY2ZDk5ZDAxYjdkODdkYmRhZjdjMGE4YTc0NDRjOTM0OTM2ZWY1YjBlOTg1N2UzZGI4MmFlIiwiZXhwIjoxNzgzMjcyNDU0fQ.0tc1qc6dUCJlXHQjdsTAaSIxLZ2xOxKMbbx88bK7p1o",
        pinataGateway: "amaranth-important-guineafowl-895.mypinata.cloud",
      });

      setProgress(25);

      // Create a unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const uniqueFileName = `fanfuel-campaign-${timestamp}.${fileExtension}`;

      // Create new File with unique name
      const renamedFile = new File([file], uniqueFileName, { type: file.type });

      setProgress(50);

      // Upload to Pinata using correct SDK API
      const upload = await pinata.upload.public.file(renamedFile);

      setProgress(75);

      // Get the IPFS URL using the gateway
      const ipfsUrl = `https://${process.env
        .NEXT_PUBLIC_PINATA_GATEWAY!}/ipfs/${upload.cid}`;

      setProgress(100);
      console.log(ipfsUrl);
      return ipfsUrl;
    } catch (err) {
      console.error("Error uploading to Pinata:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image");
      throw err;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return {
    uploadImage,
    loading,
    error,
    progress,
  };
}

// Helper function to optimize Pinata images for display
export function optimizePinataImage(
  ipfsUrl: string,
  options: {
    width?: number;
    height?: number;
    format?: "auto" | "webp";
    quality?: number;
  } = {}
): string {
  if (!ipfsUrl.includes("ipfs/")) {
    return ipfsUrl; // Not a Pinata IPFS URL
  }

  // Extract the CID from the URL
  const cid = ipfsUrl.split("ipfs/")[1];
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "olive-tough-beetle-615.mypinata.cloud";

  // Build optimized URL
  let optimizedUrl = `https://${gateway}/ipfs/${cid}`;

  // Add optimization parameters
  const params = new URLSearchParams();

  if (options.width) params.append("w", options.width.toString());
  if (options.height) params.append("h", options.height.toString());
  if (options.format) params.append("format", options.format);
  if (options.quality) params.append("q", options.quality.toString());

  if (params.toString()) {
    optimizedUrl += `?${params.toString()}`;
  }

  return optimizedUrl;
}
