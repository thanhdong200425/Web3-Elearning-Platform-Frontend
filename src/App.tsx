import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { Routes, Route } from "react-router-dom";
import CourseDetail from "./screens/CourseDetail";
import CourseLearn from "./screens/CourseLearn";
import MyCourses from "./screens/MyCourses";
import CourseViewer from "./components/course/CourseViewer";
import Home from "./screens/Home";
import StudentProfile from "./screens/StudentProfile";
import AddCourse from "./screens/AddCourse";
import EditCourse from "./screens/EditCourse";
import Certificate from "./schemas/Certificate";
import { useAuth } from "@/contexts/AuthContext";
import SignInModal from "@/components/modals/SignInModal";

function App() {
  const { showSignInModal, setShowSignInModal } = useAuth();

  return (
    <HeroUIProvider>
      <ToastProvider placement="top-right" toastOffset={20} />
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />
      <Routes>
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="/course/:courseId/edit" element={<EditCourse />} />
        <Route path="/course/:courseId/learn" element={<CourseLearn />} />
        <Route path="/course/:courseId/view" element={<CourseViewer />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route element={<Home />} path="/" />
        <Route element={<AddCourse />} path="/add-course" />
        <Route element={<StudentProfile />} path="/profile" />
        <Route element={<Certificate />} path="/certificate/:courseId" />
        <Route element={<Certificate />} path="/certificate/:id" />
      </Routes>
    </HeroUIProvider>
  );
}

export default App;
