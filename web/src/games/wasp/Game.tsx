import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WaspState, WaspSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function WaspGame(
  props: GameProps<WaspState, WaspSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="wasp"
    />
  );
}
