import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { Routes, Route, Link, Navigate } from "react-router-dom";

import AddCourse from "./screens/AddCourse";
import StudentProfile from "./screens/StudentProfile";
import Certificate from "./screens/Certificate";

function App() {
  return (
    <HeroUIProvider>
      {/* ✅ Standalone provider (self-closing). No JSX children inside. */}
      <ToastProvider placement="top-right" toastOffset={20} />

      {/* If your index.tsx already has <BrowserRouter>, remove this wrapper */}
      
        {/* Header */}
        <header className="w-full border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link to="/" className="font-semibold text-gray-900 hover:opacity-80">
              Web3 E-Learning
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Create Course
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-gray-900">
                Student Profile
              </Link>
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<AddCourse />} />
            <Route path="/profile" element={<StudentProfile />} />
            {/* keep both param aliases for compatibility */}
            <Route path="/certificate/:courseId" element={<Certificate />} />
            <Route path="/certificate/:id" element={<Certificate />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      
    </HeroUIProvider>
  );
}

export default App;
