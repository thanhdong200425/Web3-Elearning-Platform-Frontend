import React from "react";
import {
  Brain,
  Building2,
  Code,
  University,
  Network,
  Cpu,
  Atom,
} from "lucide-react";
const Header: React.FC = () => {
  const logos = [
    { name: "Google", icon: <Network className="w-5 h-5 text-blue-500" /> },
    {
      name: "DeepLearning.AI",
      icon: <Brain className="w-5 h-5 text-pink-500" />,
    },
    { name: "Amazon", icon: <University className="w-5 h-5 text-amber-600" /> },
    { name: "IBM", icon: <Cpu className="w-5 h-5 text-gray-700" /> },
    {
      name: "Viet Nam - Korea University",
      icon: <Building2 className="w-5 h-5 text-green-700" />,
    },
    { name: "Microsoft", icon: <Code className="w-5 h-5 text-orange-600" /> },
    { name: "Meta", icon: <Atom className="w-5 h-5 text-blue-700" /> },
  ];
  return (
    <header className="bg-gray-50 py-6 px-8 shadow-sm border-b border-gray-200">
      {" "}
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
        {" "}
        <p className="text-sm sm:text-base text-gray-700 text-center font-medium">
          {" "}
          Learn from <span className="text-blue-600 font-semibold">
            350+
          </span>{" "}
          leading universities and companies{" "}
        </p>{" "}
        <div className="flex flex-wrap justify-center gap-3">
          {" "}
          {logos.map(({ name, icon }) => (
            <div
              key={name}
              className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 cursor-pointer"
              title={name}
            >
              {" "}
              {icon}{" "}
              <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                {" "}
                {name}{" "}
              </span>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </header>
  );
};
export default Header;
