import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TowerLondonSoliState, TowerLondonSoliSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function TowerLondonSoliGame(
  props: GameProps<TowerLondonSoliState, TowerLondonSoliSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="tower-london-soli"
    />
  );
}
