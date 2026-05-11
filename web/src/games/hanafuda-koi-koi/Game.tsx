import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HanafudaKoiKoiState, HanafudaKoiKoiAction, HanafudaKoiKoiSettings } from "./state.js";
import { isTerminal, cardOf, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

const CAT_COLOR: Record<string, string> = {
  hikari: "#ffd166", tane: "#ef476f", tan: "#06d6a0", kasu: "#a8b3c5",
};

function CardChip({ id, onClick, highlighted, selected }: { id: number; onClick?: () => void; highlighted?: boolean; selected?: boolean }) {
  const c = cardOf(id);
  return (
    <button
      className={`hkk-card ${selected ? "hkk-sel" : ""} ${highlighted ? "hkk-hi" : ""}`}
      style={{ borderColor: CAT_COLOR[c.category] }}
      onClick={onClick}
      disabled={!onClick}
    >
      <span className="hkk-month">{c.month}</span>
      <span className="hkk-name">{c.name}</span>
    </button>
  );
}

export function HanafudaKoiKoiGame({ state, dispatch, onGameOver }: GameProps<HanafudaKoiKoiState, HanafudaKoiKoiSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  return (
    <div className="hkk-wrap">
      <div className="hkk-header">
        <span>Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="hkk-you">You {state.score}</span>
        <span className="hkk-cpu">CPU {state.cpuScore}</span>
      </div>

      <div className="hkk-section">
        <div className="hkk-label">CPU Captures ({state.cpuCaptured.length})</div>
        <div className="hkk-row hkk-mini">{state.cpuCaptured.map(id => <CardChip key={id} id={id} />)}</div>
      </div>

      <div className="hkk-section">
        <div className="hkk-label">Field</div>
        <div className="hkk-row">
          {state.field.map(id => {
            const isMatch = state.phase === "select" && state.matches.includes(id);
            const isDrawnMatch = state.phase === "drawn" && state.drawnMatches.includes(id);
            const onClick = isMatch
              ? () => dispatch({ type: "matchHand", fieldId: id } as HanafudaKoiKoiAction)
              : isDrawnMatch
              ? () => dispatch({ type: "matchDraw", fieldId: id } as HanafudaKoiKoiAction)
              : undefined;
            return (
              <CardChip
                key={id}
                id={id}
                highlighted={isMatch || isDrawnMatch}
                {...(onClick ? { onClick } : {})}
              />
            );
          })}
        </div>
      </div>

      {state.phase === "drawn" && state.drawnCard !== null && (
        <div className="hkk-drawn">
          <div className="hkk-label">Drew:</div>
          <CardChip id={state.drawnCard} />
          {state.drawnMatches.length === 0 && (
            <button className="hkk-btn" onClick={() => dispatch({ type: "discardDraw" } as HanafudaKoiKoiAction)}>Discard</button>
          )}
        </div>
      )}

      <div className="hkk-section">
        <div className="hkk-label">Your Hand</div>
        <div className="hkk-row">
          {state.hand.map(id => {
            const onClick = state.phase === "select"
              ? () => dispatch({ type: "select", cardId: id } as HanafudaKoiKoiAction)
              : undefined;
            return (
              <CardChip
                key={id}
                id={id}
                selected={state.selected === id}
                {...(onClick ? { onClick } : {})}
              />
            );
          })}
        </div>
        {state.phase === "select" && state.selected !== null && state.matches.length === 0 && (
          <button className="hkk-btn" onClick={() => dispatch({ type: "discardHand" } as HanafudaKoiKoiAction)}>Discard to Field</button>
        )}
      </div>

      <div className="hkk-section">
        <div className="hkk-label">You Captured ({state.captured.length})</div>
        <div className="hkk-row hkk-mini">{state.captured.map(id => <CardChip key={id} id={id} />)}</div>
      </div>

      <div className="hkk-log">{state.log}</div>

      {state.phase === "result" && (
        <button className="hkk-btn primary" data-testid="hint-target-hanafuda-koi-koi-next" onClick={() => dispatch({ type: "next" } as HanafudaKoiKoiAction)}>Next Round</button>
      )}

      {state.phase === "done" && (
        <div className="hkk-done">
          <h3>Game Over</h3>
          <div className="hkk-final">You: {state.score} CPU: {state.cpuScore}</div>
          <div>{state.score > state.cpuScore ? "You won!" : state.score < state.cpuScore ? "CPU won." : "Draw."}</div>
        </div>
      )}
    </div>
  );
}
