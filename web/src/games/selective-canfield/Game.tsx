import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SelectiveCanfieldState, SelectiveCanfieldSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function SelectiveCanfieldGame(
  props: GameProps<SelectiveCanfieldState, SelectiveCanfieldSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="selective-canfield"
    />
  );
}
