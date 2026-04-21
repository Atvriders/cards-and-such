import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.js";

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<div data-testid="placeholder-home">Cards and Such — home</div>} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
