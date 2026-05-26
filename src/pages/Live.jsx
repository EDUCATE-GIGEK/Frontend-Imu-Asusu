//1. ContinentGrid → displays clickable continent SVG images
//2. ExpandedContinent → shows countries when a continent is clicked
//3. ContinentCarousel/Pages → full-page view of each selected continent in order

import { Outlet } from "react-router-dom";
import LiveProvider from "../contexts/LiveContext";

export default function Live() {
  return (
    <LiveProvider>
        <Outlet />
    </LiveProvider>
  );
}

  
