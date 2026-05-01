import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpotItHarryPotterState, SpotItHarryPotterAction, SpotItHarryPotterSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpotItHarryPotterGame({ state, dispatch, onGameOver }: GameProps<SpotItHarryPotterState, SpotItHarryPotterSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="spithp-wrap">
        <div className="spithp-done">
          <h2>Spotted</h2>
          <div className="spithp-stats">{state.correctCount} / {state.rounds.length} hits · {(state.totalMs / 1000).toFixed(1)}s total</div>
          <div className="spithp-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  const r = state.rounds[state.currentIndex]!;
  const onPick = (sym: string): void => {
    if (state.submitted) return;
    dispatch({ type: "select", symbol: sym, nowMs: performance.now() } as SpotItHarryPotterAction);
  };
  const onNext = (): void => {
    dispatch({ type: "next", nowMs: performance.now() } as SpotItHarryPotterAction);
  };
  const isCorrect = state.selected === r.shared;

  return (
    <div className="spithp-wrap">
      <div className="spithp-header">
        <span className="spithp-progress">Card {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="spithp-score">{state.score} pts</span>
      </div>
      <div className="spithp-prompt">Find the symbol on BOTH cards. Click it.</div>
      <div className="spithp-cards">
        <div className="spithp-card">
          {r.cardA.symbols.map((s, i) => (
            <button key={"a"+i} className={`spithp-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
        <div className="spithp-vs">vs</div>
        <div className="spithp-card">
          {r.cardB.symbols.map((s, i) => (
            <button key={"b"+i} className={`spithp-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
      </div>
      {state.submitted && (
        <>
          <div className={`spithp-feedback ${isCorrect ? "ok" : "no"}`}>
            {isCorrect ? `Match in ${(state.lastMs / 1000).toFixed(1)}s` : `Miss · the match was ${r.shared}`}
          </div>
          <button className="spithp-btn next" onClick={onNext}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>
        </>
      )}
      {!state.submitted && <div className="spithp-timer">Speed counts · click fast for bonus points</div>}
    </div>
  );
}
