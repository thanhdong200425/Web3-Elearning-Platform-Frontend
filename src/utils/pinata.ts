import axios from "axios";

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmNzRiYjdhYy0wNWQzLTRjZmUtYTgzZS00Njc3M2ZhMzE1MjkiLCJlbWFpbCI6InZ5bmQuMjJpdGVAdmt1LnVkbi52biIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjM2ZiN2I4NjBhZjdiOWM2Mzg1MyIsInNjb3BlZEtleVNlY3JldCI6ImRhYjA1ZTFhMjhiZTJmZWU0MTMyNzIwNDYyMDczMTIyNGMzYmE5OTkzOTMxNTQ1Mzk2NmUxYTM4YTU2YzU0YWEiLCJleHAiOjE3OTM2OTMzNjB9.TygldvYbuhJdo7H0ygVmbwwHntEzebks8r8Lf4F0eTU"; // 🔒 thay token JWT thật của bạn vào
const PINATA_API = "https://api.pinata.cloud/pinning";
const GATEWAY = "https://gateway.pinata.cloud/ipfs";

/**
 * Upload 1 file (ảnh, video, pdf,...) lên IPFS qua Pinata
 * @returns { cid, url }
 */
export async function uploadFileToIPFS(file: File): Promise<{ cid: string; url: string }> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await axios.post(`${PINATA_API}/pinFileToIPFS`, fd, {
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": "multipart/form-data",
    },
  });

  const cid: string = res.data.IpfsHash;
  return { cid, url: `${GATEWAY}/${cid}` };
}

/**
 * Upload JSON (metadata, course info, NFT certificate info,...) lên IPFS
 * @returns { cid, url }
 */
export async function uploadJsonToIPFS(obj: unknown): Promise<{ cid: string; url: string }> {
  const res = await axios.post(`${PINATA_API}/pinJSONToIPFS`, obj, {
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": "application/json",
    },
  });
  const cid: string = res.data.IpfsHash;
  return { cid, url: `${GATEWAY}/${cid}` };
}

/**
 * Helper để build URI theo chuẩn ipfs://CID
 */
export const buildIpfsUrl = (cid: string) => `ipfs://${cid}`;
