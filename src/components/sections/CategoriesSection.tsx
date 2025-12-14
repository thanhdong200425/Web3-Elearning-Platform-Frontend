import React from "react";

interface Category {
  value: string;
  label: string;
  icon?: React.ReactNode; // tùy chọn icon
}

const CategoriesSection: React.FC<{ categories: Category[] }> = ({ categories }) => {
  return (
    <section className="bg-white py-10 px-6 sm:px-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-800">
          Explore categories
        </h2>

        <div className="flex flex-wrap gap-3 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className="flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-3
                         bg-gradient-to-b from-white to-gray-50
                         border border-gray-200
                         rounded-lg
                         text-gray-700
                         font-medium
                         shadow-sm
                         hover:shadow-md hover:-translate-y-0.5
                         transition-all duration-300
                         focus:outline-none focus:ring-2 focus:ring-blue-400
                         whitespace-nowrap"
            >
              {cat.icon && <span className="w-5 h-5">{cat.icon}</span>}
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
