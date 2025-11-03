import { uploadJsonToIPFS } from "@/utils/pinata";

/** Dữ liệu metadata chuẩn cho Certificate NFT (tạm thời dùng cho test) */
export type CertificateMeta = {
  name: string;                 // "{student} - {course} Certificate"
  description: string;          // "Certificate of completion for ..."
  student: { name: string; wallet?: string };
  course: { title: string; id?: string };
  completedAt: string;          // ISO date
  image?: string;               // ipfs://CID (optional, nếu có ảnh nền)
  version: "v1";
};

/** Tạo & upload metadata certificate lên IPFS, trả về CID + ipfs uri + gateway url */
export async function createAndUploadCertificateMeta(params: {
  studentName: string;
  studentWallet?: string;
  courseTitle: string;
  courseId?: string;
  imageCidOptional?: string;    // nếu bạn có ảnh nền certificate đã up IPFS
}) {
  const meta: CertificateMeta = {
    name: `${params.studentName} - ${params.courseTitle} Certificate`,
    description: `Certificate of completion for ${params.courseTitle}`,
    student: { name: params.studentName, wallet: params.studentWallet },
    course: { title: params.courseTitle, id: params.courseId },
    completedAt: new Date().toISOString(),
    image: params.imageCidOptional ? `ipfs://${params.imageCidOptional}` : undefined,
    version: "v1",
  };

  const cid = await uploadJsonToIPFS(meta);               // <- Pinata JSON
  const ipfsUri = `ipfs://${cid}`;
  const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
  return { cid, ipfsUri, gatewayUrl, meta };
}
