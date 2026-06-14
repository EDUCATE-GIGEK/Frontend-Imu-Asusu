import { BrowserRouter, Routes, Route } from "react-router-dom";
import LiveProvider from "./contexts/LiveContext";

import AppLayout from "./pages/AppLayout";
import Live from "./pages/Live";
import NigeriaStatesLayout from "./pages/NigeriaStatesLayout";
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

//Info: n index route cannot have child routes. By definition, an index route is a leaf node (an end-point) that renders at the exact path of the parent. Because <Route index element={<Live />}> does not have a explicit path, it cannot cleanly pass down a nested URL context to its children.

export default function App() {
  return (
    <BrowserRouter>
      <LiveProvider>
        <Routes>
          {/* Solution */}
          <Route path="/" element={<Live />}>
            <Route index element={<NigeriaStatesLayout />} />
          </Route>

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
      </LiveProvider>
    </BrowserRouter>
  );
}
