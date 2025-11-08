import { uploadJsonToIPFS } from "@/utils/pinata";

export type CertificateMeta = {
  name: string;
  description: string;
  student: { name: string; wallet?: string };
  course: { title: string; id?: string };
  completedAt: string;
  image?: string;
  version: "v1";
};

export async function createAndUploadCertificateMeta(params: {
  studentName: string;
  studentWallet?: string;
  courseTitle: string;
  courseId?: string;
  imageCidOptional?: string;
}) {
  const meta: CertificateMeta = {
    // Giữ nguyên tiếng Việt trong JSON (đọc từ gateway vẫn thấy đủ dấu)
    name: `${params.studentName} - ${params.courseTitle} Certificate`,
    description: `Certificate of completion for ${params.courseTitle}`,
    student: { name: params.studentName, wallet: params.studentWallet },
    course: { title: params.courseTitle, id: params.courseId },
    completedAt: new Date().toISOString(),
    image: params.imageCidOptional ? `ipfs://${params.imageCidOptional}` : undefined,
    version: "v1",
  };

  // Tên hiển thị ở Pinata UI (ASCII, không lỗi)
  const pinName = `${params.studentName} - ${params.courseTitle} - certificate.json`;

  const { cid, url } = await uploadJsonToIPFS(meta, pinName);
  const ipfsUri = `ipfs://${cid}`;
  const gatewayUrl = url;

  return { cid, ipfsUri, gatewayUrl, meta };
}
