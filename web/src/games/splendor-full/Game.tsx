import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  SplendorFullState,
  Action,
  SplendorFullSettings,
  Color,
  DevCard,
} from "./state.js";
import {
  isTerminal,
  COLORS,
  affordCost,
  permanentGems,
  TIER_FACEUP,
  WIN_PRESTIGE,
} from "./state.js";
import "./Game.css";

const COLOR_LABEL: Record<Color, string> = {
  emerald: "Em",
  sapphire: "Sa",
  ruby: "Ru",
  diamond: "Di",
  onyx: "On",
};
const COLOR_GLYPH: Record<Color, string> = {
  emerald: "E",
  sapphire: "S",
  ruby: "R",
  diamond: "D",
  onyx: "O",
};

export function SplendorFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<SplendorFullState, SplendorFullSettings>): JSX.Element {
  const endedRef = useRef(false);
  const [picking, setPicking] = useState<Color[]>([]);

  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Auto-advance CPU turns with a small delay so the user can see the action
  useEffect(() => {
    if (state.phase === "done") return;
    if (!state.players[state.current]?.isCPU) return;
    const id = window.setTimeout(() => {
      dispatch({ type: "cpuStep" } as Action);
    }, 600);
    return () => window.clearTimeout(id);
  }, [state, dispatch]);

  const you = state.players[0]!;
  const yourTurn = state.current === 0 && state.phase === "playing";
  const perm = permanentGems(you);

  function togglePick(c: Color) {
    if (!yourTurn) return;
    if (state.bank[c] <= 0) return;
    setPicking((cur) => {
      if (cur.includes(c)) return cur.filter((x) => x !== c);
      if (cur.length >= 3) return cur;
      return [...cur, c];
    });
  }

  function commitTake3() {
    if (!yourTurn) return;
    if (picking.length === 0) return;
    // Must be distinct (already enforced by toggle)
    dispatch({ type: "take3", colors: picking } as Action);
    setPicking([]);
  }

  function take2(c: Color) {
    if (!yourTurn) return;
    if (state.bank[c] < 4) return;
    dispatch({ type: "take2", color: c } as Action);
    setPicking([]);
  }

  function reserveCard(tier: 0 | 1 | 2, slot: number) {
    if (!yourTurn) return;
    if (you.reserved.length >= 3) return;
    dispatch({ type: "reserve", tier, slot } as Action);
  }

  function buyCard(tier: 0 | 1 | 2, slot: number) {
    if (!yourTurn) return;
    dispatch({ type: "buyFaceup", tier, slot } as Action);
  }

  function buyReserved(idx: number) {
    if (!yourTurn) return;
    dispatch({ type: "buyReserved", idx } as Action);
  }

  return (
    <div className="spf-wrap fade-in">
      <h3 className="spf-title">Splendor (Full)</h3>
      <div className="spf-info">
        <div className="spf-info-cell">
          <span>Round</span>
          <b>{state.round}</b>
        </div>
        <div className="spf-info-cell">
          <span>Turn</span>
          <b>{state.players[state.current]?.name}</b>
        </div>
        <div className="spf-info-cell">
          <span>Target</span>
          <b>{WIN_PRESTIGE} PP</b>
        </div>
      </div>

      {/* Bank */}
      <div className="spf-bank">
        <div className="spf-section-label">Bank</div>
        <div className="spf-bank-row">
          {COLORS.map((c) => (
            <button
              key={c}
              className={
                "spf-bank-token spf-c-" + c + (picking.includes(c) ? " spf-picked" : "")
              }
              onClick={() => togglePick(c)}
              disabled={!yourTurn || state.bank[c] <= 0}
              title={`Take 1 ${c} (combine up to 3 different colors)`}
              data-testid={"splendor-full-bank-" + c}
            >
              <span className="spf-token-glyph">{COLOR_GLYPH[c]}</span>
              <span className="spf-token-count">{state.bank[c]}</span>
            </button>
          ))}
          <div className="spf-bank-token spf-c-gold" title="Wildcard (gold) tokens">
            <span className="spf-token-glyph">G</span>
            <span className="spf-token-count">{state.bank.gold}</span>
          </div>
        </div>
        <div className="spf-bank-actions">
          <button
            className="spf-action-btn"
            onClick={commitTake3}
            disabled={!yourTurn || picking.length === 0}
            title="Take the selected (up to 3 different-color) tokens"
            data-testid="splendor-full-take3"
          >
            Take {picking.length || "—"} tokens
          </button>
          <span className="spf-action-or">or click "+2" to take 2 of one color (needs ≥4 left)</span>
          {COLORS.map((c) => (
            <button
              key={c}
              className={"spf-take2-btn spf-c-" + c}
              onClick={() => take2(c)}
              disabled={!yourTurn || state.bank[c] < 4}
              title={`Take 2 ${c} tokens (requires at least 4 available)`}
              data-testid={"splendor-full-take2-" + c}
            >
              +2 {COLOR_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Nobles */}
      <div className="spf-nobles">
        <div className="spf-section-label">Nobles ({state.nobles.length} left)</div>
        <div className="spf-noble-row">
          {state.nobles.map((n) => (
            <div key={n.id} className="spf-noble" title={`Visits when you have the required permanent gems (+${n.prestige} prestige).`}>
              <div className="spf-noble-prestige">+{n.prestige}</div>
              <div className="spf-noble-req">
                {COLORS.filter((c) => n.requirement[c] > 0).map((c) => (
                  <span key={c} className={"spf-req spf-c-" + c}>
                    {n.requirement[c]}{COLOR_GLYPH[c]}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {state.nobles.length === 0 && <div className="spf-empty">All nobles claimed.</div>}
        </div>
      </div>

      {/* Tier rows */}
      <div className="spf-tiers">
        {([2, 1, 0] as const).map((tier) => (
          <div key={tier} className={"spf-tier spf-tier-" + tier}>
            <div className="spf-tier-label">
              Tier {tier + 1}{" "}
              <span className="spf-tier-deck">({state.decks[tier]!.length} in deck)</span>
            </div>
            <div className="spf-tier-row">
              {Array.from({ length: TIER_FACEUP }).map((_, slot) => {
                const card = state.rows[tier]![slot];
                if (!card) return <div key={slot} className="spf-card spf-card-empty">empty</div>;
                const aff = affordCost(you, card);
                const canBuy = yourTurn && aff >= 0;
                const canReserve = yourTurn && you.reserved.length < 3;
                return (
                  <CardView
                    key={card.id}
                    card={card}
                    canBuy={canBuy}
                    canReserve={canReserve}
                    onBuy={() => buyCard(tier, slot)}
                    onReserve={() => reserveCard(tier, slot)}
                    testId={`splendor-full-buy-${tier}-${slot}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Your area */}
      <div className="spf-you">
        <div className="spf-section-label">Your tableau</div>
        <div className="spf-you-summary">
          {COLORS.map((c) => (
            <span key={c} className={"spf-perm spf-c-" + c} title={`Permanent ${c} gems`}>
              {COLOR_GLYPH[c]}: {perm[c]}
            </span>
          ))}
          <span className="spf-perm spf-prestige" title="Your prestige points">
            PP: {you.prestige}
          </span>
        </div>
        <div className="spf-you-tokens">
          {COLORS.map((c) => (
            <span key={c} className={"spf-tok spf-c-" + c}>
              {COLOR_GLYPH[c]}:{you.tokens[c]}
            </span>
          ))}
          <span className="spf-tok spf-c-gold">G:{you.tokens.gold}</span>
        </div>
        {you.reserved.length > 0 && (
          <>
            <div className="spf-section-sub">Reserved ({you.reserved.length}/3)</div>
            <div className="spf-reserved-row">
              {you.reserved.map((card, i) => {
                const aff = affordCost(you, card);
                const canBuy = yourTurn && aff >= 0;
                return (
                  <CardView
                    key={card.id}
                    card={card}
                    canBuy={canBuy}
                    canReserve={false}
                    onBuy={() => buyReserved(i)}
                    onReserve={() => undefined}
                    testId={`splendor-full-buy-reserved-${i}`}
                    reserved
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Opponents */}
      <div className="spf-opponents">
        <div className="spf-section-label">Opponents</div>
        <div className="spf-opp-row">
          {state.players.slice(1).map((p) => {
            const opPerm = permanentGems(p);
            return (
              <div key={p.seat} className={"spf-opp " + (state.current === p.seat ? "spf-opp-turn" : "")}>
                <div className="spf-opp-name">{p.name}</div>
                <div className="spf-opp-prestige">{p.prestige} PP</div>
                <div className="spf-opp-perms">
                  {COLORS.map((c) => (
                    <span key={c} className={"spf-opp-perm spf-c-" + c}>
                      {COLOR_GLYPH[c]}:{opPerm[c]}
                    </span>
                  ))}
                </div>
                <div className="spf-opp-reserved">Reserved: {p.reserved.length}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden CPU-step trigger for hint */}
      <button
        className="spf-hidden"
        data-testid="splendor-full-cpu-step"
        onClick={() => dispatch({ type: "cpuStep" } as Action)}
        title="Advance CPU turn"
        aria-label="Advance CPU turn"
      >
        CPU
      </button>

      {state.phase === "done" && (
        <div className="spf-done bounce-in">
          <h3>{state.winner === 0 ? "Victory!" : `${state.players[state.winner ?? 0]!.name} wins`}</h3>
          <div className="spf-final">
            {state.players
              .map((p) => `${p.name}: ${p.prestige} PP, ${p.bought.length} cards`)
              .join(" · ")}
          </div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="spf-log">
          {state.log.slice(-6).map((m, i) => (
            <div key={i} className="spf-log-line">{m}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function CardView({
  card,
  canBuy,
  canReserve,
  onBuy,
  onReserve,
  testId,
  reserved,
}: {
  card: DevCard;
  canBuy: boolean;
  canReserve: boolean;
  onBuy: () => void;
  onReserve: () => void;
  testId: string;
  reserved?: boolean;
}): JSX.Element {
  return (
    <div className={"spf-card spf-c-" + card.color}>
      <div className="spf-card-top">
        <span className="spf-card-prestige">{card.prestige > 0 ? card.prestige : ""}</span>
        <span className="spf-card-color">{COLOR_GLYPH[card.color]}</span>
      </div>
      <div className="spf-card-cost">
        {COLORS.filter((c) => card.cost[c] > 0).map((c) => (
          <span key={c} className={"spf-cost-pip spf-c-" + c}>
            {card.cost[c]}
            {COLOR_GLYPH[c]}
          </span>
        ))}
      </div>
      <div className="spf-card-actions">
        <button
          className="spf-card-buy"
          onClick={onBuy}
          disabled={!canBuy}
          title="Buy this card with tokens + permanent gems"
          data-testid={testId}
        >
          Buy
        </button>
        {!reserved && (
          <button
            className="spf-card-reserve"
            onClick={onReserve}
            disabled={!canReserve}
            title="Reserve this card (gain 1 gold token; max 3 reserved)"
            data-testid={"reserve-" + testId}
          >
            Reserve
          </button>
        )}
      </div>
    </div>
  );
}
