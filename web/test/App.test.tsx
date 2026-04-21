import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App.js";
import { useAuth } from "../src/platform/stores/auth.js";

describe("App", () => {
  it("renders the lobby at / when authenticated", () => {
    useAuth.setState({ username: "bob", token: "tok.tok.tok", expiresAt: Date.now() + 1000 * 60 });
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    expect(screen.getByTestId("lobby-empty")).toBeInTheDocument();
    useAuth.getState().logout();
  });
});
