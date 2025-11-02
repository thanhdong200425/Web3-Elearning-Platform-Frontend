import { HeroUIProvider } from "@heroui/system";
import { Routes, Route, Navigate } from "react-router-dom";
import AddCourse from "./screens/AddCourse";
import StudentProfile from "./screens/StudentProfile";
import { ToastProvider } from "@heroui/toast";


function App() {
  return (
    <HeroUIProvider>
      <ToastProvider placement="top-right" toastOffset={20} />
      <Routes>
        <Route path="/" element={<Navigate to="/add-course" replace />} />
        <Route path="/add-course" element={<AddCourse />} />
        <Route path="/student-profile" element={<StudentProfile />} />
      </Routes>
    </HeroUIProvider>
  );
}

export default App;
