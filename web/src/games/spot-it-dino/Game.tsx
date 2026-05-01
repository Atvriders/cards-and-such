import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpotItDinoState, SpotItDinoAction, SpotItDinoSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpotItDinoGame({ state, dispatch, onGameOver }: GameProps<SpotItDinoState, SpotItDinoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="spotdno-wrap">
        <div className="spotdno-done">
          <h2>Spotted</h2>
          <div className="spotdno-stats">{state.correctCount} / {state.rounds.length} hits · {(state.totalMs / 1000).toFixed(1)}s total</div>
          <div className="spotdno-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  const r = state.rounds[state.currentIndex]!;
  const onPick = (sym: string): void => {
    if (state.submitted) return;
    dispatch({ type: "select", symbol: sym, nowMs: performance.now() } as SpotItDinoAction);
  };
  const onNext = (): void => {
    dispatch({ type: "next", nowMs: performance.now() } as SpotItDinoAction);
  };
  const isCorrect = state.selected === r.shared;

  return (
    <div className="spotdno-wrap">
      <div className="spotdno-header">
        <span className="spotdno-progress">Card {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="spotdno-score">{state.score} pts</span>
      </div>
      <div className="spotdno-prompt">Find the symbol on BOTH cards. Click it.</div>
      <div className="spotdno-cards">
        <div className="spotdno-card">
          {r.cardA.symbols.map((s, i) => (
            <button key={"a"+i} className={`spotdno-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
        <div className="spotdno-vs">vs</div>
        <div className="spotdno-card">
          {r.cardB.symbols.map((s, i) => (
            <button key={"b"+i} className={`spotdno-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
      </div>
      {state.submitted && (
        <>
          <div className={`spotdno-feedback ${isCorrect ? "ok" : "no"}`}>
            {isCorrect ? `Match in ${(state.lastMs / 1000).toFixed(1)}s` : `Miss · the match was ${r.shared}`}
          </div>
          <button className="spotdno-btn next" onClick={onNext}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>
        </>
      )}
      {!state.submitted && <div className="spotdno-timer">Speed counts · click fast for bonus points</div>}
    </div>
  );
}
