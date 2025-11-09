import { HeroUIProvider } from '@heroui/system';
import { ToastProvider } from '@heroui/toast';
import { Routes, Route } from 'react-router-dom';
import Home from './screens/Home';
import AddCourse from './screens/AddCourse';
import CourseDetail from './screens/CourseDetail';
import MyCourses from './screens/MyCourses';
import CourseViewer from './components/CourseViewer';

function App() {
  return (
    <HeroUIProvider>
      <ToastProvider placement="top-right" toastOffset={20} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-course" element={<AddCourse />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="/course/:courseId/view" element={<CourseViewer />} />
        <Route path="/my-courses" element={<MyCourses />} />
      </Routes>
    </HeroUIProvider>
  );
}

export default App;