import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChoHanState, ChoHanAction, ChoHanSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./ChoHan.css";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function ChoHan({ state, dispatch, onGameOver }: GameProps<ChoHanState, ChoHanSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  return (
    <div className="cho-han">
      <h2>Chō-han</h2>
      <div className="cho-han-info">
        <span>Round: <strong>{state.round}/{state.maxRounds}</strong></span>
        <span>Bankroll: <strong>{state.bankroll}</strong></span>
        <span>Bet: <strong>{state.betSize}</strong></span>
      </div>

      <div className="cho-han-message">{state.message}</div>

      {state.lastRoll && (
        <div className="cho-han-dice">
          <span>{DICE_FACES[state.lastRoll[0]] ?? "?"}</span>
          <span>{DICE_FACES[state.lastRoll[1]] ?? "?"}</span>
          <span style={{ fontSize: "1rem", alignSelf: "center" }}>= {state.lastSum}</span>
        </div>
      )}

      {state.lastResult && (
        <div className={`cho-han-result ${state.lastResult}`}>
          {state.lastResult === "win" ? `+${state.betSize}` : `-${state.betSize}`}
        </div>
      )}

      {state.phase === "betting" && (
        <div className="cho-han-buttons">
          <button data-testid="hint-target-cho-han-bet" className="cho-han-btn cho" onClick={() => dispatch({ type: "bet", bet: "cho" } as ChoHanAction)}>
            Chō (Even)
          </button>
          <button data-testid="hint-target-cho-han-bet" className="cho-han-btn han" onClick={() => dispatch({ type: "bet", bet: "han" } as ChoHanAction)}>
            Han (Odd)
          </button>
        </div>
      )}

      {state.phase === "rolled" && (
        <button data-testid="hint-target-cho-han-next" className="cho-han-btn" onClick={() => dispatch({ type: "next" } as ChoHanAction)}>
          Next Round →
        </button>
      )}

      {state.gameOver && (
        <div className="cho-han-game-over">
          Final Bankroll: {state.bankroll}
          {state.bankroll > 1000 ? " — Profit!" : state.bankroll < 1000 ? " — Loss." : " — Break even."}
        </div>
      )}
    </div>
  );
}
