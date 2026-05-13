import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CasinoWarMultiState, CasinoWarMultiSettings, WarHand } from "./state.js";
import { isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard } from "../../engines/deck/index.js";
import "./Game.css";

function MiniCard({ card, back }: { card: EngineCard | null; back?: boolean }) {
  if (!card || back) return <Card faceDown className="cwm-card back" />;
  return <Card card={card} className="cwm-card" />;
}

function HandDisplay({ hand, index }: { hand: WarHand; index: number }) {
  const stateLabel: Record<WarHand["state"], string> = {
    pending: "", won: "WIN", lost: "LOSE", tie: "TIE!",
    "war-won": "WAR WIN", "war-lost": "WAR LOSE", surrender: "SURRENDER",
  };
  return (
    <div className={`cwm-hand ${hand.state}`}>
      <div style={{ fontSize: "0.8rem", fontWeight: "bold" }}>Hand {index + 1}</div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <MiniCard card={hand.playerCard} />
        <span className="cwm-vs">vs</span>
        <MiniCard card={hand.dealerCard} />
      </div>
      {hand.playerFinal && (
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <MiniCard card={hand.playerFinal} />
          <span className="cwm-vs">vs</span>
          <MiniCard card={hand.dealerFinal} />
        </div>
      )}
      <div className={`cwm-status`}>{stateLabel[hand.state]}</div>
    </div>
  );
}

export function CasinoWarMulti({ state, dispatch, onGameOver }: GameProps<CasinoWarMultiState, CasinoWarMultiSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { phase, bankroll, handsPlayed, settings, hands, tieHandIndexes, lastResult } = state;
  const ante = parseInt(settings.antePerHand, 10);
  const numHands = parseInt(settings.numHands, 10);

  return (
    <div className="cwm-root">
      <div className="cwm-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Round: {handsPlayed + (phase !== "betting" && phase !== "settled" ? 1 : 0)} / {settings.handsPerSession}</span>
        <span>{numHands} hands @ ${ante}/hand</span>
      </div>

      {hands.length > 0 && (
        <div className="cwm-hands">
          {hands.map((h, i) => <HandDisplay key={i} hand={h} index={i} />)}
        </div>
      )}

      {lastResult && <div className="cwm-result">{lastResult}</div>}

      <div className="cwm-actions">
        {(phase === "betting" || phase === "settled") && !terminal && (
          <button data-testid="hint-target-casino-war-multi-deal" className="deal" onClick={() => dispatch({ type: "deal" })}>
            Deal ({numHands} hands, ${ante * numHands} total)
          </button>
        )}
        {phase === "tie-decision" && (
          <>
            <button data-testid="hint-target-casino-war-multi-war" className="war" onClick={() => dispatch({ type: "go-to-war" })}>
              Go to War ({tieHandIndexes.length} tie{tieHandIndexes.length > 1 ? "s" : ""})
            </button>
            <button className="surr" onClick={() => dispatch({ type: "surrender-all" })}>
              Surrender Ties
            </button>
          </>
        )}
        {terminal && <div className="cwm-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>
    </div>
  );
}
