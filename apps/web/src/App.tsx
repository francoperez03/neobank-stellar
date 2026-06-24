import { Route, Routes } from "react-router-dom";
import { Home } from "@/pages/home";
import { AppLayout } from "@/pages/app/layout";
import { AppIndexPage } from "@/pages/app";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<AppIndexPage />} />
      </Route>
    </Routes>
  );
}
