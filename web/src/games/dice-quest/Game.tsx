import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceQuestState, DiceQuestAction, DiceQuestSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, CHOICES } from "./state.js";
import "./Game.css";

export function DiceQuestGame({ state, dispatch, onGameOver }: GameProps<DiceQuestState, DiceQuestSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="qu-wrap">
        <div className="qu-done">
          <h2>{state.hp > 0 ? "Quest Complete" : "Hero Falls"}</h2>
          <div className="qu-final">{state.score} pts</div>
          <div className="qu-log">{state.log}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="qu-wrap">
      <div className="qu-banner">Round {state.round} / {TOTAL_ROUNDS} · HP {state.hp} · Score {state.score}</div>
      {state.rolls && (
        <div className="qu-row">
          {state.rolls.map((r, i) => <div key={i} className="qu-die">{r}</div>)}
        </div>
      )}
      <div className="qu-log">{state.log || "Choose your path. Each has different rewards and dangers."}</div>
      {state.phase === "predict" && (
        <div className="qu-actions">
          {CHOICES.map(c => (
            <button key={c} className={`qu-btn p-${c.toLowerCase()}`} onClick={() => dispatch({ type: "go", choice: c } as DiceQuestAction)}>{c}</button>
          ))}
        </div>
      )}
      {state.phase === "result" && (
        <button className="qu-btn next" onClick={() => dispatch({ type: "next" } as DiceQuestAction)}>Continue</button>
      )}
    </div>
  );
}
