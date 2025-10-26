import { HeroUIProvider } from "@heroui/system";
import AddCourse from "./screens/AddCourse";


function App() {
  return (
    <HeroUIProvider>
    <AddCourse />
  </HeroUIProvider>
  );
}

export default App;
