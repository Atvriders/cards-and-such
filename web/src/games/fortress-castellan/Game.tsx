import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FortressCastellanState, FortressCastellanSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function FortressCastellanGame(
  props: GameProps<FortressCastellanState, FortressCastellanSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="fortress-castellan"
    />
  );
}
