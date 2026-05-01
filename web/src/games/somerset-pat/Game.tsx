import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SomersetPatState, SomersetPatSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function SomersetPatGame(
  props: GameProps<SomersetPatState, SomersetPatSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="somerset-pat"
    />
  );
}
