import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardShovelState, CardShovelAction, CardShovelSettings, Suit, CardShovelCard } from "./state.js";
import { isTerminal, SUITS, TOTAL_CARDS } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit as EngineSuit, Rank } from "../../engines/deck/index.js";
import "./Game.css";
const SUIT_GLYPH: Record<Suit, EngineSuit> = { S:"♠", H:"♥", D:"♦", C:"♣" };
const SUIT_NAME: Record<Suit, string> = { S:"Spades", H:"Hearts", D:"Diamonds", C:"Clubs" };
function toEngineCard(c: CardShovelCard): EngineCard {
  return { suit: SUIT_GLYPH[c.suit], rank: c.rank as Rank, id: `cs-${c.id}` };
}
export function CardShovelGame({ state, dispatch, onGameOver }: GameProps<CardShovelState, CardShovelSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cs-wrap"><div className="cs-done"><h2>Done!</h2><div>Errors: {state.errors} / {TOTAL_CARDS}</div><div className="cs-final">{t?.score} pts</div></div></div>;
  }
  const c = state.current!;
  return (
    <div className="cs-wrap">
      <div className="cs-header"><span>Card {state.played + 1} / {TOTAL_CARDS}</span><span className="cs-score">{state.score}</span></div>
      <Card card={toEngineCard(c)} className="cs-card" />
      <div className="cs-buckets">
        {SUITS.map(s => (
          <button data-testid="hint-target-card-shovel-primary" key={s} className={`cs-bucket${(s === "H" || s === "D") ? " red" : ""}`} onClick={() => dispatch({ type:"place", suit: s } as CardShovelAction)}>
            <div className="cs-bucket-glyph">{SUIT_GLYPH[s]}</div>
            <div className="cs-bucket-name">{SUIT_NAME[s]}</div>
            <div className="cs-bucket-count">{state.buckets[s]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
