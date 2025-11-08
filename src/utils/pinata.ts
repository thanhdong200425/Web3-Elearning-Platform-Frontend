// src/utils/pinata.ts
import axios from "axios";

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmNzRiYjdhYy0wNWQzLTRjZmUtYTgzZS00Njc3M2ZhMzE1MjkiLCJlbWFpbCI6InZ5bmQuMjJpdGVAdmt1LnVkbi52biIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0ZjdiY2RiNGZiMzBmNGYwY2QwNSIsInNjb3BlZEtleVNlY3JldCI6IjQ4OWNiNGI1YzI0NDY0YjUzYWI1ZDc1Mzc0NTgwYjBiMGQ0OTNhMmYyNTk0MTQyODgwNDA1NDgwOThhYTZiNDkiLCJleHAiOjE3OTM4OTQxNzJ9.9xcJeB9V9lFBhKiE3Bkm8jTO3enRmtxcvww1Tk-mAIw"; // giữ như bạn đang dùng
const PINATA_API = "https://api.pinata.cloud/pinning";
export const GATEWAY = "https://gateway.pinata.cloud/ipfs";

// Loại bỏ ký tự đặc biệt/không ASCII cho metadata name
const removeAccents = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

const sanitizeName = (s: string) =>
  removeAccents(s)
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Upload 1 FILE (ảnh/pdf/video...) lên IPFS qua Pinata.
 *  Có thể truyền name để hiện tên trong dashboard (không còn 'No aname').
 */
export async function uploadFileToIPFS(
  file: File | Blob,
  name?: string
): Promise<{ cid: string; url: string }> {
  const fd = new FormData();
  fd.append("file", file);

  if (name) {
    fd.append(
      "pinataMetadata",
      JSON.stringify({ name: sanitizeName(name) })
    );
  }

  // optional: thiết lập option pinning
  // fd.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  const res = await axios.post(`${PINATA_API}/pinFileToIPFS`, fd, {
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
  });

  const cid: string = res.data.IpfsHash;
  return { cid, url: `${GATEWAY}/${cid}` };
}

/** Upload JSON (metadata…) lên IPFS qua Pinata, kèm name để hiển thị */
export async function uploadJsonToIPFS(
  obj: unknown,
  name?: string
): Promise<{ cid: string; url: string }> {
  const payload: any = { pinataContent: obj };
  if (name) payload.pinataMetadata = { name: sanitizeName(name) };

  const res = await axios.post(`${PINATA_API}/pinJSONToIPFS`, payload, {
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": "application/json",
    },
  });

  const cid: string = res.data.IpfsHash;
  return { cid, url: `${GATEWAY}/${cid}` };
}

export const buildIpfsUrl = (cid: string) => `ipfs://${cid}`;
