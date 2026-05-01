import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SomersetState, SomersetSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function SomersetGame(
  props: GameProps<SomersetState, SomersetSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="somerset"
    />
  );
}
