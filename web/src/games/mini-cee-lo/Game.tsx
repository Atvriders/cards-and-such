import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniCeeLoState, MiniCeeLoAction, MiniCeeLoSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, ROUND_TARGET, describeOutcome } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Game.css";

export function MiniCeeLoGame({ state, dispatch, onGameOver }: GameProps<MiniCeeLoState, MiniCeeLoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    const wonSeries = state.playerWins > state.cpuWins;
    return (
      <div className="ceelo-wrap ceelo-theme">
        <div className={`ceelo-done ${wonSeries ? "win" : "lose"}`}>
          <h2>{wonSeries ? "You Win the Series!" : "CPU Wins the Series"}</h2>
          <div className="ceelo-final">
            <span>{state.playerWins}</span>
            <span className="ceelo-final-sep">—</span>
            <span>{state.cpuWins}</span>
          </div>
          <div className="ceelo-final-label">final tally</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ceelo-wrap ceelo-theme">
      <header className="ceelo-header">
        <div className="ceelo-round">
          <span className="ceelo-round-label">Round</span>
          <span className="ceelo-round-value">{state.round}/{TOTAL_ROUNDS}</span>
        </div>
        <div className="ceelo-target">First to {ROUND_TARGET}</div>
        <div className="ceelo-tally">
          <span className="ceelo-tally-side">YOU <b>{state.playerWins}</b></span>
          <span className="ceelo-tally-vs">vs</span>
          <span className="ceelo-tally-side">CPU <b>{state.cpuWins}</b></span>
        </div>
      </header>

      <div className="ceelo-arena">
        <div className={`ceelo-side ${state.roundResult === "player" ? "winner" : state.roundResult === "cpu" ? "loser" : ""}`}>
          <h3>You</h3>
          <div className="ceelo-dice">
            {state.playerDice
              ? state.playerDice.map((v, i) => <Die key={i} value={v} />)
              : <DiePlaceholder count={3} />}
          </div>
          {state.playerOutcome && (
            <div className="ceelo-outcome">{describeOutcome(state.playerOutcome)}</div>
          )}
        </div>

        <div className="ceelo-vs-banner">VS</div>

        <div className={`ceelo-side ${state.roundResult === "cpu" ? "winner" : state.roundResult === "player" ? "loser" : ""}`}>
          <h3>CPU</h3>
          <div className="ceelo-dice">
            {state.cpuDice
              ? state.cpuDice.map((v, i) => <Die key={i} value={v} />)
              : <DiePlaceholder count={3} />}
          </div>
          {state.cpuOutcome && (
            <div className="ceelo-outcome">{describeOutcome(state.cpuOutcome)}</div>
          )}
        </div>
      </div>

      {state.roundResult && (
        <div className={`ceelo-result ceelo-result-${state.roundResult}`}>
          {state.roundResult === "player" && "Round goes to YOU"}
          {state.roundResult === "cpu" && "Round goes to CPU"}
          {state.roundResult === "tie" && "Tie — re-roll!"}
        </div>
      )}

      <div className="ceelo-controls">
        {state.phase === "ready" && (
          <button className="ceelo-btn" onClick={() => dispatch({ type: "roll" } as MiniCeeLoAction)}>
            Roll!
          </button>
        )}
        {state.phase === "rolled" && (
          <button className="ceelo-btn" onClick={() => dispatch({ type: "next" } as MiniCeeLoAction)}>
            {state.roundResult === "tie" ? "Re-roll" : "Next round"}
          </button>
        )}
      </div>

      <footer className="ceelo-help">
        <span>4-5-6 = auto-win</span>
        <span>Triple beats Pair+Point</span>
        <span>1-2-3 = auto-loss</span>
      </footer>
    </div>
  );
}

function DiePlaceholder({ count }: { count: number }): JSX.Element {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ceelo-die-placeholder" aria-hidden="true">?</div>
      ))}
    </>
  );
}
