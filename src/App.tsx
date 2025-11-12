import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { Routes, Route } from "react-router-dom";

import Home from "./screens/Home";
import AITutor from "./screens/AITutor";
import AIResult from "./screens/AIResult";
import StudentProfile from "./screens/StudentProfile";
import AddCourse from "./screens/AddCourse";
import Certificate from "./schemas/Certificate";

function App() {
  return (
    <HeroUIProvider>
      <ToastProvider placement="top-right" toastOffset={20} />
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<AddCourse />} path="/add-course" />
        <Route element={<AITutor />} path="/ai-tutor" />
        <Route element={<AIResult />} path="/ai-result" />
        <Route element={<StudentProfile />} path="/profile" />
        <Route element={<Certificate />} path="/certificate/:courseId" />
        <Route element={<Certificate />} path="/certificate/:id" />
      </Routes>
    </HeroUIProvider>
  );
}

export default App;
