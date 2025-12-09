// src/screens/Certificate.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Button } from "@heroui/button";

type CertMetaV1 = {
  name?: string;
  description?: string;
  version?: string;
  student?: { name?: string; wallet?: string };
  course?: { title?: string; id?: string };
  completedAt?: string; // ISO
  image?: string;       // optional preview
};

const isCid = (v?: string) =>
  !!v &&
  (/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(v) || /^bafy[0-9a-z]{50,}$/i.test(v));

const buildGatewayUrl = (cid: string, gw?: string) => {
  const gateway = (gw || "https://gateway.pinata.cloud/ipfs").replace(/\/$/, "");
  return `${gateway}/${cid}`;
};

const prettyDate = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
};

const Certificate: React.FC = () => {
  // Giữ tương thích: param có thể là id cũ hoặc CID mới
  const { id } = useParams<{ id: string }>();
  const [sp] = useSearchParams();

  const gw = sp.get("gw") || undefined;
  const treatAsCid = isCid(id);

  const [meta, setMeta] = useState<CertMetaV1 | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Fallback dữ liệu cũ khi không phải CID
  const fallback = useMemo<CertMetaV1>(() => {
    const title =
      id === "1"
        ? "Blockchain Fundamentals"
        : id === "2"
        ? "Smart Contract Development"
        : "Unknown Course";
    return {
      name: `Certificate of Completion`,
      description: "This certifies that the student has successfully completed the course.",
      student: { name: "Nguyễn Đăngg Vỹ" },
      course: { title },
      completedAt: "2025-11-01T00:00:00.000Z",
      version: "v1",
    };
  }, [id]);

  const ipfsUrl = useMemo(() => {
    if (treatAsCid && id) return buildGatewayUrl(id, gw);
    return null;
  }, [treatAsCid, id, gw]);

  // Nếu là CID → fetch metadata từ IPFS
  useEffect(() => {
    let stop = false;
    const run = async () => {
      if (!treatAsCid || !ipfsUrl) return;
      try {
        setLoading(true);
        setErr(null);
        const r = await fetch(ipfsUrl);
        if (!r.ok) throw new Error(`Fetch failed ${r.status}`);
        const j = (await r.json()) as CertMetaV1;
        if (!stop) setMeta(j);
      } catch (e: any) {
        if (!stop) setErr(e?.message || "Failed to load certificate metadata");
      } finally {
        if (!stop) setLoading(false);
      }
    };
    run();
    return () => {
      stop = true;
    };
  }, [treatAsCid, ipfsUrl]);

  // Dữ liệu hiển thị: ưu tiên meta từ IPFS, nếu không có dùng fallback
  const data = treatAsCid ? meta : fallback;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl w-full">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/profile">
            <Button variant="bordered">← Back to Profile</Button>
          </Link>

          {treatAsCid && ipfsUrl && (
            <>
              <a href={ipfsUrl} target="_blank" rel="noreferrer">
                <Button color="primary" variant="solid">Open raw JSON</Button>
              </a>
              <a href={`ipfs://${id}`} target="_blank" rel="noreferrer">
                <Button variant="light">ipfs://{String(id).slice(0, 10)}…</Button>
              </a>
            </>
          )}
        </div>

        {loading && (
          <div className="bg-white p-6 rounded-xl shadow border text-center">
            Loading certificate from IPFS…
          </div>
        )}
        {err && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-700 mb-4">
            {err}
          </div>
        )}

        {data && !loading && (
          <div className="bg-white p-10 rounded-2xl shadow-xl border-4 border-yellow-400 w-full text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {data.name || "Certificate of Completion"}
            </h1>
            <p className="text-lg text-gray-700">
              {data.description || "This is to certify that"}
            </p>

            <p className="text-3xl font-semibold text-blue-700 my-3">
              {data.student?.name || "Student"}
            </p>

            <p className="text-gray-700">has successfully completed the course</p>
            <p className="text-2xl font-semibold text-gray-900 my-2">
              {data.course?.title || "Course"}
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-600 text-sm">
              <div>
                <span className="font-medium">Date:</span>{" "}
                {prettyDate(data.completedAt) || "—"}
              </div>
              <div>
                <span className="font-medium">Student Wallet:</span>{" "}
                {data.student?.wallet
                  ? `${data.student.wallet.slice(0, 10)}…`
                  : "—"}
              </div>
              <div>
                <span className="font-medium">Version:</span>{" "}
                {data.version || "v1"}
              </div>
            </div>

            {data.image && (
              <div className="mt-8 flex justify-center">
                <img
                  className="max-h-64 rounded-md border"
                  alt="certificate"
                  src={
                    data.image.startsWith("ipfs://")
                      ? buildGatewayUrl(data.image.replace("ipfs://", ""), gw)
                      : data.image
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificate;
