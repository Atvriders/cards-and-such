import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StalactitesPatState, StalactitesPatSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function StalactitesPatGame(
  props: GameProps<StalactitesPatState, StalactitesPatSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="stalactites-pat"
    />
  );
}
