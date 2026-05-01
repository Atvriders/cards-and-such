import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AlaskaState, AlaskaSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function AlaskaGame(
  props: GameProps<AlaskaState, AlaskaSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="alaska"
    />
  );
}
