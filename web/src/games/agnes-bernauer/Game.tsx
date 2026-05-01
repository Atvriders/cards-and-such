import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AgnesBernauerState, AgnesBernauerSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function AgnesBernauerGame(
  props: GameProps<AgnesBernauerState, AgnesBernauerSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="agnes-bernauer"
    />
  );
}
