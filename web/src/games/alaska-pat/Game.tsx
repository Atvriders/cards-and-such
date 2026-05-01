import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AlaskaPatState, AlaskaPatSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function AlaskaPatGame(
  props: GameProps<AlaskaPatState, AlaskaPatSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="alaska-pat"
    />
  );
}
