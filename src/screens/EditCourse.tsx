// src/screens/EditCourse.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePublicClient, useAccount } from "wagmi";
import { formatEther } from "viem";
import Header from "@/components/layout/Header";
import AddCourse from "@/screens/AddCourse";
import { addToast } from "@heroui/toast";
import {
  elearningPlatformABI,
  elearningPlatformAddress,
} from "@/contracts/ElearningPlatform";

const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

type Metadata = {
  title?: string;
  description?: string;
  shortDescription?: string;
  imageCid?: string;
  category?: string;
  contentCid?: string; // points to real content.json
  rating?: number;
};

type ContentJson = {
  imageCid?: string;
  sections?: Array<{
    title: string;
    lessons: Array<{
      title: string;
      content: string;
      videoUrl?: string;
      type: "text" | "video";
    }>;
  }>;
};

const fetchJsonSmart = async (cidOrPath: string): Promise<any> => {
  // 1) direct JSON (metadataCid)
  try {
    const res = await fetch(`${PINATA_GATEWAY}${cidOrPath}`);
    if (res.ok) return await res.json();
  } catch {}

  // 2) folder style: <cid>/metadata.json or <cid>/content.json already provided by caller
  try {
    const res = await fetch(`${PINATA_GATEWAY}${cidOrPath}`);
    if (res.ok) return await res.json();
  } catch {}

  throw new Error(`Cannot fetch JSON from IPFS: ${cidOrPath}`);
};

const EditCourse: React.FC = () => {
  const navigate = useNavigate();
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();

  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<any>(null);
  const [existingIpfs, setExistingIpfs] = useState<{
    imageCid?: string;
    contentCid?: string;
  }>({});
  const [courseIdBigInt, setCourseIdBigInt] = useState<bigint | null>(null);

  const courseId = useMemo(() => {
    if (!courseIdParam) return null;
    try {
      return BigInt(courseIdParam);
    } catch {
      return null;
    }
  }, [courseIdParam]);

  useEffect(() => {
    const run = async () => {
      if (!courseId) {
        addToast({
          title: "Error",
          description: "Invalid courseId",
          color: "danger",
          timeout: 4000,
        });
        navigate("/");
        return;
      }
      if (!publicClient) return;

      setLoading(true);
      try {
        // 1) read on-chain course
        const course: any = await publicClient.readContract({
          address: elearningPlatformAddress,
          abi: elearningPlatformABI,
          functionName: "getCourseById",
          args: [courseId],
        });

        // course = { id, instructor, price, title, contentCid }
        const onChainId: bigint = course.id ?? course[0];
        const instructor: string = course.instructor ?? course[1];
        const price: bigint = course.price ?? course[2];
        const title: string = course.title ?? course[3];
        const metadataCid: string = course.contentCid ?? course[4];

        if (!onChainId || onChainId === 0n) {
          throw new Error("Course not found on-chain");
        }

        // only allow instructor edit (optional but recommended)
        if (isConnected && address && instructor?.toLowerCase() !== address.toLowerCase()) {
          addToast({
            title: "Not Allowed",
            description: "Only the instructor can edit this course.",
            color: "danger",
            timeout: 5000,
          });
          navigate(`/course/${courseId.toString()}`);
          return;
        }

        // 2) load metadata
        let metadata: Metadata | null = null;

        // try direct metadataCid JSON first
        try {
          metadata = await fetchJsonSmart(metadataCid);
        } catch {
          // fallback folder style
          try {
            metadata = await fetchJsonSmart(`${metadataCid}/metadata.json`);
          } catch {
            metadata = null;
          }
        }

        // 3) load content.json (sections)
        let content: ContentJson | null = null;
        let contentCidToUse = metadata?.contentCid;

        if (contentCidToUse) {
          try {
            content = await fetchJsonSmart(contentCidToUse);
          } catch {
            // folder style fallback
            try {
              content = await fetchJsonSmart(`${contentCidToUse}/content.json`);
            } catch {
              content = null;
            }
          }
        } else {
          // Some old format may store sections directly on metadataCid content
          // Try to treat metadata itself as content if it has "sections"
          const anyMeta: any = metadata as any;
          if (anyMeta?.sections) {
            content = anyMeta as ContentJson;
          }
        }

        const imageCid = metadata?.imageCid || content?.imageCid;

        // 4) build initialValues for AddCourse
        // AddCourse expects CourseFormData fields: title, shortDescription, detailedDescription, category, coursePrice, walletAddress, sections, ...
        const initial = {
          title: metadata?.title || title || "",
          shortDescription: metadata?.shortDescription || "",
          detailedDescription: metadata?.description || "",
          category: metadata?.category || "",
          paymentToken: "ETH",
          coursePrice: Number(formatEther(price)),
          walletAddress: instructor,
          sections:
            content?.sections?.map((sec, secIdx) => ({
              id: `${Date.now()}-${secIdx}`,
              title: sec.title,
              lessons: (sec.lessons || []).map((ls, lsIdx) => ({
                id: `${Date.now()}-${secIdx}-${lsIdx}`,
                title: ls.title,
                content: ls.content || "",
                // NOTE: your current convertToIPFSFormat uses lesson.file presence to set type=video.
                // We cannot reconstruct File from IPFS, so keep it as text content.
                // If you want to keep video link, store it in content field or add a new field.
              })),
            })) || [],
        };

        setCourseIdBigInt(courseId);
        setInitialValues(initial);
        setExistingIpfs({
          imageCid: imageCid,
          contentCid: contentCidToUse, // contentCid inside metadata
        });
      } catch (err: any) {
        console.error(err);
        addToast({
          title: "Error",
          description: err?.message || "Failed to load course for editing.",
          color: "danger",
          timeout: 5000,
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [courseId, publicClient, navigate, isConnected, address]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">
              Please connect your wallet to edit a course.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !courseIdBigInt || !initialValues) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-600">
            Loading course for editing...
          </p>
        </div>
      </div>
    );
  }

  // IMPORTANT: Reuse AddCourse 4-step UI with prefilled data
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AddCourse
        mode="edit"
        courseId={courseIdBigInt}
        initialValues={initialValues}
        existingIpfs={existingIpfs}
      />
    </div>
  );
};

export default EditCourse;
