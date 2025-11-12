import React from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@heroui/button";

const Certificate: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Giả lập thông tin khóa học
  const certificateData = {
    studentName: "Nguyễn Đăng Vỹ",
    courseTitle:
      id === "1"
        ? "Blockchain Fundamentals"
        : id === "2"
        ? "Smart Contract Development"
        : "Unknown Course",
    issueDate: "01/11/2025",
    instructor: "John Doe",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-10 rounded-2xl shadow-xl border-4 border-yellow-400 w-[700px] text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Certificate of Completion
        </h1>
        <p className="text-lg text-gray-700">This is to certify that</p>
        <p className="text-3xl font-semibold text-blue-700 my-3">
          {certificateData.studentName}
        </p>
        <p className="text-gray-700">has successfully completed the course</p>
        <p className="text-2xl font-semibold text-gray-900 my-2">
          {certificateData.courseTitle}
        </p>
        <p className="mt-6 text-gray-600">Date: {certificateData.issueDate}</p>
        <p className="text-gray-600">Instructor: {certificateData.instructor}</p>

        <div className="mt-8">
          <Link to="/profile">
            <Button variant="solid" color="primary">
              Back to Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
