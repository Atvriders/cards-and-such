import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AgnesSorelState, AgnesSorelSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function AgnesSorelGame(
  props: GameProps<AgnesSorelState, AgnesSorelSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="agnes-sorel"
    />
  );
}
