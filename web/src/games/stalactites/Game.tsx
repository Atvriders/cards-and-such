import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StalactitesState, StalactitesSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function StalactitesGame(
  props: GameProps<StalactitesState, StalactitesSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="stalactites"
    />
  );
}
