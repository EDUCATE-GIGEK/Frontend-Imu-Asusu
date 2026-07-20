import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./pages/AppLayout";
import Manuscripts from "./pages/Manuscripts";
import Timeline from "./pages/Timeline";
import MyLearning from "./pages/Learning";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import About from "./pages/About";
import PlacePage from "./pages/PlacePage";
import PeoplePage from "./pages/PeoplePage";
import PageNotFound from "./pages/PageNotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/app/place/a735a0fb-a76c-436f-b38e-d8feb9373aa9" replace />} />

          <Route path="app" element={<AppLayout />}>
            <Route path="place/:id" element={<PlacePage />} />
            <Route path="people/:id" element={<PeoplePage />} />
            <Route path="my-manuscripts" element={<Manuscripts />} />
            <Route path="my-timeline" element={<Timeline />} />
            <Route path="my-learning" element={<MyLearning />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="login" element={<Login />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
