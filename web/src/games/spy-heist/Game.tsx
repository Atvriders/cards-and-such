import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpyHeistState, SpyHeistAction } from "./state.js";
import { isTerminal, STAGES, TOTAL_STAGES } from "./state.js";
import "./Game.css";

export function SpyHeist({ state, dispatch, onGameOver }: GameProps<SpyHeistState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: SpyHeistAction) => dispatch(a);

  const stageData = STAGES[state.stage - 1];
  const heatColor = state.heat >= 80 ? "#b71c1c" : state.heat >= 50 ? "#e65100" : "#2e7d32";

  return (
    <div className="sh-wrap">
      <div className="sh-header">
        <span className="sh-title">🕵️ Spy Heist</span>
        <span className="sh-stage">Stage {state.stage}/{TOTAL_STAGES}</span>
        <span className="sh-loot">Loot: {state.loot}</span>
        <span className="sh-heat" style={{ color: heatColor }}>🌡️ Heat: {state.heat}%</span>
      </div>

      <div className="sh-heat-bar">
        <div className="sh-heat-fill" style={{ width: `${state.heat}%`, background: heatColor }} />
      </div>

      {state.phase === "choose" && stageData && (
        <div className="sh-stage-block">
          <div className="sh-stage-name">📍 {stageData.name}</div>
          <div className="sh-stage-desc">{stageData.description}</div>
          <div className="sh-choices">
            {stageData.choices.map((choice, i) => (
              <button key={i} className="sh-choice" onClick={() => d({ type: "choose", choiceIndex: i })}>
                <div className="sh-choice-label">{choice.label}</div>
                <div className="sh-choice-meta">
                  <span className="sh-chance">{choice.successChance}% success</span>
                  <span className="sh-reward">+{choice.rewardOnSuccess} loot</span>
                  {choice.penaltyOnFail > 0 && <span className="sh-penalty">fail: -{choice.penaltyOnFail}</span>}
                  <span className="sh-heat-gain">🌡️+{choice.heatGain}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {state.phase === "result" && (
        <div className="sh-result">
          <div className="sh-result-text">{state.lastResult}</div>
          <button className="sh-next" onClick={() => d({ type: "advance" })}>
            {state.stage >= TOTAL_STAGES ? "Finish Heist" : "Next Stage →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="sh-done">
          <div>🎉 Heist Complete! Loot: <strong>{state.loot}</strong></div>
          <div>{state.loot >= 150 ? "🏆 Master Spy!" : state.loot >= 80 ? "👍 Successful Heist!" : "🔍 Amateur Operation"}</div>
        </div>
      )}

      {state.phase === "caught" && (
        <div className="sh-caught">
          <div>🚔 Caught! Heat maxed out.</div>
          <div>Loot seized: <strong>{state.loot}</strong></div>
          <div className="sh-last-result">{state.lastResult}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="sh-log">
          {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="sh-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
