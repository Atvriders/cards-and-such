import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SolitaireFamilyView } from "./SolitaireFamilyView.js";
import {
  makeKlondikeFamilyRuleset,
  makeKlondikeFamilyState,
  type KlondikeFamilyConfig,
} from "./solitaire-family-engine.js";

const cfg: KlondikeFamilyConfig = {
  copies: 1,
  numTableau: 7,
  numFoundations: 4,
  drawCount: 1,
  redealsAllowed: 3,
  hasStock: true,
  hasWaste: true,
  stackKind: "alt-color",
  emptyPolicy: "any",
};

describe("SolitaireFamilyView", () => {
  it("renders the info bar (moves, score, redeals) and an Auto-move button with the configured prefix", () => {
    const state = makeKlondikeFamilyState(42, cfg);
    const { container } = render(
      <SolitaireFamilyView
        state={state}
        settings={undefined}
        dispatch={() => {}}
        onGameOver={() => {}}
        cfg={cfg}
        ruleset={makeKlondikeFamilyRuleset(cfg)}
        prefix="klond"
      />,
    );

    // Score/moves/redeals readouts come from initial state (movesMade=0, score=0).
    expect(screen.getByText("Moves: 0")).toBeInTheDocument();
    expect(screen.getByText("Score: 0")).toBeInTheDocument();
    // redealsAllowed >= 0 => redeals readout is rendered.
    expect(screen.getByText("Redeals: 3")).toBeInTheDocument();

    // Auto-move button is rendered with the prefix-scoped class.
    const auto = screen.getByRole("button", { name: "Auto-move" });
    expect(auto).toBeInTheDocument();
    expect(auto.className).toContain("klond-auto");

    // Root wrapper uses the supplied prefix and is NOT in the won state.
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe("klond-root");
  });

  it("renders one tableau column per cfg.numTableau and one foundation slot per cfg.numFoundations", () => {
    const state = makeKlondikeFamilyState(7, cfg);
    const { container } = render(
      <SolitaireFamilyView
        state={state}
        settings={undefined}
        dispatch={() => {}}
        onGameOver={() => {}}
        cfg={cfg}
        ruleset={makeKlondikeFamilyRuleset(cfg)}
        prefix="klond"
      />,
    );
    expect(container.querySelectorAll(".klond-col").length).toBe(cfg.numTableau);
    expect(container.querySelectorAll(".klond-foundation").length).toBe(
      cfg.numFoundations,
    );
    // Stock and waste regions present because hasStock / hasWaste are true.
    expect(container.querySelector(".klond-stock")).not.toBeNull();
    expect(container.querySelector(".klond-waste")).not.toBeNull();
  });

  it("hides the redeals readout when redealsAllowed is negative (infinite)", () => {
    const infinite: KlondikeFamilyConfig = { ...cfg, redealsAllowed: -1 };
    const state = makeKlondikeFamilyState(1, infinite);
    render(
      <SolitaireFamilyView
        state={state}
        settings={undefined}
        dispatch={() => {}}
        onGameOver={() => {}}
        cfg={infinite}
        ruleset={makeKlondikeFamilyRuleset(infinite)}
        prefix="klond"
      />,
    );
    expect(screen.queryByText(/^Redeals:/)).toBeNull();
  });
});
