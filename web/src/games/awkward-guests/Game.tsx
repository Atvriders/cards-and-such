import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { AwkwardGuestsState, AwkwardGuestsAction, AwkwardGuestsSettings } from "./state.js";
import { AwkwardGuests_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function AwkwardGuestsGame({ state, dispatch, onGameOver }: GameProps<AwkwardGuestsState, AwkwardGuestsSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="awg"
      cfg={AwkwardGuests_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as AwkwardGuestsAction)}
      onSubmit={() => dispatch({ type: "submit" } as AwkwardGuestsAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, AwkwardGuests_CFG)}
      intro={FLAVOR}
    />
  );
}
