import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ToadHoleState, ToadHoleSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function ToadHoleGame(
  props: GameProps<ToadHoleState, ToadHoleSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="toad-hole"
    />
  );
}
