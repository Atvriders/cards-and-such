import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WretchedZombieState, WretchedZombieAction, WretchedZombieSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function WretchedZombieGame({ state, dispatch, onGameOver }: GameProps<WretchedZombieState, WretchedZombieSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="wrz-wrap"><div className="wrz-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#b91c1c" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="wrz-wrap">
      <div className="wrz-header">
        <span className="wrz-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="wrz-score">{state.score} pts</span>
      </div>
      <div className="wrz-prompt">{p.prompt}</div>
      <div className="wrz-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`wrz-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as WretchedZombieAction)}>
            <span className="wrz-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="wrz-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="wrz-actions">
        {isResult && <button className="wrz-btn next" onClick={() => dispatch({ type:"next" } as WretchedZombieAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
