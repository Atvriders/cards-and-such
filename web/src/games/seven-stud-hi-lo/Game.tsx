import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SevenStudHiLoState, SevenStudHiLoAction, SevenStudHiLoSettings } from "./state.js";
import { isTerminal, bestFive, bestLow8, TOTAL_HANDS } from "./state.js";
import { StudTable } from "../_shared/StudTable.js";
import "./Game.css";

export function SevenStudHiLoGame({ state, dispatch, onGameOver }: GameProps<SevenStudHiLoState, SevenStudHiLoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const ante = parseInt(state.settings.ante, 10);
  const dis = (a: SevenStudHiLoAction): void => dispatch(a);

  const ph = state.player.cards.length >= 5 ? bestFive(state.player.cards) : null;
  const pl = state.player.cards.length >= 5 ? bestLow8(state.player.cards) : null;
  const playerLabel = ph
    ? `${ph.class}${pl?.ok ? ` / lo ${pl.ranks.map((r) => (r === 1 ? "A" : r)).join("-")}` : ""}`
    : undefined;
  const ch = state.showdownReveal && state.cpu.cards.length >= 5 ? bestFive(state.cpu.cards) : null;
  const cl = state.showdownReveal && state.cpu.cards.length >= 5 ? bestLow8(state.cpu.cards) : null;
  const cpuLabel = ch
    ? `${ch.class}${cl?.ok ? ` / lo ${cl.ranks.map((r) => (r === 1 ? "A" : r)).join("-")}` : ""}`
    : undefined;

  return (
    <StudTable
      prefix="sevenstud-hilo-"
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
