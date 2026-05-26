import Dashboard from "@/features/AppLayout/Dashboard";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div>
      <Dashboard />
      <Outlet />
    </div>
  );
}
