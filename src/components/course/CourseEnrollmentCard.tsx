import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import {
    PlayCircle,
    Award,
    CheckCircle2,
    Copy,
    Infinity,
} from "lucide-react";
import { OnChainCourse } from "@/types/courseTypes";
import { formatEther } from "viem";

interface CourseEnrollmentCardProps {
    courseData: OnChainCourse;
    imageUrl: string;
    onEnroll: () => void;
}

const CourseEnrollmentCard: React.FC<CourseEnrollmentCardProps> = ({
    courseData,
    imageUrl,
    onEnroll,
}) => {
    const [copied, setCopied] = useState(false);
    const priceInEth = formatEther(courseData.price);

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(courseData.contentCid);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-[1280px] mx-auto px-8 relative">
            <div className="absolute right-8 -top-[280px] w-[384px]">
                <Card className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                    {/* Video Preview */}
                    <div className="relative bg-gray-200 h-48 flex items-center justify-center overflow-hidden">
                        <img
                            src={imageUrl}
                            alt={courseData.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop";
                            }}
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="bg-white/90 rounded-full p-4 cursor-pointer hover:bg-white transition-colors">
                                <PlayCircle className="w-8 h-8 text-gray-800" />
                            </div>
                        </div>
                    </div>

                    <div className="p-5">
                        {/* Price */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-[#101828] text-3xl font-bold">{priceInEth}</span>
                                <span className="text-[#4a5565] text-xl">ETH</span>
                            </div>
                            <p className="text-[#6a7282] text-xs">One-time payment</p>
                        </div>

                        {/* Enroll Button */}
                        <Button
                            onPress={onEnroll}
                            className="w-full bg-[#030213] text-white rounded-lg h-10 text-sm font-normal mb-8"
                        >
                            Enroll Now
                        </Button>

                        {/* Features */}
                        <div className="space-y-2 mb-8">
                            <div className="flex items-center gap-2">
                                <Infinity className="w-4 h-4 text-[#101828]" />
                                <span className="text-[#101828] text-sm">Lifetime access</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-[#101828]" />
                                <span className="text-[#101828] text-sm">Certificate of completion</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#101828]" />
                                <span className="text-[#101828] text-sm">Blockchain verified</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 mb-6"></div>

                        {/* Content CID */}
                        <div>
                            <p className="text-[#4a5565] text-xs mb-1">Content CID</p>
                            <div className="flex items-center gap-2">
                                <p className="text-[#6a7282] text-xs font-mono flex-1 truncate">
                                    {courseData.contentCid}
                                </p>
                                <button
                                    onClick={handleCopyAddress}
                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                    title={copied ? "Copied!" : "Copy CID"}
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {copied && <p className="text-green-600 text-xs mt-1">Copied!</p>}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CourseEnrollmentCard;
