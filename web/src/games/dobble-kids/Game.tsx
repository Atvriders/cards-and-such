import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DobbleKidsState, DobbleKidsAction, DobbleKidsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DobbleKidsGame({ state, dispatch, onGameOver }: GameProps<DobbleKidsState, DobbleKidsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="dobkidz-wrap">
        <div className="dobkidz-done bounce-in">
          <h2>Spotted</h2>
          <div className="dobkidz-stats">{state.correctCount} / {state.rounds.length} hits · {(state.totalMs / 1000).toFixed(1)}s total</div>
          <div className="dobkidz-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  const r = state.rounds[state.currentIndex]!;
  const onPick = (sym: string): void => {
    if (state.submitted) return;
    dispatch({ type: "select", symbol: sym, nowMs: performance.now() } as DobbleKidsAction);
  };
  const onNext = (): void => {
    dispatch({ type: "next", nowMs: performance.now() } as DobbleKidsAction);
  };
  const isCorrect = state.selected === r.shared;

  return (
    <div className="dobkidz-wrap fade-in">
      <div className="dobkidz-header">
        <span className="dobkidz-progress">Card {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="dobkidz-score pulse">{state.score} pts</span>
      </div>
      <div className="dobkidz-prompt">Find the symbol on BOTH cards. Click it.</div>
      <div className="dobkidz-cards">
        <div className="dobkidz-card">
          {r.cardA.symbols.map((s, i) => (
            <button key={"a"+i} className={`dobkidz-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
        <div className="dobkidz-vs">vs</div>
        <div className="dobkidz-card">
          {r.cardB.symbols.map((s, i) => (
            <button key={"b"+i} className={`dobkidz-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
      </div>
      {state.submitted && (
        <>
          <div className={`dobkidz-feedback ${isCorrect ? "ok" : "no"}`}>
            {isCorrect ? `Match in ${(state.lastMs / 1000).toFixed(1)}s` : `Miss · the match was ${r.shared}`}
          </div>
          <button className="dobkidz-btn next" onClick={onNext}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>
        </>
      )}
      {!state.submitted && <div className="dobkidz-timer">Speed counts · click fast for bonus points</div>}
    </div>
  );
}
