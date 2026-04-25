import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSoccerState, DiceSoccerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DiceSoccer({ state, dispatch, onGameOver }: GameProps<DiceSoccerState, DiceSoccerSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isOver = state.phase === "gameOver";
  const yourTurn = state.possession === "player" && !isOver;
  const ballPct = `${state.ballPosition * 10}%`;

  return (
    <div className="dice-soccer">
      <div className="ds-scoreboard">
        <span>You: {state.playerScore}</span>
        <span>H{Math.min(state.half, state.totalHalves)}/{state.totalHalves}</span>
        <span>AI: {state.aiScore}</span>
      </div>

      <div className="ds-pitch">
        <div className="ds-ball" style={{ left: ballPct }}>⚽</div>
        <div className="ds-goal ds-goal-left">AI Goal</div>
        <div className="ds-goal ds-goal-right">Your Goal</div>
      </div>

      <div className="ds-possession">
        {state.possession === "player" ? "Your ball" : "AI ball"} — Position: {state.ballPosition}/10
      </div>

      <div className="ds-last-play">{state.lastPlay}</div>

      {state.lastDice.length > 0 && (
        <div className="ds-dice">
          {state.lastDice.map((d, i) => <span key={i}>{DICE_FACES[d] ?? d}</span>)}
        </div>
      )}

      {!isOver && (
        <div className="ds-controls">
          {yourTurn ? (
            <>
              <button onClick={() => dispatch({ type: "play", move: "dribble" })}>Dribble</button>
              <button onClick={() => dispatch({ type: "play", move: "shoot" })} disabled={state.ballPosition < 6}>
                Shoot {state.ballPosition < 6 ? "(too far)" : ""}
              </button>
              <button onClick={() => dispatch({ type: "play", move: "defend" })}>Defend</button>
            </>
          ) : (
            <button onClick={() => dispatch({ type: "play", move: "defend" })}>Defend / Intercept</button>
          )}
        </div>
      )}

      {isOver && (
        <div className="ds-result">
          {state.playerScore > state.aiScore ? "You win!" :
           state.playerScore < state.aiScore ? "AI wins!" : "Draw!"}
        </div>
      )}

      <button className="ds-restart" onClick={() => dispatch({ type: "restart" })}>New Match</button>
    </div>
  );
}
