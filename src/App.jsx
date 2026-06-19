import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./pages/AppLayout";
import Manuscripts from "./pages/Manuscripts";
import MyLearning from "./pages/Learning";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import About from "./pages/About";
import CountryPage from "./pages/CountryPage";
import StatePage from "./pages/StatePage";
import LocalGovernmentPage from "./pages/LocalGovernmentPage";
import EthnicGroupPage from "./pages/EthnicGroupPage";
import TribePage from "./pages/TribePage";
import PageNotFound from "./pages/PageNotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/app/country" replace />} />

          <Route path="app" element={<AppLayout />}>
            <Route path="country" element={<CountryPage />} />
            <Route path="state" element={<StatePage />} />
            <Route path="local-government" element={<LocalGovernmentPage />} />
            <Route path="ethnic-group" element={<EthnicGroupPage />} />
            <Route path="tribe" element={<TribePage />} />
            <Route path="my-manuscripts" element={<Manuscripts />} />
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
