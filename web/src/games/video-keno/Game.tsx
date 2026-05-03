import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { VideoKenoState, VideoKenoAction, VideoKenoSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function VideoKenoGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<VideoKenoState, VideoKenoSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, bankroll, roundsPlayed, settings, playerPicks, drawnNumbers, lastResult } = state;
  const pickCount = parseInt(settings.pickCount, 10);
  const needMore = playerPicks.length < pickCount;

  function dis(a: VideoKenoAction) { dispatch(a); }

  function numClass(n: number): string {
    const isPicked = playerPicks.includes(n);
    const isDrawn = drawnNumbers.includes(n);
    if (isPicked && isDrawn) return "keno-num match";
    if (isPicked) return "keno-num picked";
    if (isDrawn) return "keno-num drawn";
    return "keno-num";
  }

  return (
    <div className="keno">
      <div className="keno-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Round: {roundsPlayed + (phase === "picking" ? 1 : 0)}/{settings.roundsPerSession}</span>
        <span>Bet: ${settings.bet}</span>
      </div>

      {phase === "picking" && (
        <div className="keno-instruction">
          Pick {pickCount} numbers ({playerPicks.length}/{pickCount} chosen)
        </div>
      )}

      {lastResult && <div className="keno-result">{lastResult}</div>}

      <div className="keno-grid">
        {Array.from({ length: 80 }, (_, i) => i + 1).map(n => (
          <div
            key={n}
            className={numClass(n)}
            onClick={() => phase === "picking" ? dis({ type: "toggle-pick", number: n }) : undefined}
          >
            {n}
          </div>
        ))}
      </div>

      <div className="keno-actions">
        {phase === "picking" && (
          <button data-testid="hint-target-video-keno-primary" onClick={() => dis({ type: "draw" })} disabled={needMore}>
            {needMore ? `Pick ${pickCount - playerPicks.length} more` : "Draw!"}
          </button>
        )}
        {phase === "settled" && !terminal && (
          <button onClick={() => dis({ type: "play-again" })}>Play Again</button>
        )}
        {terminal && <div className="keno-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>
    </div>
  );
}
