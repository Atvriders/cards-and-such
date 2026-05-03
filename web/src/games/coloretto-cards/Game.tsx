import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ColorettoCardsState, ColorettoCardsAction, ColorettoCardsSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function ColorettoCardsGame({ state, dispatch, onGameOver }: GameProps<ColorettoCardsState, ColorettoCardsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-clr-wrap">
      <h3 className="bz-clr-title">Coloretto</h3>
      <div className="bz-clr-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Assets <b>{state.assets}</b></div>
        <div>Workers <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-clr-actions">
          <button data-testid="hint-target-coloretto-cards-primary" onClick={() => dispatch({ type: "invest" } as ColorettoCardsAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as ColorettoCardsAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as ColorettoCardsAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as ColorettoCardsAction)}>Trade Asset</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-clr-event">
          <div>{state.lastEvent}</div>
          <button data-testid="hint-target-coloretto-cards-next" onClick={() => dispatch({ type: "next" } as ColorettoCardsAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-clr-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
