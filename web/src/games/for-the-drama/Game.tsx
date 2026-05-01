import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ForTheDramaState, ForTheDramaAction, ForTheDramaSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function ForTheDramaGame({ state, dispatch, onGameOver }: GameProps<ForTheDramaState, ForTheDramaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="ftd-wrap"><div className="ftd-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#facc15" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="ftd-wrap">
      <div className="ftd-header">
        <span className="ftd-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="ftd-score">{state.score} pts</span>
      </div>
      <div className="ftd-prompt">{p.prompt}</div>
      <div className="ftd-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`ftd-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as ForTheDramaAction)}>
            <span className="ftd-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="ftd-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="ftd-actions">
        {isResult && <button className="ftd-btn next" onClick={() => dispatch({ type:"next" } as ForTheDramaAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
