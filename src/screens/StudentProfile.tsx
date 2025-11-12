import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Link } from "react-router-dom";
import { addToast } from "@heroui/toast";
import { createAndUploadCertificateMeta } from "@/utils/certificates";

interface CompletedCourse {
  id: string;
  title: string;
  category: string;
  certificate: boolean;
  certificateCid?: string; // CID IPFS
}

const StudentProfile: React.FC = () => {
  const [student] = useState({
    name: "Nguyễn Đăng Vỹ",
    email: "vynguyen@example.com",
    wallet: "0xA1B2C3D4E5F6...",
  });

  const [courses, setCourses] = useState<CompletedCourse[]>([
    {
      id: "1",
      title: "Blockchain Fundamentals",
      category: "Blockchain",
      certificate: true,
    },
    {
      id: "2",
      title: "Smart Contract Development",
      category: "Programming",
      certificate: true,
    },
    {
      id: "3",
      title: "React for Beginners",
      category: "Frontend",
      certificate: false,
    },
  ]);

  // per-course loading state
  const [generating, setGenerating] = useState<Record<string, boolean>>({});

  const handleGenerateCertificate = async (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course || generating[courseId]) return;

    try {
      setGenerating((s) => ({ ...s, [courseId]: true }));

      addToast({
        title: "Generating Certificate",
        description: "Uploading certificate metadata to IPFS...",
        color: "primary",
      });

      const { cid } = await createAndUploadCertificateMeta({
        studentName: student.name,
        studentWallet: student.wallet,
        courseTitle: course.title,
        courseId: course.id,
      });
      setCourses((prev: CompletedCourse[]) => {
        return prev.map((c): CompletedCourse => {
          if (c.id === courseId) {
            return {
              ...c,
              certificate: true,
              certificateCid: cid as unknown as string,
            };
          }
          return c;
        });
      });

      addToast({
        title: "Certificate Created",
        description: `Uploaded to IPFS (CID: ${cid})`,
        color: "success",
      });
    } catch (error) {
      console.error(error);
      addToast({
        title: "Error",
        description: "Failed to upload certificate metadata.",
        color: "danger",
      });
    } finally {
      setGenerating((s) => ({ ...s, [courseId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🎓 Student Profile
        </h1>

        <Card className="mb-8 shadow-md border border-gray-200">
          <CardBody className="space-y-2">
            <p>
              <strong>Name:</strong> {student.name}
            </p>
            <p>
              <strong>Email:</strong> {student.email}
            </p>
            <p>
              <strong>Wallet Address:</strong> {student.wallet}
            </p>
          </CardBody>
        </Card>

        <h2 className="text-xl font-semibold mb-4">My Courses</h2>
        <div className="space-y-4">
          {courses.map((course) => (
            <Card key={course.id} className="border border-gray-200 shadow-sm">
              <CardBody className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.category}</p>
                </div>

                {course.certificate ? (
                  <>
                    {course.certificateCid ? (
                      <div className="flex flex-col items-end gap-1">
                        {/* If your Certificate page expects a CID, this is correct.
                           If it expects a courseId instead, change to `/certificate/${course.id}` */}
                        <Link to={`/certificate/${course.certificateCid}`}>
                          <Button color="primary" variant="solid" size="sm">
                            View Certificate
                          </Button>
                        </Link>
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${course.certificateCid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 underline"
                        >
                          View on IPFS
                        </a>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="solid"
                        className="bg-gray-900 text-white hover:bg-gray-800"
                        isLoading={!!generating[course.id]}
                        isDisabled={!!generating[course.id]}
                        onPress={() => handleGenerateCertificate(course.id)}
                      >
                        {generating[course.id]
                          ? "Generating…"
                          : "Generate Certificate"}
                      </Button>
                    )}
                  </>
                ) : (
                  <Button disabled size="sm" variant="bordered">
                    Not Completed
                  </Button>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
