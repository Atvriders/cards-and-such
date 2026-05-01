import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MoosehideYukonState, MoosehideYukonSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function MoosehideYukonGame(
  props: GameProps<MoosehideYukonState, MoosehideYukonSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="moosehide-yukon"
    />
  );
}
