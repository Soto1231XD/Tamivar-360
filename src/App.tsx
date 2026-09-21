import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Home } from "@/pages/Home/Home";
import { Projects } from "@/pages/Projects/Projects";
import { ProjectEditor } from "@/pages/ProjectEditor/ProjectEditor";
import { Preview } from "@/pages/Preview/Preview";
import { Viewer } from "@/pages/Viewer/Viewer";
import { ToastViewport } from "@/components/ui/Toast";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/editor/:projectId" element={<ProjectEditor />} />
        <Route path="/preview/:projectId" element={<Preview />} />
        <Route path="/viewer/:projectId" element={<Viewer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastViewport />
    </BrowserRouter>
  );
}
