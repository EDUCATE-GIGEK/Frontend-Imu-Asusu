import { BrowserRouter, Routes, Route } from "react-router-dom";
import LiveProvider from "./contexts/LiveContext";

import AppLayout from "./pages/AppLayout";
import Live from "./pages/Live";
import ContinentsLayout from "./pages/ContinentsLayout";
import CountriesLayout from "./pages/CountriesLayout";
import MyInterests from "./pages/MyInterests";
import MyLearning from "./pages/MyLearning";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import About from "./pages/About";
import CountryPage from "./pages/CountryPage";
import StatePage from "./pages/StatePage";
import LocalGovernmentPage from "./pages/LocalGovernmentPage";
import Information from "./pages/Information";
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
            {/* This renders at / */}
            <Route index element={<ContinentsLayout />} />
            {/* These render at /continents and /countries */}
            <Route path="continents" element={<ContinentsLayout />} />
            <Route path="countries" element={<CountriesLayout />} />
          </Route>

          <Route path="app" element={<AppLayout />}>
            <Route index element={<CountryPage />} />
            <Route path="country" element={<CountryPage />} />
            <Route path="state" element={<StatePage />} />
            <Route path="local-government" element={<LocalGovernmentPage />} />
            <Route path="information" element={<Information />} />
            <Route path="tribe" element={<TribePage />} />
            <Route path="my-interests" element={<MyInterests />} />
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
