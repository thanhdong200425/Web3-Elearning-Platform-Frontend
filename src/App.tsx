import { HeroUIProvider } from "@heroui/system";
import AddCourse from "./screens/AddCourse";
import { ToastProvider } from "@heroui/toast";


function App() {
  return (
    <HeroUIProvider>
      <ToastProvider placement="top-right" toastOffset={20} />
      <AddCourse />
    </HeroUIProvider>
  );
}

export default App;
