import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import Header from "@/components/layout/Header";
import SuggestionChip from "@/components/ui/SuggestionChip";
import { generateCourseContent } from "@/services/aiService";
import { addToast } from "@heroui/toast";

const AITutor: React.FC = () => {
  const navigate = useNavigate();
  const [learningTopic, setLearningTopic] = useState("Smart Contract Security");
  const [isGenerating, setIsGenerating] = useState(false);

  const suggestionTopics = [
    "JavaScript for begineers",
    "DeFi Protocol Design",
    "NFT Development",
    "Blockchain Consensus",
  ];

  const handleSuggestionClick = (topic: string) => {
    setLearningTopic(topic);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const courseData = await generateCourseContent({
        topic: learningTopic,
      });

      navigate("/ai-result", { state: { courseData } });
    } catch (error) {
      console.error("Error generating content:", error);
      addToast({
        title: "Error",
        description:
          "There was an error generating the learning content. Please try again.",
        color: "danger",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-4xl mx-auto px-[222px] pt-12 pb-0">
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-2">
          <h1 className="text-2xl font-normal leading-9 text-[#0f172b]">
            AI Learning Assistant
          </h1>
          <p className="text-base font-normal leading-6 text-[#45556c]">
            Describe what you want to learn, and our AI will create personalized
            learning content
          </p>
        </div>

        {/* Main Form Section */}
        <div className="flex flex-col gap-8">
          {/* Learning Topic Input */}
          <div className="flex flex-col gap-3">
            <Input
              classNames={{
                input: "bg-[#f3f3f5] text-[#717182] text-sm",
                inputWrapper:
                  "bg-[#f3f3f5] border border-[#cad5e2] rounded-lg h-12 px-3 data-[hover=true]:bg-[#f3f3f5] group-data-[focus=true]:bg-[#f3f3f5]",
                label: "text-sm font-normal leading-[14px] text-[#314158]",
              }}
              label="What would you like to learn?"
              labelPlacement="outside"
              placeholder="Smart Contract Security"
              value={learningTopic}
              onValueChange={setLearningTopic}
            />

            {/* Suggestion Chips */}
            <div className="flex items-center gap-2 flex-wrap h-7">
              <span className="text-xs font-normal leading-4 text-[#62748e]">
                Try:
              </span>
              {suggestionTopics.map((topic) => (
                <SuggestionChip
                  key={topic}
                  label={topic}
                  onClick={() => handleSuggestionClick(topic)}
                />
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            className="bg-[#0f172b] h-12 rounded-lg text-white text-sm font-normal hover:bg-[#1a1f3a] disabled:opacity-50"
            isDisabled={isGenerating || !learningTopic.trim()}
            isLoading={isGenerating}
            radius="lg"
            startContent={!isGenerating && <Sparkles className="w-4 h-4" />}
            onPress={handleGenerate}
          >
            {isGenerating ? "Generating..." : "Generate content"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
