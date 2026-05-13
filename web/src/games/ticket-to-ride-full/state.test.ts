import { describe, it, expect } from "vitest";
import {
  initialState, reducer, isTerminal,
  CITIES, ROUTES, N_CITIES, N_ROUTES, TICKETS, COLORS,
  canAffordRoute, spendForRoute, routePoints,
  isTicketConnected, longestRoute, scorePlayer, totalCards,
  shortestRoutePath,
  STARTING_TRAINS, HAND_START,
} from "./state.js";
import type { TTRState, TTRAction, CardColor, PlayerId } from "./state.js";

const S = { cpuAggression: 1 };

function commitHumanTicketsKeepAll(s: TTRState): TTRState {
  // Setup: human's pending tickets are all "kept" already; commit them.
  return reducer(s, { type: "commitTickets" } as TTRAction);
}

describe("ticket-to-ride-full map", () => {
  it("has 30+ cities (representative subset)", () => {
    expect(CITIES.length).toBeGreaterThanOrEqual(30);
    expect(N_CITIES).toBe(CITIES.length);
  });

  it("includes the headline cities", () => {
    const names = CITIES.map(c => c.name);
    for (const must of ["Atlanta", "Boston", "Chicago", "Dallas", "Denver", "Houston",
                        "Kansas City", "Los Angeles", "Miami", "Montreal", "Nashville",
                        "New York", "New Orleans", "Phoenix", "Portland", "Raleigh",
                        "Salt Lake City", "San Francisco", "Seattle", "Saint Louis",
                        "Toronto", "Vancouver", "Washington"]) {
      expect(names).toContain(must);
    }
  });

  it("has reasonable route counts and valid lengths/colors", () => {
    expect(ROUTES.length).toBeGreaterThan(40);
    for (const r of ROUTES) {
      expect(r.length).toBeGreaterThanOrEqual(1);
      expect(r.length).toBeLessThanOrEqual(6);
      expect(r.a).toBeGreaterThanOrEqual(0);
      expect(r.b).toBeGreaterThanOrEqual(0);
      expect(r.a).not.toBe(r.b);
      expect([...COLORS, "gray"]).toContain(r.color as never);
    }
  });

  it("routePoints follows classic 1/2/4/7/10/15 scale", () => {
    expect(routePoints(1)).toBe(1);
    expect(routePoints(2)).toBe(2);
    expect(routePoints(3)).toBe(4);
    expect(routePoints(4)).toBe(7);
    expect(routePoints(5)).toBe(10);
    expect(routePoints(6)).toBe(15);
  });

  it("ticket deck has 25+ tickets with valid city refs", () => {
    expect(TICKETS.length).toBeGreaterThan(25);
    for (const t of TICKETS) {
      expect(t.a).toBeGreaterThanOrEqual(0);
      expect(t.a).toBeLessThan(N_CITIES);
      expect(t.b).toBeGreaterThanOrEqual(0);
      expect(t.b).toBeLessThan(N_CITIES);
      expect(t.value).toBeGreaterThan(0);
    }
  });
});

describe("ticket-to-ride-full initial state", () => {
  it("is deterministic by seed", () => {
    const a = initialState(12345, S);
    const b = initialState(12345, S);
    expect(a.deck).toEqual(b.deck);
    expect(a.faceUp).toEqual(b.faceUp);
    expect(a.players[0]!.hand).toEqual(b.players[0]!.hand);
    expect(a.players[1]!.tickets.map(t => t.a)).toEqual(b.players[1]!.tickets.map(t => t.a));
  });

  it("different seeds produce different deck orders", () => {
    const a = initialState(1, S);
    const b = initialState(99, S);
    expect(a.deck).not.toEqual(b.deck);
  });

  it("each player starts with 45 trains and 4 train cards", () => {
    const s = initialState(7, S);
    for (const p of s.players) {
      expect(p.trains).toBe(STARTING_TRAINS);
      expect(totalCards(p.hand)).toBe(HAND_START);
    }
  });

  it("CPUs start with 3 tickets, human has 3 pending", () => {
    const s = initialState(7, S);
    expect(s.players[1]!.tickets.length).toBe(3);
    expect(s.players[2]!.tickets.length).toBe(3);
    expect(s.players[0]!.tickets.length).toBe(0);
    expect(s.players[0]!.pendingTickets.length).toBe(3);
    expect(s.players[0]!.pendingMustKeep).toBe(2);
  });

  it("face-up market starts with 5 cards", () => {
    const s = initialState(7, S);
    expect(s.faceUp.length).toBe(5);
  });

  it("phase starts in 'ticket' for human", () => {
    const s = initialState(7, S);
    expect(s.phase).toBe("ticket");
    expect(s.current).toBe(0);
  });
});

describe("ticket-to-ride-full reducer", () => {
  it("isTerminal is null on fresh state", () => {
    const s = initialState(7, S);
    expect(isTerminal(s)).toBeNull();
  });

  it("commitTickets refuses to drop below minimum", () => {
    let s = initialState(7, S);
    // Toggle off two tickets — leaves only 1 kept (below min 2)
    s = reducer(s, { type: "toggleKeepTicket", idx: 0 } as TTRAction);
    s = reducer(s, { type: "toggleKeepTicket", idx: 1 } as TTRAction);
    // Commit should be a no-op (same reference)
    const after = reducer(s, { type: "commitTickets" } as TTRAction);
    expect(after).toBe(s);
  });

  it("commitTickets with 2+ kept transitions to play phase", () => {
    let s = initialState(7, S);
    s = commitHumanTicketsKeepAll(s);
    expect(s.phase).toBe("play");
    expect(s.players[0]!.tickets.length).toBe(3);
  });

  it("drawDeck adds a card to hand and advances draw counter", () => {
    let s = initialState(7, S);
    s = commitHumanTicketsKeepAll(s);
    const before = totalCards(s.players[0]!.hand);
    s = reducer(s, { type: "drawDeck" } as TTRAction);
    expect(totalCards(s.players[0]!.hand)).toBe(before + 1);
    // First draw -> drawing phase
    expect(s.phase).toBe("drawing");
    expect(s.drawn).toBe(1);
  });

  it("two draws ends turn and advances to next player", () => {
    let s = initialState(7, S);
    s = commitHumanTicketsKeepAll(s);
    s = reducer(s, { type: "drawDeck" } as TTRAction);
    s = reducer(s, { type: "drawDeck" } as TTRAction);
    expect(s.current).toBe(1); // CPU Red
    expect(s.drawn).toBe(0);
  });

  it("illegal claim returns same reference", () => {
    let s = initialState(7, S);
    s = commitHumanTicketsKeepAll(s);
    // Pick an out-of-range route
    const r = reducer(s, { type: "claimRoute", routeIdx: -1, useColor: "red" } as TTRAction);
    expect(r).toBe(s);
    const r2 = reducer(s, { type: "claimRoute", routeIdx: 9999, useColor: "red" } as TTRAction);
    expect(r2).toBe(s);
  });

  it("claim succeeds when hand has enough cards and a valid route is chosen", () => {
    let s = initialState(7, S);
    s = commitHumanTicketsKeepAll(s);
    // Force the human to have 6 red + 6 loco for any route
    const np = s.players[0]!;
    for (const c of [...COLORS, "loco" as const]) np.hand[c] = 0;
    np.hand.red = 6;
    np.hand.loco = 6;
    // Find an unowned route with color red OR gray
    const ri = ROUTES.findIndex(r => (r.color === "red" || r.color === "gray") && r.length <= 4);
    expect(ri).toBeGreaterThan(-1);
    const before = s.players[0]!.trains;
    const after = reducer(s, { type: "claimRoute", routeIdx: ri, useColor: "red" } as TTRAction);
    expect(after.routeOwner[ri]).toBe(0);
    expect(after.players[0]!.trains).toBe(before - ROUTES[ri]!.length);
    expect(after.current).toBe(1);
  });

  it("scorePlayer adds route points correctly", () => {
    let s = initialState(7, S);
    s = commitHumanTicketsKeepAll(s);
    // Manually claim two routes for player 0 by mutating clone
    const clone: TTRState = { ...s, routeOwner: [...s.routeOwner] };
    // Find two routes of known lengths
    const r1 = ROUTES.findIndex(r => r.length === 3);
    const r2 = ROUTES.findIndex((r, i) => r.length === 2 && i !== r1);
    expect(r1).toBeGreaterThan(-1);
    expect(r2).toBeGreaterThan(-1);
    clone.routeOwner[r1] = 0;
    clone.routeOwner[r2] = 0;
    const sc = scorePlayer(clone, 0);
    expect(sc.routePts).toBe(routePoints(3) + routePoints(2));
  });

  it("isTicketConnected detects basic connectivity", () => {
    const s = initialState(7, S);
    // No routes owned yet
    expect(isTicketConnected(s.routeOwner, 0, 0, 1)).toBe(false);
    // Claim a single route between cities 0 and 1
    const clone = { ...s, routeOwner: [...s.routeOwner] };
    const ri = ROUTES.findIndex(r => (r.a === 0 && r.b === 1) || (r.a === 1 && r.b === 0));
    expect(ri).toBeGreaterThan(-1);
    clone.routeOwner[ri] = 0;
    expect(isTicketConnected(clone.routeOwner, 0, 0, 1)).toBe(true);
    // But CPU sees no connection (different owner)
    expect(isTicketConnected(clone.routeOwner, 1, 0, 1)).toBe(false);
  });

  it("shortestRoutePath returns a connected path", () => {
    const s = initialState(7, S);
    const path = shortestRoutePath(s.routeOwner, 0, 0, 28); // Vancouver -> New York
    expect(path).not.toBeNull();
    // path is built from b back to a (reversed). Walking from a means
    // traversing it in reverse.
    let cur = 0;
    const walk = [...(path ?? [])].reverse();
    for (const ri of walk) {
      const rr = ROUTES[ri]!;
      cur = rr.a === cur ? rr.b : rr.a;
    }
    expect(cur).toBe(28);
  });

  it("longestRoute gives the train length of an owned chain", () => {
    const s = initialState(7, S);
    expect(longestRoute(s.routeOwner, 0)).toBe(0);
    // Pick a route of length 4 and assign to player 0
    const clone = { ...s, routeOwner: [...s.routeOwner] };
    const ri = ROUTES.findIndex(r => r.length === 4);
    expect(ri).toBeGreaterThan(-1);
    clone.routeOwner[ri] = 0;
    expect(longestRoute(clone.routeOwner, 0)).toBe(4);
  });

  it("game ends and isTerminal returns score after final-trigger", () => {
    let s = initialState(7, S);
    s = commitHumanTicketsKeepAll(s);
    // Manually trigger end-game by reducing trains and using requestTickets to advance
    // Simulate: set human's trains to 2, then make every player end their last turn.
    s.players[0]!.trains = 2;
    s.finalTrigger = 0;
    s.finalTurnsLeft = 1; // Only one more turn
    // After this single action, the game should be done.
    s = reducer(s, { type: "drawDeck" } as TTRAction);
    s = reducer(s, { type: "drawDeck" } as TTRAction);
    expect(s.phase).toBe("done");
    const term = isTerminal(s);
    expect(term).not.toBeNull();
    expect(typeof term?.score).toBe("number");
  });
});

describe("ticket-to-ride-full hand-management helpers", () => {
  it("canAffordRoute false on empty hand", () => {
    const empty: Record<CardColor, number> = {
      red: 0, orange: 0, yellow: 0, green: 0, blue: 0, white: 0, pink: 0, black: 0, loco: 0,
    };
    const route = ROUTES[0]!;
    expect(canAffordRoute(empty, route).ok).toBe(false);
  });

  it("spendForRoute decrements the hand and respects loco substitution", () => {
    const hand: Record<CardColor, number> = {
      red: 1, orange: 0, yellow: 0, green: 0, blue: 0, white: 0, pink: 0, black: 0, loco: 2,
    };
    const route = { a: 0, b: 1, length: 3, color: "red" as const };
    const before = { ...hand };
    const ok = spendForRoute(hand, route, "red");
    expect(ok).toBe(true);
    expect(hand.red).toBe(0);
    expect(hand.loco).toBe(0);
    // We spent 1 red + 2 loco
    expect(before.red - hand.red).toBe(1);
    expect(before.loco - hand.loco).toBe(2);
  });
});
