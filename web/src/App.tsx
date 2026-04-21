import { Routes, Route } from "react-router-dom";

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<div data-testid="placeholder-home">Cards and Such — home</div>} />
    </Routes>
  );
}
