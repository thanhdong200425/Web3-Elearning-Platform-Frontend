import React from "react";
import { ChevronRight } from "lucide-react";

const PartnerLogosSection: React.FC = () => {
  const partners = [
    { name: "Google", emoji: "🔵" },
    { name: "DeepLearning.AI", emoji: "🧠" },
    { name: "Stanford University", emoji: "🎓" },
    { name: "IBM", emoji: "💼" },
    { name: "University of Pennsylvania", emoji: "🏛️" },
    { name: "Microsoft", emoji: "🪟" },
    { name: "University of Michigan", emoji: "📘" },
    { name: "Meta", emoji: "♾️" },
    { name: "Adobe", emoji: "🅰️" },
    { name: "Vanderbilt", emoji: "⚓" },
  ];

  return (
    <section className="bg-gray-50 border-b border-gray-200 py-6 px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        <h2 className="text-base font-normal leading-6 text-neutral-950">
          Learn from 350+ leading universities and companies
        </h2>
        <div className="flex items-center gap-6 overflow-x-auto">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="bg-white border border-gray-200 rounded-[10px] h-[46px] px-[17px] py-1 flex items-center gap-2 shrink-0"
            >
              <span className="text-xl leading-7">{partner.emoji}</span>
              <span className="text-sm font-normal leading-5 text-neutral-950 whitespace-nowrap">
                {partner.name}
              </span>
            </div>
          ))}
          <button className="h-5 flex items-center gap-1 shrink-0 text-[#155dfc] hover:opacity-80">
            <span className="text-sm font-normal leading-5">View all</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PartnerLogosSection;

