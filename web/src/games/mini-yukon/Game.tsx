import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniYukonState, MiniYukonSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function MiniYukonGame(
  props: GameProps<MiniYukonState, MiniYukonSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="mini-yukon"
    />
  );
}
