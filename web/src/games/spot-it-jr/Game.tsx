import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpotItJrState, SpotItJrAction, SpotItJrSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpotItJrGame({ state, dispatch, onGameOver }: GameProps<SpotItJrState, SpotItJrSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="spotjr-wrap">
        <div className="spotjr-done">
          <h2>Spotted</h2>
          <div className="spotjr-stats">{state.correctCount} / {state.rounds.length} hits · {(state.totalMs / 1000).toFixed(1)}s total</div>
          <div className="spotjr-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  const r = state.rounds[state.currentIndex]!;
  const onPick = (sym: string): void => {
    if (state.submitted) return;
    dispatch({ type: "select", symbol: sym, nowMs: performance.now() } as SpotItJrAction);
  };
  const onNext = (): void => {
    dispatch({ type: "next", nowMs: performance.now() } as SpotItJrAction);
  };
  const isCorrect = state.selected === r.shared;

  return (
    <div className="spotjr-wrap">
      <div className="spotjr-header">
        <span className="spotjr-progress">Card {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="spotjr-score">{state.score} pts</span>
      </div>
      <div className="spotjr-prompt">Find the symbol on BOTH cards. Click it.</div>
      <div className="spotjr-cards">
        <div className="spotjr-card">
          {r.cardA.symbols.map((s, i) => (
            <button key={"a"+i} className={`spotjr-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
        <div className="spotjr-vs">vs</div>
        <div className="spotjr-card">
          {r.cardB.symbols.map((s, i) => (
            <button key={"b"+i} className={`spotjr-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
      </div>
      {state.submitted && (
        <>
          <div className={`spotjr-feedback ${isCorrect ? "ok" : "no"}`}>
            {isCorrect ? `Match in ${(state.lastMs / 1000).toFixed(1)}s` : `Miss · the match was ${r.shared}`}
          </div>
          <button className="spotjr-btn next" onClick={onNext}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>
        </>
      )}
      {!state.submitted && <div className="spotjr-timer">Speed counts · click fast for bonus points</div>}
    </div>
  );
}
