import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OmahaState, OmahaAction, OmahaSettings } from "./state.js";
import { isTerminal, bestOmahaHand } from "./state.js";
import { rankHand } from "../../engines/deck/ranking.js";
import { Card } from "../../engines/deck/Card.js";
import "./OmahaHoldem.css";

export function OmahaHoldem({
  state,
  dispatch,
  onGameOver,
}: GameProps<OmahaState, OmahaSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, bankroll, botBankroll, pot, playerHole, botHole, community,
    playerTurn, lastAction, lastResult, settings } = state;

  function dis(a: OmahaAction) { dispatch(a); }

  const parseBlinds = (b: string) => { const [, g] = b.split("/").map(Number); return g!; };
  const big = parseBlinds(settings.blinds);
  const betAmt = (phase === "turn" || phase === "river") ? big * 2 : big;
  const toCall = state.botBet - state.playerBet;

  const canCheck = playerTurn && toCall <= 0;
  const canCall = playerTurn && toCall > 0;
  const canRaise = playerTurn && bankroll >= toCall + betAmt;
  const isActive = phase !== "waiting" && phase !== "showdown";

  const playerBest = playerHole.length === 4 && community.length >= 3
    ? rankHand(bestOmahaHand(playerHole, community)).class
    : "";

  return (
    <div className="omaha-holdem">
      <div className="oh-header">
        <span>You: ${bankroll}</span>
        <span>Bot: ${botBankroll}</span>
        {isActive && <span className="oh-phase-badge">{phase}</span>}
      </div>

      {lastResult && <div className="oh-result">{lastResult}</div>}
      {lastAction && !lastResult && <div className="oh-action-log">{lastAction}</div>}

      <div className="oh-table">
        <div className="oh-side">
          <div className="oh-side-label">Bot (4 hole cards)</div>
          <div className="oh-cards">
            {botHole.map((c, i) => <Card key={c.id + i} card={c} faceDown={phase !== "showdown"} />)}
            {botHole.length === 0 && <span style={{ opacity: 0.4 }}>Waiting...</span>}
          </div>
          {phase === "showdown" && botHole.length === 4 && community.length >= 3 && (
            <div className="oh-hand-name">{rankHand(bestOmahaHand(botHole, community)).class}</div>
          )}
        </div>

        <div className="oh-community">
          <div className="oh-community-label">Community</div>
          <div className="oh-cards">
            {community.map((c, i) => <Card key={c.id + i} card={c} />)}
            {community.length === 0 && <span style={{ opacity: 0.4 }}>—</span>}
          </div>
          {community.length > 0 && <div className="oh-note">Must use exactly 2 hole + 3 community</div>}
        </div>

        <div className="oh-side">
          <div className="oh-side-label">You (4 hole cards)</div>
          <div className="oh-cards">
            {playerHole.map((c, i) => <Card key={c.id + i} card={c} />)}
            {playerHole.length === 0 && <span style={{ opacity: 0.4 }}>Waiting...</span>}
          </div>
          {playerBest && <div className="oh-hand-name">{playerBest}</div>}
        </div>
      </div>

      {isActive && <div className="oh-pot">Pot: ${pot} {toCall > 0 ? `· To call: $${toCall}` : ""}</div>}

      <div className="oh-actions">
        {(phase === "waiting" || phase === "showdown") && !terminal && (
          <button data-testid="hint-target-omaha-holdem-primary" className="btn-deal" onClick={() => dis({ type: "deal" })}>Deal Hand</button>
        )}
        {isActive && playerTurn && (
          <>
            <button className="btn-fold" onClick={() => dis({ type: "fold" })}>Fold</button>
            {canCheck && <button className="btn-check" onClick={() => dis({ type: "check" })}>Check</button>}
            {canCall && <button className="btn-call" onClick={() => dis({ type: "call" })}>Call ${toCall}</button>}
            {canRaise && (
              <button className="btn-raise" onClick={() => dis({ type: "raise" })}>
                {toCall > 0 ? `Raise $${toCall + betAmt}` : `Bet $${betAmt}`}
              </button>
            )}
          </>
        )}
        {!playerTurn && isActive && (
          <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>Bot is thinking...</div>
        )}
        {terminal && <div className="oh-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>
    </div>
  );
}
