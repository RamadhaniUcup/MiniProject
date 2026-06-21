import { Navigate, Route, Routes } from "react-router-dom";
import SiteLayout from "./components/layouts/SiteLayout";
import AboutPage from "./pages/AboutPage";
import GalleryPage from "./pages/GalleryPage";
import PhilosophyPage from "./pages/PhilosophyPage";
import ScanPage from "./pages/ScanPage";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Navigate to="/scan" replace />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/galeri" element={<GalleryPage />} />
        <Route path="/filosofi" element={<PhilosophyPage />} />
        <Route path="/tentang" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
