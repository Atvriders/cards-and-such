import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FiveStudPokerState, FiveStudPokerAction, FiveStudPokerSettings } from "./state.js";
import { isTerminal, bestFiveStud, TOTAL_HANDS } from "./state.js";
import { StudTable } from "../_shared/StudTable.js";
import "./Game.css";

export function FiveStudPokerGame({ state, dispatch, onGameOver }: GameProps<FiveStudPokerState, FiveStudPokerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const ante = parseInt(state.settings.ante, 10);
  const dis = (a: FiveStudPokerAction): void => dispatch(a);

  const playerLabel = state.player.cards.length >= 2
    ? bestFiveStud(state.player.cards).class : undefined;
  const cpuLabel = state.showdownReveal && state.cpu.cards.length >= 2
    ? bestFiveStud(state.cpu.cards).class : undefined;

  return (
    <StudTable
      prefix="fivestud-"
      state={state}
      totalHands={TOTAL_HANDS}
      smallBet={ante * 2}
      playerHandLabel={playerLabel}
      cpuHandLabel={cpuLabel}
      onDeal={() => dis({ type: "deal" })}
      onFold={() => dis({ type: "fold" })}
      onCheck={() => dis({ type: "check" })}
      onCall={() => dis({ type: "call" })}
      onRaise={(amount) => dis({ type: "raise", amount })}
    />
  );
}
