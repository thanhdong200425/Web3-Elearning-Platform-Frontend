import { HeroUIProvider } from '@heroui/system';
import { ToastProvider } from '@heroui/toast';
import { Routes, Route } from 'react-router-dom';
import Home from './screens/Home';
import AddCourse from './screens/AddCourse';
import AITutor from './screens/AITutor';

function App() {
  return (
    <HeroUIProvider>
      <ToastProvider placement="top-right" toastOffset={20} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-course" element={<AddCourse />} />
        <Route path="/ai-tutor" element={<AITutor />} />
      </Routes>
    </HeroUIProvider>
  );
}

export default App;