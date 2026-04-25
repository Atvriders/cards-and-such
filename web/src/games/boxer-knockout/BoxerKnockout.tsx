import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BoxerState, BoxerAction, BoxerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./BoxerKnockout.css";

const ACTION_EMOJI: Record<string, string> = {
  idle: "🥊",
  punch: "👊",
  block: "🛡️",
  dodge: "💨",
};

const RESULT_TEXT: Record<string, string> = {
  hit: "Direct Hit!",
  miss: "Missed!",
  blocked: "Blocked!",
  counter: "Counter Attack!",
};

export function BoxerKnockout({
  state,
  dispatch,
}: GameProps<BoxerState, BoxerSettings>): JSX.Element {
  const terminal = isTerminal(state);

  const playerHpPct = (state.playerHP / 100) * 100;
  const opponentHpPct = (state.opponentHP / 100) * 100;

  if (terminal) {
    return (
      <div className="boxer-game">
        <div className="boxer-title">Boxer Knockout</div>
        <div className="boxer-overlay">
          <h2>{state.winner === "player" ? "KO! You Win!" : "You're Down!"}</h2>
          <p>Score: {state.score}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="boxer-game">
      <div className="boxer-title">Boxer Knockout</div>
      <div className="boxer-round">Round {state.round} / {state.maxRounds}</div>

      <div className="boxer-arena">
        <div className="boxer-fighter">
          <div className="boxer-fighter-name">You</div>
          <div className="boxer-hp-bar-bg">
            <div
              className="boxer-hp-bar boxer-hp-bar--player"
              style={{ width: `${playerHpPct}%` }}
            />
          </div>
          <div className="boxer-hp-text">{state.playerHP} HP</div>
        </div>

        <div className="boxer-vs">VS</div>

        <div className="boxer-fighter">
          <div className="boxer-fighter-name">Opponent</div>
          <div className="boxer-hp-bar-bg">
            <div
              className="boxer-hp-bar boxer-hp-bar--opponent"
              style={{ width: `${opponentHpPct}%` }}
            />
          </div>
          <div className="boxer-hp-text">{state.opponentHP} HP</div>
        </div>
      </div>

      <div className="boxer-action-display">
        <span>{ACTION_EMOJI[state.playerAction] ?? "🥊"}</span>
        <span>{ACTION_EMOJI[state.opponentAction] ?? "🥊"}</span>
      </div>

      <div className="boxer-result">
        {state.lastResult ? RESULT_TEXT[state.lastResult] ?? "" : " "}
      </div>

      <div className="boxer-score">Score: {state.score}</div>

      <div className="boxer-controls">
        <button onClick={() => dispatch({ type: "punch" } as BoxerAction)}>Punch</button>
        <button onClick={() => dispatch({ type: "block" } as BoxerAction)}>Block</button>
        <button onClick={() => dispatch({ type: "dodge" } as BoxerAction)}>Dodge</button>
      </div>

      <div className="boxer-hint">Choose your move each round!</div>
    </div>
  );
}
