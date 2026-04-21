import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrapsState, CrapsSettings, CrapsAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Craps.css";

const DIE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function Craps({
  state,
  dispatch,
  onGameOver,
}: GameProps<CrapsState, CrapsSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, bankroll, roundsPlayed, settings, point, lastRoll, lastResult } = state;
  const maxRounds = parseInt(settings.rounds, 10);
  const betSize = parseInt(settings.betSize, 10);

  function dis(a: CrapsAction) { dispatch(a); }

  const canRoll = !terminal && bankroll >= betSize && (
    phase === "come-out" || phase === "point" || phase === "settled"
  );

  const rollLabel = phase === "point"
    ? `Roll (Point: ${point})`
    : phase === "settled"
    ? "New Round (Roll Come-Out)"
    : "Roll Come-Out";

  return (
    <div className="craps">
      <div className="craps-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Round: {roundsPlayed} / {maxRounds}</span>
        <span>Pass Line Bet: ${betSize}</span>
      </div>

      {lastResult && <div className="craps-result">{lastResult}</div>}

      <div className="craps-dice">
        {lastRoll ? (
          <>
            <div className="craps-die">
              <span className="die-pip">{DIE_FACES[lastRoll[0]] ?? lastRoll[0]}</span>
            </div>
            <div className="craps-die">
              <span className="die-pip">{DIE_FACES[lastRoll[1]] ?? lastRoll[1]}</span>
            </div>
            <div className="craps-total">= {lastRoll[0] + lastRoll[1]}</div>
          </>
        ) : (
          <>
            <div className="craps-die"><span className="die-pip">⚄</span></div>
            <div className="craps-die"><span className="die-pip">⚄</span></div>
          </>
        )}
      </div>

      {phase === "point" && point !== null && (
        <div className="craps-point-info">
          Point: {point} — Roll {point} to win, 7 to lose
        </div>
      )}

      {!terminal && (
        <div className="craps-bet-info">
          Pass Line Bet: ${betSize} per round
        </div>
      )}

      <div className="craps-actions">
        {!terminal && (
          <button onClick={() => dis({ type: "roll" })} disabled={!canRoll}>
            {rollLabel}
          </button>
        )}
        {terminal && (
          <div className="craps-game-over">
            Game Over — Final Bankroll: ${terminal.score}
          </div>
        )}
      </div>
    </div>
  );
}
