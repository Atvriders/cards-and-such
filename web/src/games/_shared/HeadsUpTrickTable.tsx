import { useEffect } from "react";
import type { HuTrickState, HuTrickAction } from "./heads-up-trick.js";
import { Card } from "../../engines/deck/Card.js";
import { legalPlays } from "./trick-engine.js";

export interface HuTrickTableProps {
  state: HuTrickState;
  dispatch: (a: HuTrickAction) => void;
  onGameOver: (score: number) => void;
  isTerminal: (s: HuTrickState) => { score: number } | null;
  prefix: string; // unique CSS class prefix
  title?: string;
}

export function HeadsUpTrickTable({ state, dispatch, onGameOver, isTerminal, prefix, title }: HuTrickTableProps): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const legalIds = new Set((state.phase === "playing" && state.turn === 0)
    ? legalPlays(state.hands[0]!, state.trick).map(c => c.id) : []);

  return (
    <div className={`${prefix}-wrap`}>
      {title && <div className={`${prefix}-title`}>{title}</div>}
      <div className={`${prefix}-header`}>
        <span>You: {state.score[0]} pts ({state.tricksWon[0]} tricks)</span>
        <span>CPU: {state.score[1]} pts ({state.tricksWon[1]} tricks)</span>
        {state.trump && <span>Trump: {state.trump}</span>}
        {state.stock.length > 0 && <span>Stock: {state.stock.length}</span>}
      </div>
      <div className={`${prefix}-cpu`}>
        <div className={`${prefix}-label`}>CPU ({state.hands[1]!.length} cards)</div>
        <div className={`${prefix}-back-row`}>
          {state.hands[1]!.map((_, i) => <div key={i} className={`${prefix}-back`} />)}
        </div>
      </div>
      <div className={`${prefix}-trick`}>
        <div className={`${prefix}-label`}>Trick</div>
        <div className={`${prefix}-trick-row`}>
          {state.trick.length === 0
            ? <span className={`${prefix}-empty`}>—</span>
            : state.trick.map(({ seat, card }) => (
              <div key={card.id} className={`${prefix}-trick-slot`}>
                <div className={`${prefix}-slot-label`}>{seat === 0 ? "You" : "CPU"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className={`${prefix}-status`}>{state.message}</div>
      <div className={`${prefix}-player`}>
        <div className={`${prefix}-label`}>Your Hand</div>
        <div className={`${prefix}-hand`}>
          {state.hands[0]!.map(card => {
            const legal = legalIds.has(card.id);
            return (
              <div key={card.id} data-testid={`hint-target-${prefix}-${card.id}`}>
                {legal
                  ? <Card card={card} onClick={() => dispatch({ type: "play", cardId: card.id })} />
                  : <Card card={card} className={`${prefix}-dim`} />}
              </div>
            );
          })}
        </div>
      </div>
      {state.phase === "done" && (
        <div className={`${prefix}-result`}>
          <h2>Hand Complete</h2>
          <div>{state.message}</div>
        </div>
      )}
    </div>
  );
}
