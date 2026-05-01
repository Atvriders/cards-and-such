import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTournamentState, DiceTournamentAction, DiceTournamentSettings } from "./state.js";
import { isTerminal, ROUNDS } from "./state.js";
import "./Game.css";

export function DiceTournamentGame({ state, dispatch, onGameOver }: GameProps<DiceTournamentState, DiceTournamentSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="to-wrap">
        <div className="to-done">
          <h2>{state.myWins >= state.needed && state.round >= ROUNDS ? "Tournament Champion" : "Eliminated"}</h2>
          <div className="to-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="to-wrap">
      <div className="to-banner">Match {state.round} / {ROUNDS} · Best of {state.needed * 2 - 1} · Score {state.score}</div>
      <div className="to-board">
        <div className="to-side">
          <div className="to-side-label">YOU</div>
          <div className="to-wins">{"★".repeat(state.myWins)}{"○".repeat(Math.max(0, state.needed - state.myWins))}</div>
        </div>
        <div className="to-side">
          <div className="to-side-label">RIVAL</div>
          <div className="to-wins">{"★".repeat(state.theirWins)}{"○".repeat(Math.max(0, state.needed - state.theirWins))}</div>
        </div>
      </div>
      {state.rolls && (
        <div className="to-rolls">
          <div className="to-row">
            <div className="to-die">{state.rolls.mine[0]}</div>
            <div className="to-die">{state.rolls.mine[1]}</div>
          </div>
          <div className="to-vs">vs</div>
          <div className="to-row">
            <div className="to-die opp">{state.rolls.theirs[0]}</div>
            <div className="to-die opp">{state.rolls.theirs[1]}</div>
          </div>
        </div>
      )}
      <div className="to-log">{state.log || "Roll 2d6 against your rival. First to 2 wins."}</div>
      {(state.phase === "ready" || state.phase === "result") && (
        <button className="to-btn" onClick={() => dispatch({ type: "play" } as DiceTournamentAction)}>Roll</button>
      )}
      {state.phase === "match-result" && (
        <button className="to-btn alt" onClick={() => dispatch({ type: "next" } as DiceTournamentAction)}>Continue</button>
      )}
    </div>
  );
}
