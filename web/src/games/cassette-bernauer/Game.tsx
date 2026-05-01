import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CassetteBernauerState, CassetteBernauerSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function CassetteBernauerGame(
  props: GameProps<CassetteBernauerState, CassetteBernauerSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="cassette-bernauer"
    />
  );
}
