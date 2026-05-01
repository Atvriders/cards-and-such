import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniEightOffState, MiniEightOffSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function MiniEightOffGame(
  props: GameProps<MiniEightOffState, MiniEightOffSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="mini-eight-off"
    />
  );
}
