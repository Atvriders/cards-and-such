import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App.js";

describe("App", () => {
  it("renders the home placeholder at /", () => {
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    expect(screen.getByTestId("placeholder-home")).toBeInTheDocument();
  });
});
