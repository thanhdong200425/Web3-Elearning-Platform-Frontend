import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { Routes, Route } from "react-router-dom";

import Home from "./screens/Home";
import AddCourse from "./screens/AddCourse";
import AITutor from "./screens/AITutor";
import AIResult from "./screens/AIResult";

function App() {
  return (
    <HeroUIProvider>
      <ToastProvider placement="top-right" toastOffset={20} />
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<AddCourse />} path="/add-course" />
        <Route element={<AITutor />} path="/ai-tutor" />
        <Route element={<AIResult />} path="/ai-result" />
      </Routes>
    </HeroUIProvider>
  );
}

export default App;
