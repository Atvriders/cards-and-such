import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpotIt50PlusState, SpotIt50PlusAction, SpotIt50PlusSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpotIt50PlusGame({ state, dispatch, onGameOver }: GameProps<SpotIt50PlusState, SpotIt50PlusSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="spot50p-wrap">
        <div className="spot50p-done">
          <h2>Spotted</h2>
          <div className="spot50p-stats">{state.correctCount} / {state.rounds.length} hits · {(state.totalMs / 1000).toFixed(1)}s total</div>
          <div className="spot50p-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  const r = state.rounds[state.currentIndex]!;
  const onPick = (sym: string): void => {
    if (state.submitted) return;
    dispatch({ type: "select", symbol: sym, nowMs: performance.now() } as SpotIt50PlusAction);
  };
  const onNext = (): void => {
    dispatch({ type: "next", nowMs: performance.now() } as SpotIt50PlusAction);
  };
  const isCorrect = state.selected === r.shared;

  return (
    <div className="spot50p-wrap">
      <div className="spot50p-header">
        <span className="spot50p-progress">Card {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="spot50p-score">{state.score} pts</span>
      </div>
      <div className="spot50p-prompt">Find the symbol on BOTH cards. Click it.</div>
      <div className="spot50p-cards">
        <div className="spot50p-card">
          {r.cardA.symbols.map((s, i) => (
            <button key={"a"+i} className={`spot50p-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
        <div className="spot50p-vs">vs</div>
        <div className="spot50p-card">
          {r.cardB.symbols.map((s, i) => (
            <button key={"b"+i} className={`spot50p-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
      </div>
      {state.submitted && (
        <>
          <div className={`spot50p-feedback ${isCorrect ? "ok" : "no"}`}>
            {isCorrect ? `Match in ${(state.lastMs / 1000).toFixed(1)}s` : `Miss · the match was ${r.shared}`}
          </div>
          <button className="spot50p-btn next" onClick={onNext}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>
        </>
      )}
      {!state.submitted && <div className="spot50p-timer">Speed counts · click fast for bonus points</div>}
    </div>
  );
}
