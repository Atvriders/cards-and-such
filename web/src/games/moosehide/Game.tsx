import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MoosehideState, MoosehideSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function MoosehideGame(
  props: GameProps<MoosehideState, MoosehideSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="moosehide"
    />
  );
}
