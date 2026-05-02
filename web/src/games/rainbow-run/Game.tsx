import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RainbowRunState, RainbowRunAction, RainbowRunSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";

const SUIT_NAMES = ["♠", "♥", "♦", "♣"];

export function RainbowRunGame({ state, dispatch, onGameOver }: GameProps<RainbowRunState, RainbowRunSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div>Rainbows: {state.rainbows}</div><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.drawn} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts ({state.rainbows} rainbows)</div>
      <div className="cm-row">
        {SUIT_NAMES.map((sym, i) => (
          <div key={i} className={`cm-suit ${state.suitsSeen[i] ? "got" : ""}`}>{sym}</div>
        ))}
      </div>
      {state.lastCard !== null && (
        <div className={`cm-card ${isRed(state.lastCard) ? "red" : "black"}`}>{cardName(state.lastCard)}</div>
      )}
      <button data-testid="hint-target-rainbow-run-primary" className="cm-btn" onClick={() => dispatch({ type:"draw" } as RainbowRunAction)}>Draw</button>
    </div>
  );
}
