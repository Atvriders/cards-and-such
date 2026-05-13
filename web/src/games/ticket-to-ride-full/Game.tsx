import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TTRState, TTRAction, TTRSettings, CardColor, PlayerId } from "./state.js";
import {
  CITIES, ROUTES, COLORS, isTerminal, canAffordRoute, scorePlayer,
} from "./state.js";
import "./Game.css";

const MAP_W = 960;
const MAP_H = 560;

const PLAYER_COLOR: Record<PlayerId, string> = { 0: "#4cd6a8", 1: "#ec5757", 2: "#5f9aff" };
const PLAYER_NAME: Record<PlayerId, string> = { 0: "You", 1: "Red CPU", 2: "Blue CPU" };

const COLOR_HEX: Record<CardColor | "gray", string> = {
  red: "#e34a4a",
  orange: "#f08a3c",
  yellow: "#f5d54a",
  green: "#54c773",
  blue: "#4477e0",
  white: "#ececec",
  pink: "#e882c3",
  black: "#2b2b30",
  gray: "#9aa1ad",
  loco: "linear-gradient(135deg,#fff,#fbd56b,#ec79b9,#4abdf0)",
};

function colorBg(c: CardColor | "gray"): string {
  if (c === "loco") return COLOR_HEX.loco;
  return COLOR_HEX[c];
}

function TrainCard({ color, count, onClick, selected, title }: {
  color: CardColor; count: number; onClick?: () => void; selected?: boolean; title?: string;
}): JSX.Element {
  return (
    <button
      type="button"
      className={`ttr-card ${selected ? "ttr-card-selected" : ""} ttr-card-${color}`}
      onClick={onClick}
      disabled={count === 0 || !onClick}
      title={title ?? `${color} cards: ${count}`}
      aria-label={`${color} train cards, ${count} in hand`}
      style={color === "loco" ? { background: COLOR_HEX.loco } : { background: COLOR_HEX[color] }}
    >
      <span className="ttr-card-label">{color === "loco" ? "LOCO" : color.toUpperCase()}</span>
      <span className="ttr-card-count">{count}</span>
    </button>
  );
}

function FaceUp({ color, onClick, disabled, idx }: {
  color: CardColor; onClick?: () => void; disabled?: boolean; idx: number;
}): JSX.Element {
  return (
    <button
      type="button"
      className={`ttr-faceup ttr-card-${color}`}
      onClick={onClick}
      disabled={disabled}
      data-testid={`ttr-faceup-${idx}`}
      title={`Take ${color === "loco" ? "locomotive" : color + " card"} from market`}
      aria-label={`Take ${color} card`}
      style={color === "loco" ? { background: COLOR_HEX.loco } : { background: COLOR_HEX[color] }}
    >
      <span className="ttr-card-label">{color === "loco" ? "LOCO" : color.toUpperCase()}</span>
    </button>
  );
}

export function TicketToRideFullGame({ state, dispatch, onGameOver }: GameProps<TTRState, TTRSettings>): JSX.Element {
  const t = isTerminal(state);
  const endedRef = useRef(false);
  useEffect(() => {
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [t, onGameOver]);

  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [chosenColor, setChosenColor] = useState<CardColor | null>(null);

  // Auto-run CPU turns
  useEffect(() => {
    if (state.phase === "play" && state.current !== 0) {
      const id = window.setTimeout(() => dispatch({ type: "cpu" } as TTRAction), 650);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [state.phase, state.current, dispatch]);

  // Reset route selection when phase changes or current player changes
  useEffect(() => {
    setSelectedRoute(null);
    setChosenColor(null);
  }, [state.current, state.phase]);

  const phaseLabel = useMemo(() => {
    if (state.phase === "done") return "Game Over";
    if (state.phase === "ticket") return "Choose Tickets";
    if (state.current !== 0) return `${PLAYER_NAME[state.current]} thinking…`;
    if (state.phase === "drawing") return "Draw 1 More";
    return "Your Turn";
  }, [state.phase, state.current]);

  const human = state.players[0]!;
  const humanScore = scorePlayer(state, 0);

  // Build map
  const cityNodes = useMemo(() => CITIES.map((c, i) => ({ ...c, idx: i })), []);

  const onCityClick = (_idx: number): void => {
    // For now, route claiming is via clicking the route itself.
  };

  const onRouteClick = (ri: number): void => {
    if (state.phase !== "play" || state.current !== 0) return;
    if (state.routeOwner[ri] !== null) return;
    setSelectedRoute(ri);
    const route = ROUTES[ri]!;
    if (route.color !== "gray") setChosenColor(route.color);
    else setChosenColor(null);
  };

  const handleConfirmClaim = (): void => {
    if (selectedRoute === null || chosenColor === null) return;
    const route = ROUTES[selectedRoute]!;
    const aff = canAffordRoute(human.hand, route);
    if (!aff.ok) return;
    dispatch({ type: "claimRoute", routeIdx: selectedRoute, useColor: chosenColor } as TTRAction);
    setSelectedRoute(null);
    setChosenColor(null);
  };

  const handleCancelClaim = (): void => {
    setSelectedRoute(null);
    setChosenColor(null);
  };

  const renderRouteSegments = (ri: number): JSX.Element => {
    const r = ROUTES[ri]!;
    const a = CITIES[r.a]!;
    const b = CITIES[r.b]!;
    const owner = state.routeOwner[ri] ?? null;
    const x1 = a.x * MAP_W;
    const y1 = a.y * MAP_H;
    const x2 = b.x * MAP_W;
    const y2 = b.y * MAP_H;
    const segs = [];
    const dx = (x2 - x1) / r.length;
    const dy = (y2 - y1) / r.length;
    const fill = owner !== null ? PLAYER_COLOR[owner] : (r.color === "gray" ? "#90939e" : COLOR_HEX[r.color]);
    const stroke = owner !== null ? "#101117" : "#1c1c22";
    for (let i = 0; i < r.length; i++) {
      const sx = x1 + dx * i + dx * 0.15;
      const sy = y1 + dy * i + dy * 0.15;
      const ex = x1 + dx * (i + 1) - dx * 0.15;
      const ey = y1 + dy * (i + 1) - dy * 0.15;
      segs.push(
        <line
          key={`${ri}-${i}`}
          x1={sx} y1={sy} x2={ex} y2={ey}
          stroke={fill} strokeWidth={8} strokeLinecap="round"
        />,
      );
      segs.push(
        <line
          key={`${ri}-${i}-edge`}
          x1={sx} y1={sy} x2={ex} y2={ey}
          stroke={stroke} strokeWidth={1.5} strokeLinecap="round"
        />,
      );
    }
    return (
      <g
        key={`route-${ri}`}
        className={`ttr-route ${selectedRoute === ri ? "ttr-route-selected" : ""} ${owner === null ? "ttr-route-open" : "ttr-route-owned"}`}
        onClick={() => onRouteClick(ri)}
        data-testid={`ttr-route-${ri}`}
        style={{ cursor: owner === null && state.phase === "play" && state.current === 0 ? "pointer" : "default" }}
      >
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="transparent" strokeWidth={20}
        />
        {segs}
      </g>
    );
  };

  // For the claim panel: which colors can satisfy the selected route?
  const claimColorOptions = useMemo((): CardColor[] => {
    if (selectedRoute === null) return [];
    const route = ROUTES[selectedRoute]!;
    if (route.color !== "gray") {
      const options: CardColor[] = [];
      if ((human.hand[route.color] ?? 0) + (human.hand.loco ?? 0) >= route.length) options.push(route.color);
      if ((human.hand.loco ?? 0) >= route.length) options.push("loco");
      return options;
    }
    const options: CardColor[] = [];
    for (const c of COLORS) {
      if ((human.hand[c] ?? 0) + (human.hand.loco ?? 0) >= route.length) options.push(c);
    }
    if ((human.hand.loco ?? 0) >= route.length) options.push("loco");
    return options;
  }, [selectedRoute, human.hand]);

  return (
    <div className="ttr-shell fade-in">
      <div className="ttr-info">
        <div className="ttr-info-cell">
          <div className="label">Phase</div>
          <div className="value">{phaseLabel}</div>
        </div>
        <div className="ttr-info-cell">
          <div className="label">Trains Left</div>
          <div className="value">{state.players.map(p => `${p.id === 0 ? "You" : p.id === 1 ? "R" : "B"}:${p.trains}`).join(" ")}</div>
        </div>
        <div className="ttr-info-cell">
          <div className="label">Your Score (live)</div>
          <div className="value pulse" data-testid="ttr-score">{humanScore.total}</div>
        </div>
      </div>

      <svg
        className="ttr-map"
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        role="img"
        aria-label="Ticket to Ride USA map"
        data-testid="ttr-map"
      >
        <rect x={0} y={0} width={MAP_W} height={MAP_H} fill="#16202b" />
        {ROUTES.map((_r, ri) => renderRouteSegments(ri))}
        {cityNodes.map(c => (
          <g key={c.idx} onClick={() => onCityClick(c.idx)} className="ttr-city" data-testid={`ttr-city-${c.idx}`}>
            <circle cx={c.x * MAP_W} cy={c.y * MAP_H} r={9} fill="#f5eddc" stroke="#1c1c22" strokeWidth={2} />
            <text
              x={c.x * MAP_W} y={c.y * MAP_H - 14}
              textAnchor="middle" fontSize={12} fontWeight={700} fill="#f5eddc"
              stroke="#0d0d14" strokeWidth={3} paintOrder="stroke"
            >
              {c.name}
            </text>
          </g>
        ))}
      </svg>

      {/* Ticket choosing panel (setup + mid-game) */}
      {state.phase === "ticket" && state.current === 0 && (
        <div className="ttr-panel ttr-ticket-panel bounce-in">
          <div className="ttr-panel-title">
            Choose Tickets (keep at least {human.pendingMustKeep})
          </div>
          <div className="ttr-tickets">
            {human.pendingTickets.map((tk, i) => {
              const kept = human.pendingKept[i] ?? false;
              return (
                <button
                  key={i}
                  type="button"
                  className={`ttr-ticket ${kept ? "ttr-ticket-kept" : "ttr-ticket-skip"}`}
                  onClick={() => dispatch({ type: "toggleKeepTicket", idx: i } as TTRAction)}
                  data-testid={`ttr-ticket-${i}`}
                  title={`${kept ? "Keeping" : "Discarding"}: ${CITIES[tk.a]!.name} to ${CITIES[tk.b]!.name} for ${tk.value} points`}
                  aria-label={`Ticket ${CITIES[tk.a]!.name} to ${CITIES[tk.b]!.name}, ${tk.value} points, ${kept ? "kept" : "discarded"}`}
                >
                  <span className="ttr-ticket-cities">{CITIES[tk.a]!.name} → {CITIES[tk.b]!.name}</span>
                  <span className="ttr-ticket-pts">{tk.value} pts</span>
                  <span className="ttr-ticket-state">{kept ? "KEEP" : "DISCARD"}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="ttr-btn ttr-btn-primary"
            onClick={() => dispatch({ type: "commitTickets" } as TTRAction)}
            disabled={human.pendingKept.filter(Boolean).length < human.pendingMustKeep}
            data-testid="ttr-commit-tickets"
            title="Confirm your selected tickets"
          >
            Confirm Tickets
          </button>
        </div>
      )}

      {/* Action panel */}
      {state.phase !== "ticket" && state.phase !== "done" && state.current === 0 && (
        <div className="ttr-panel ttr-action-panel">
          <div className="ttr-panel-title">
            {state.phase === "drawing" ? "Draw 1 more card" : "Choose an action"}
          </div>
          <div className="ttr-actions-row">
            <div className="ttr-faceup-row">
              {state.faceUp.map((c, i) => (
                <FaceUp
                  key={i}
                  color={c}
                  idx={i}
                  disabled={state.phase === "drawing" && c === "loco"}
                  onClick={() => dispatch({ type: "drawFaceUp", idx: i } as TTRAction)}
                />
              ))}
            </div>
            <button
              type="button"
              className="ttr-btn ttr-btn-secondary"
              onClick={() => dispatch({ type: "drawDeck" } as TTRAction)}
              data-testid="ttr-draw-deck"
              title="Draw a hidden card from the train deck"
            >
              Draw From Deck ({state.deck.length})
            </button>
            {state.phase !== "drawing" && (
              <button
                type="button"
                className="ttr-btn ttr-btn-ghost"
                onClick={() => dispatch({ type: "requestTickets" } as TTRAction)}
                data-testid="ttr-request-tickets"
                title="Draw 3 new destination tickets (must keep at least 1)"
              >
                Draw Tickets ({state.ticketDeck.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hand display */}
      {state.phase !== "done" && (
        <div className="ttr-hand">
          <div className="ttr-hand-title">Your hand</div>
          <div className="ttr-hand-row">
            {(["red","orange","yellow","green","blue","white","pink","black","loco"] as CardColor[]).map(c => (
              <TrainCard key={c} color={c} count={human.hand[c] ?? 0} title={`${c} cards in hand: ${human.hand[c] ?? 0}`} />
            ))}
          </div>
        </div>
      )}

      {/* Tickets display */}
      {state.phase !== "done" && human.tickets.length > 0 && (
        <div className="ttr-tickets-display">
          <div className="ttr-hand-title">Your tickets</div>
          <div className="ttr-tickets-list">
            {human.tickets.map((tk, i) => (
              <div
                key={i}
                className={`ttr-ticket-row ${tk.done ? "ttr-ticket-done" : ""}`}
                title={`${CITIES[tk.a]!.name} to ${CITIES[tk.b]!.name}: ${tk.value} points ${tk.done ? "(complete!)" : "(uncompleted)"}`}
              >
                <span className="ttr-ticket-row-cities">{CITIES[tk.a]!.name} → {CITIES[tk.b]!.name}</span>
                <span className="ttr-ticket-row-pts">{tk.done ? `+${tk.value}` : `-${tk.value}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claim route confirmation */}
      {selectedRoute !== null && state.phase === "play" && state.current === 0 && (() => {
        const route = ROUTES[selectedRoute]!;
        return (
          <div className="ttr-panel ttr-claim-panel bounce-in">
            <div className="ttr-panel-title">
              Claim {CITIES[route.a]!.name} → {CITIES[route.b]!.name} (length {route.length}, color: {route.color})
            </div>
            <div className="ttr-claim-colors">
              {claimColorOptions.length === 0 ? (
                <span className="ttr-claim-err">You can't afford this route.</span>
              ) : claimColorOptions.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`ttr-claim-color ttr-card-${c} ${chosenColor === c ? "ttr-claim-selected" : ""}`}
                  onClick={() => setChosenColor(c)}
                  style={c === "loco" ? { background: COLOR_HEX.loco } : { background: COLOR_HEX[c] }}
                  title={`Pay with ${c} cards`}
                  aria-label={`Pay with ${c} cards`}
                  data-testid={`ttr-claim-color-${c}`}
                >
                  {c === "loco" ? "LOCO" : c.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="ttr-claim-actions">
              <button
                type="button"
                className="ttr-btn ttr-btn-primary"
                onClick={handleConfirmClaim}
                disabled={chosenColor === null || claimColorOptions.length === 0}
                data-testid="ttr-confirm-claim"
                title="Spend cards and place trains"
              >
                Place Trains ({route.length})
              </button>
              <button
                type="button"
                className="ttr-btn ttr-btn-ghost"
                onClick={handleCancelClaim}
                title="Cancel route claim"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })()}

      {/* Game over panel */}
      {state.phase === "done" && (
        <div className="ttr-panel ttr-end-panel bounce-in" data-testid="ttr-end-panel">
          <div className="ttr-end-title">
            {state.winner === 0 ? "You won the railroad race!" : `${PLAYER_NAME[state.winner ?? 0]} won.`}
          </div>
          <div className="ttr-scores">
            {state.players.map((p, i) => {
              const sc = scorePlayer(state, p.id);
              return (
                <div key={i} className={`ttr-scorecard ttr-scorecard-${p.id}`} data-testid={`ttr-score-${p.id}`}>
                  <div className="ttr-scorecard-name">{PLAYER_NAME[p.id]}</div>
                  <div className="ttr-scorecard-row">Routes: {sc.routePts}</div>
                  <div className="ttr-scorecard-row">Tickets: +{sc.ticketPts} / -{sc.ticketPenalty}</div>
                  <div className="ttr-scorecard-row">Longest: {sc.longestBonus}</div>
                  <div className="ttr-scorecard-total">Total: {sc.total}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Log */}
      <div className="ttr-log" aria-label="game log">
        {state.log.slice(-6).map((m, i) => (
          <div key={i} className="ttr-log-line">{m}</div>
        ))}
      </div>
    </div>
  );
}

export default TicketToRideFullGame;
