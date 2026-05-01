import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ExNovoMapmakerState, ExNovoMapmakerAction, ExNovoMapmakerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function ExNovoMapmakerGame({ state, dispatch, onGameOver }: GameProps<ExNovoMapmakerState, ExNovoMapmakerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="enm-wrap"><div className="enm-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#1e3a8a" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="enm-wrap">
      <div className="enm-header">
        <span className="enm-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="enm-score">{state.score} pts</span>
      </div>
      <div className="enm-prompt">{p.prompt}</div>
      <div className="enm-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`enm-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as ExNovoMapmakerAction)}>
            <span className="enm-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="enm-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="enm-actions">
        {isResult && <button className="enm-btn next" onClick={() => dispatch({ type:"next" } as ExNovoMapmakerAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
