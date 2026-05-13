import { useEffect, useCallback, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CastleState, CastleAction, CastleSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./CastleDefender.css";

const TICK_MS = 80;

export function CastleDefender({
  state,
  dispatch,
  onGameOver,
}: GameProps<CastleState, CastleSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);
  const tick = useCallback(() => {
    dispatch({ type: "tick" } as CastleAction);
  }, [dispatch]);

  useEffect(() => {
    if (state.over) return;
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [state.over, tick]);

  const terminal = isTerminal(state);
  const archerCost = 30 + state.archerCount * 20;
  const waveComplete = state.enemiesSpawned >= state.enemiesThisWave && state.enemies.length === 0;
  const castleHpPct = (state.castleHP / state.maxCastleHP) * 100;

  return (
    <div className="castle-game">
      <div className="castle-title">Castle Defender</div>

      <div className="castle-status">
        <span>Wave {state.wave}/{state.maxWaves}</span>
        <span>Gold: {state.gold}</span>
        <span>Archers: {state.archerCount}</span>
        <span>Score: {state.score}</span>
      </div>

      <div className="castle-field">
        <div className="castle-hp-bar-bg">
          <div className="castle-hp-bar" style={{ width: `${castleHpPct}%` }} />
        </div>

        {/* Enemies */}
        {state.enemies.map((e) => (
          <div
            key={e.id}
            className="castle-enemy"
            style={{ left: `${e.x * 85}%` }}
            title={`HP: ${e.hp}/${e.maxHp}`}
          >
            👹
          </div>
        ))}

        {/* Arrows */}
        {state.arrows.map((a) => {
          const target = state.enemies.find((e) => e.id === a.targetId);
          const targetX = target ? target.x * 85 : 80;
          const arrowX = 85 + (targetX - 85) * a.progress;
          return (
            <div
              key={a.id}
              className="castle-arrow"
              style={{ left: `${arrowX}%` }}
            />
          );
        })}

        <div className="castle-wall">🏰</div>
      </div>

      <div style={{ fontSize: "0.85rem", color: "#555" }}>
        Castle HP: {state.castleHP}/{state.maxCastleHP}
      </div>

      {terminal ? (
        <div className="castle-overlay">
          <h2>{state.victory ? "Victory!" : "Castle Fallen!"}</h2>
          <p>Score: {terminal.score}</p>
        </div>
      ) : (
        <div className="castle-controls">
          <button data-testid="hint-target-castle-defender-action"
            onClick={() => dispatch({ type: "buyArcher" } as CastleAction)}
            disabled={state.gold < archerCost}
          >
            Hire Archer ({archerCost}g)
          </button>
          {waveComplete && state.wave < state.maxWaves && (
            <button onClick={() => dispatch({ type: "nextWave" } as CastleAction)}>
              Next Wave
            </button>
          )}
        </div>
      )}

      <div className="castle-hint">Hire archers to defend your castle. Kill enemies to earn gold.</div>
    </div>
  );
}
