import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./pages/AppLayout";
import Canvas from "./pages/Canvas";
import Live from "./pages/Live";
import GlobeLayout from "./pages/GlobeLayout";
import ContinentLayout from "./pages/ContinentLayout";
import CountryLayout from "./pages/CountryLayout";
import MyInterests from "./pages/MyInterests";
import MyLearning from "./pages/MyLearning";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import About from "./pages/About";
import PageNotFound from "./pages/PageNotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Live />} />
        {/* <Route path="live" element={<Live />}/> */}
        <Route path="live" element={<Live />}>
          <Route index element={<GlobeLayout />} />
          <Route path="globe" element={<GlobeLayout />} />
          <Route path="continents" element={<ContinentLayout />} />
          <Route path="countries" element={<CountryLayout />} />
        </Route>

        <Route path="app" element={<AppLayout />}>
          <Route path="canvas" element={<Canvas />}>
            <Route path="my-interests" element={<MyInterests />} />
            <Route path="my-learning" element={<MyLearning />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="login" element={<Login />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
