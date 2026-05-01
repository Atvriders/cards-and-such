import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OmahaHiState, OmahaHiAction, OmahaHiSettings } from "./state.js";
import { isTerminal, bestOmaha, TOTAL_HANDS } from "./state.js";
import { PokerTable } from "../_shared/PokerTable.js";
import "./Game.css";

export function OmahaHiGame({ state, dispatch, onGameOver }: GameProps<OmahaHiState, OmahaHiSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const sb = parseInt(state.settings.smallBlind, 10);
  const dis = (a: OmahaHiAction): void => dispatch(a);

  const playerBest = state.player.hole.length === 4 && state.community.length >= 3
    ? bestOmaha(state.player.hole, state.community) : null;
  const cpuBest = state.showdownReveal && state.cpu.hole.length === 4 && state.community.length >= 3
    ? bestOmaha(state.cpu.hole, state.community) : null;

  return (
    <PokerTable
      prefix="omaha-hi-"
      state={state}
      totalHands={TOTAL_HANDS}
      smallBlind={sb}
      playerHandLabel={playerBest?.class}
      cpuHandLabel={cpuBest?.class}
      onDeal={() => dis({ type: "deal" })}
      onFold={() => dis({ type: "fold" })}
      onCheck={() => dis({ type: "check" })}
      onCall={() => dis({ type: "call" })}
      onRaise={(amount) => dis({ type: "raise", amount })}
    />
  );
}
