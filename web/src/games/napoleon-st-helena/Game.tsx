import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NapoleonStHelenaState, NapoleonStHelenaSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function NapoleonStHelenaGame(
  props: GameProps<NapoleonStHelenaState, NapoleonStHelenaSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="napoleon-st-helena"
    />
  );
}
