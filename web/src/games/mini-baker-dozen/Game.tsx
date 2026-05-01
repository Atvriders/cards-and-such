import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniBakerDozenState, MiniBakerDozenSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function MiniBakerDozenGame(
  props: GameProps<MiniBakerDozenState, MiniBakerDozenSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="mini-baker-dozen"
    />
  );
}
