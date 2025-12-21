import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Link } from "react-router-dom";
import { addToast } from "@heroui/toast";
import { useAccount, usePublicClient, useReadContract } from "wagmi";
import {
  elearningPlatformABI,
  elearningPlatformAddress,
} from "@/contracts/ElearningPlatform";
import { formatEther } from "viem";
import Header from "@/components/layout/Header";
import { CertificateViewer } from "@/components/course/ClaimCertificate";

const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

interface Course {
  id: bigint;
  instructor: string;
  price: bigint;
  title: string;
  contentCid: string;
  metadata?: {
    description?: string;
    imageCid?: string;
    category?: string;
    rating?: number;
    shortDescription?: string;
    contentCid?: string;
  };
  hasCertificate?: boolean;
  certificateTokenId?: bigint;
}

const StudentProfile: React.FC = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [certificateCourses, setCertificateCourses] = useState<Course[]>([]);
  const [loadingPurchased, setLoadingPurchased] = useState(true);
  const [loadingCreated, setLoadingCreated] = useState(true);
  const [loadingCertificates, setLoadingCertificates] = useState(true);

  // Fetch purchased course IDs
  const { data: purchasedCourseIds } = useReadContract({
    address: elearningPlatformAddress,
    abi: elearningPlatformABI,
    functionName: "getPurchasedCourses",
    args: [address || "0x0"],
    query: {
      enabled: !!address && isConnected,
    },
  }) as { data?: bigint[] };

  // Fetch all courses (to filter by instructor)
  const { data: allCourses } = useReadContract({
    address: elearningPlatformAddress,
    abi: elearningPlatformABI,
    functionName: "getAllCourse",
    args: [],
    query: {
      enabled: isConnected,
    },
  }) as { data?: any[] };

  // Filter courses created by the current user
  const myCreatedCourseIds = useMemo(() => {
    if (!allCourses || !address) return [];
    const lower = address.toLowerCase();
    return allCourses
      .filter((c: any) => {
        const instructor = (c?.instructor ?? c?.[1] ?? "").toLowerCase();
        return instructor === lower;
      })
      .map((c: any) => (c?.id ?? c?.[0]) as bigint);
  }, [allCourses, address]);

  // Fetch course details by IDs
  const fetchCoursesByIds = async (
    courseIds: bigint[],
    setTarget: React.Dispatch<React.SetStateAction<Course[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    checkCertificates: boolean = false
  ) => {
    if (!publicClient) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const coursePromises = courseIds.map((courseId) =>
        publicClient.readContract({
          address: elearningPlatformAddress,
          abi: elearningPlatformABI,
          functionName: "courses",
          args: [courseId],
        })
      );

      const courseData = await Promise.all(coursePromises);

      const fetchedCourses = await Promise.all(
        courseData.map(async (course: any) => {
          const [id, instructor, price, title, contentCid] = course;
          let metadata: any = undefined;

          // Try to fetch metadata from IPFS
          try {
            const res1 = await fetch(`${IPFS_GATEWAY}${contentCid}`);
            if (res1.ok) {
              metadata = await res1.json();
            } else {
              const url = `${IPFS_GATEWAY}${contentCid}/metadata.json`;
              const res2 = await fetch(url);
              if (res2.ok) metadata = await res2.json();
            }
          } catch (err) {
            console.warn(`Error fetching metadata for course ${id}:`, err);
          }

          let hasCertificate = false;
          let certificateTokenId: bigint | undefined = undefined;

          // Check if user has certificate for this course
          if (checkCertificates && address) {
            try {
              const tokenId = (await publicClient.readContract({
                address: elearningPlatformAddress,
                abi: elearningPlatformABI,
                functionName: "getCertificateTokenId",
                args: [address as `0x${string}`, id],
              })) as bigint;

              if (tokenId && tokenId > BigInt(0)) {
                hasCertificate = true;
                certificateTokenId = tokenId;
              }
            } catch (err) {
              console.warn(`Error checking certificate for course ${id}:`, err);
            }
          }

          return {
            id,
            instructor,
            price,
            title,
            contentCid,
            metadata,
            hasCertificate,
            certificateTokenId,
          };
        })
      );

      setTarget(fetchedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      addToast({
        title: "Error",
        description: "Failed to fetch course data",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load purchased courses
  useEffect(() => {
    if (!isConnected || !address) {
      setLoadingPurchased(false);
      setPurchasedCourses([]);
      return;
    }

    if (purchasedCourseIds && purchasedCourseIds.length > 0) {
      fetchCoursesByIds(
        purchasedCourseIds,
        setPurchasedCourses,
        setLoadingPurchased,
        true // Check for certificates
      );
    } else {
      setLoadingPurchased(false);
      setPurchasedCourses([]);
    }
  }, [purchasedCourseIds, isConnected, address, publicClient]);

  // Load created courses
  useEffect(() => {
    if (!isConnected || !address) {
      setLoadingCreated(false);
      setCreatedCourses([]);
      return;
    }

    if (myCreatedCourseIds.length > 0) {
      fetchCoursesByIds(
        myCreatedCourseIds,
        setCreatedCourses,
        setLoadingCreated
      );
    } else {
      setLoadingCreated(false);
      setCreatedCourses([]);
    }
  }, [myCreatedCourseIds, isConnected, address, publicClient]);

  // Filter courses with certificates
  useEffect(() => {
    setLoadingCertificates(loadingPurchased);
    if (!loadingPurchased) {
      const coursesWithCerts = purchasedCourses.filter(
        (course) => course.hasCertificate
      );
      setCertificateCourses(coursesWithCerts);
    }
  }, [purchasedCourses, loadingPurchased]);

  if (!isConnected || !address) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 p-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              🎓 Student Profile
            </h1>
            <Card className="mb-8 shadow-md border border-gray-200">
              <CardBody>
                <p className="text-gray-600">
                  Please connect your wallet to view your profile.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🎓 Student Profile
          </h1>

          {/* Wallet Address Card */}
          <Card className="mb-8 shadow-md border border-gray-200">
            <CardBody className="space-y-2">
              <p>
                <strong>Wallet Address:</strong>{" "}
                <span className="font-mono text-sm">{address}</span>
              </p>
            </CardBody>
          </Card>

          {/* Created Courses Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              📚 Your Created Courses
            </h2>
            {loadingCreated ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardBody>
                  <p className="text-gray-500">
                    Loading your created courses...
                  </p>
                </CardBody>
              </Card>
            ) : createdCourses.length === 0 ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardBody>
                  <p className="text-gray-500">
                    You haven't created any courses yet.
                  </p>
                  <Link to="/add-course">
                    <Button color="primary" variant="flat" className="mt-3">
                      Create Your First Course
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-4">
                {createdCourses.map((course) => (
                  <Card
                    key={course.id.toString()}
                    className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardBody className="flex flex-row justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {course.metadata?.category || "Uncategorized"} •{" "}
                          {formatEther(course.price)} ETH
                        </p>
                        {course.metadata?.shortDescription && (
                          <p className="text-sm text-gray-600 mt-1">
                            {course.metadata.shortDescription}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/course/${course.id.toString()}`}>
                          <Button color="primary" variant="flat" size="sm">
                            View Course
                          </Button>
                        </Link>
                        <Link to={`/edit-course/${course.id.toString()}`}>
                          <Button color="default" variant="flat" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Purchased Courses Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              🎒 Purchased Courses
            </h2>
            {loadingPurchased ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardBody>
                  <p className="text-gray-500">Loading purchased courses...</p>
                </CardBody>
              </Card>
            ) : purchasedCourses.length === 0 ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardBody>
                  <p className="text-gray-500">
                    You haven't purchased any courses yet.
                  </p>
                  <Link to="/">
                    <Button color="primary" variant="flat" className="mt-3">
                      Browse Courses
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-4">
                {purchasedCourses.map((course) => (
                  <Card
                    key={course.id.toString()}
                    className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardBody className="flex flex-row justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {course.metadata?.category || "Uncategorized"}
                        </p>
                        {course.metadata?.shortDescription && (
                          <p className="text-sm text-gray-600 mt-1">
                            {course.metadata.shortDescription}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/course/${course.id.toString()}/learn`}>
                          <Button color="primary" variant="solid" size="sm">
                            Continue Learning
                          </Button>
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Certificates Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              🏆 Your Certificates
            </h2>
            {loadingCertificates ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardBody>
                  <p className="text-gray-500">Loading certificates...</p>
                </CardBody>
              </Card>
            ) : certificateCourses.length === 0 ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardBody>
                  <p className="text-gray-500">
                    You haven't earned any certificates yet. Complete a course
                    to claim your certificate!
                  </p>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-4">
                {certificateCourses.map((course) => (
                  <Card
                    key={course.id.toString()}
                    className="border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-indigo-50"
                  >
                    <CardBody>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🎓</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Certificate #{course.certificateTokenId?.toString()}
                            </p>
                            {course.metadata?.category && (
                              <p className="text-xs text-gray-500 mt-1">
                                {course.metadata.category}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <CertificateViewer
                        courseId={course.id.toString()}
                        studentAddress={address}
                      />
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default StudentProfile;
