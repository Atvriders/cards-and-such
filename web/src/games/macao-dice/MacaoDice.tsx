import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MacaoDiceState, MacaoDiceAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./MacaoDice.css";

type MacaoSettings = MacaoDiceState["settings"];

function dieFace(val: number): string {
  return ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][val] ?? "?";
}

export function MacaoDice({
  state,
  dispatch,
  onGameOver,
}: GameProps<MacaoDiceState, MacaoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { chips, bet, round, totalRounds, playerDie, dealerDie, phase, lastResult } = state;

  const betOptions = [1, 2, 5, Math.min(10, chips)].filter((v, i, a) => a.indexOf(v) === i && v <= chips && v > 0);

  return (
    <div className="macao">
      <div className="macao-header">
        <span>Round {round}/{totalRounds}</span>
        <span>Chips: <strong>{chips}</strong></span>
      </div>

      {phase === "betting" && (
        <div className="macao-bet-section">
          <div className="macao-label">Your bet: <strong>{bet}</strong></div>
          <div className="macao-bet-btns">
            {betOptions.map((v) => (
              <button data-testid="hint-target-macao-dice-setBet"
                key={v}
                className={`macao-bet-btn ${bet === v ? "active" : ""}`}
                onClick={() => dispatch({ type: "setBet", amount: v } as MacaoDiceAction)}
              >
                {v}
              </button>
            ))}
            <input
              type="range"
              min={1}
              max={chips}
              value={bet}
              onChange={(e) => dispatch({ type: "setBet", amount: Number(e.target.value) } as MacaoDiceAction)}
              className="macao-slider"
            />
          </div>
          <button data-testid="hint-target-macao-dice-roll" className="macao-roll-btn" onClick={() => dispatch({ type: "roll" } as MacaoDiceAction)}>
            Roll!
          </button>
        </div>
      )}

      {(phase === "rolled" || phase === "roundOver" || phase === "tieBreak") && playerDie > 0 && (
        <div className="macao-reveal">
          <div className="macao-die-wrap">
            <div className="macao-die-label">You</div>
            <span className="macao-die">{dieFace(playerDie)}</span>
          </div>
          <div className="macao-vs">vs</div>
          <div className="macao-die-wrap">
            <div className="macao-die-label">Dealer</div>
            <span className="macao-die">{dieFace(dealerDie)}</span>
          </div>
        </div>
      )}

      {lastResult && (
        <div className={`macao-result ${lastResult.includes("win") || lastResult.includes("MACAO") ? "win" : lastResult.includes("Dealer") ? "lose" : "tie"}`}>
          {lastResult}
        </div>
      )}

      <div className="macao-controls">
        {phase === "tieBreak" && (
          <button data-testid="hint-target-macao-dice-roll" className="macao-roll-btn" onClick={() => dispatch({ type: "roll" } as MacaoDiceAction)}>
            Roll Tie-Break
          </button>
        )}
        {phase === "roundOver" && (
          <button data-testid="hint-target-macao-dice-nextRound" className="macao-roll-btn" onClick={() => dispatch({ type: "nextRound" } as MacaoDiceAction)}>
            Next Round
          </button>
        )}
      </div>

      {phase === "done" && (
        <div className={`macao-gameover ${chips > Number(state.settings.startChips) ? "win" : "lose"}`}>
          Game over! Final chips: <strong>{chips}</strong>
          {chips > Number(state.settings.startChips) ? " — You're up!" : " — You're down."}
        </div>
      )}
    </div>
  );
}
