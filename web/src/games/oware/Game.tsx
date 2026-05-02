import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OwareState, OwareSettings, OwareAction } from "./state.js";
import { isTerminal, playerPits } from "./state.js";
import "./Game.css";

export function Oware({
  state,
  dispatch,
  onGameOver,
}: GameProps<OwareState, OwareSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;
  const myPits = playerPits(0); // indices 0-5
  const botPits = playerPits(1); // indices 6-11 (bot's row)

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = `You win! ${state.scores[0]} vs ${state.scores[1]}.`; statusClass = "win"; }
  else if (state.winner === 1) { statusText = `Bot wins! ${state.scores[1]} vs ${state.scores[0]}.`; statusClass = "loss"; }
  else if (state.winner === "draw") { statusText = "Draw!"; statusClass = "draw"; }
  else if (!isMyTurn) statusText = "Bot thinking...";
  else statusText = "Your turn — click one of your pits (bottom row).";

  // Bot's row is displayed top row left-to-right as indices 11,10,9,8,7,6
  const botRowDisplay = [11, 10, 9, 8, 7, 6];

  function renderPit(idx: number, isPlayer: boolean) {
    const seeds = state.pits[idx] ?? 0;
    const canClick = isMyTurn && isPlayer && seeds > 0;
    return (
      <div
        key={idx}
        className={`oware-pit ${canClick ? "clickable" : ""} ${state.lastSowed === idx ? "last-sowed" : ""}`}
        data-testid={`oware-pit-${idx}`}
        onClick={() => { if (canClick) dispatch({ type: "sow", pit: idx } satisfies OwareAction); }}
      >
        <div className="oware-seeds">{seeds}</div>
        <div className="oware-pit-label">{isPlayer ? `P${idx + 1}` : `B${12 - idx}`}</div>
      </div>
    );
  }

  return (
    <div className="oware-game">
      <div className={`oware-status ${statusClass}`}>{statusText}</div>
      <div className="oware-scoreboard">
        <span className="oware-score-you">You: {state.scores[0]}</span>
        <span className="oware-score-bot">Bot: {state.scores[1]}</span>
      </div>
      <div className="oware-board">
        {/* Bot row (top) — indices 11 to 6 */}
        <div className="oware-row oware-row-bot">
          {botRowDisplay.map(idx => renderPit(idx, false))}
        </div>
        {/* Player row (bottom) — indices 0 to 5 */}
        <div className="oware-row oware-row-player">
          {myPits.map(idx => renderPit(idx, true))}
        </div>
      </div>
      <div className="oware-hint">
        Seeds remaining: {state.pits.reduce((a, b) => a + b, 0)} | Total scored: {state.scores[0] + state.scores[1]}
      </div>
    </div>
  );
}
