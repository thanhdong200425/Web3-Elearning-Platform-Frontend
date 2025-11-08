import React, { useState } from 'react';
import { Sparkles, FileText, Route } from 'lucide-react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import Header from '@/components/Header';
import ContentFormatCard from '@/components/ContentFormatCard';
import SuggestionChip from '@/components/SuggestionChip';
import AssessmentCheckbox from '@/components/AssessmentCheckbox';

type ContentFormat = 'full-course' | 'study-guide' | 'learning-path';

const AITutor: React.FC = () => {
    const [learningTopic, setLearningTopic] = useState('Smart Contract Security');
    const [contentFormat, setContentFormat] = useState<ContentFormat>('full-course');
    const [includeAssessments, setIncludeAssessments] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const suggestionTopics = [
        'Smart Contract Security',
        'DeFi Protocol Design',
        'NFT Development',
        'Blockchain Consensus',
    ];

    const handleSuggestionClick = (topic: string) => {
        setLearningTopic(topic);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        // TODO: Implement AI content generation logic
        setTimeout(() => {
            setIsGenerating(false);
        }, 2000);
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
                        Describe what you want to learn, and our AI will create personalized learning content
                    </p>
                </div>

                {/* Main Form Section */}
                <div className="flex flex-col gap-8">
                    {/* Learning Topic Input */}
                    <div className="flex flex-col gap-3">
                        <Input
                            label="What would you like to learn?"
                            value={learningTopic}
                            onValueChange={setLearningTopic}
                            placeholder="Smart Contract Security"
                            labelPlacement="outside"
                            classNames={{
                                input: "bg-[#f3f3f5] text-[#717182] text-sm",
                                inputWrapper: "bg-[#f3f3f5] border border-[#cad5e2] rounded-lg h-12 px-3 data-[hover=true]:bg-[#f3f3f5] group-data-[focus=true]:bg-[#f3f3f5]",
                                label: "text-sm font-normal leading-[14px] text-[#314158]",
                            }}
                        />

                        {/* Suggestion Chips */}
                        <div className="flex items-center gap-2 flex-wrap h-7">
                            <span className="text-xs font-normal leading-4 text-[#62748e]">Try:</span>
                            {suggestionTopics.map((topic) => (
                                <SuggestionChip
                                    key={topic}
                                    label={topic}
                                    onClick={() => handleSuggestionClick(topic)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Content Format Selection */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-normal leading-[14px] text-[#314158]">
                            Content format
                        </label>
                        <div className="flex flex-col gap-3">
                            <ContentFormatCard
                                icon={Sparkles}
                                title="Full Course"
                                description="Comprehensive learning path with modules"
                                isSelected={contentFormat === 'full-course'}
                                onSelect={() => setContentFormat('full-course')}
                            />
                            <ContentFormatCard
                                icon={FileText}
                                title="Study Guide"
                                description="Condensed reference material"
                                isSelected={contentFormat === 'study-guide'}
                                onSelect={() => setContentFormat('study-guide')}
                            />
                            <ContentFormatCard
                                icon={Route}
                                title="Learning Path"
                                description="Step-by-step progression plan"
                                isSelected={contentFormat === 'learning-path'}
                                onSelect={() => setContentFormat('learning-path')}
                            />
                        </div>
                    </div>

                    {/* Interactive Assessments Checkbox */}
                    <AssessmentCheckbox
                        checked={includeAssessments}
                        onChange={setIncludeAssessments}
                        label="Include interactive assessments"
                        description="Add quizzes and practice exercises to test your understanding"
                    />

                    {/* Generate Button */}
                    <Button
                        onPress={handleGenerate}
                        isDisabled={isGenerating || !learningTopic.trim()}
                        isLoading={isGenerating}
                        className="bg-[#0f172b] h-12 rounded-lg text-white text-sm font-normal hover:bg-[#1a1f3a] disabled:opacity-50"
                        radius="lg"
                        startContent={!isGenerating && <Sparkles className="w-4 h-4" />}
                    >
                        {isGenerating ? 'Generating...' : 'Generate content'}
                    </Button>
                </div>

               
            </div>
        </div>
    );
};

export default AITutor;

