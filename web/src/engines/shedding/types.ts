/**
 * Generic shedding-game primitives. Games plug in their own card shape.
 * A card is anything with a stable id; `matchFn` determines playability.
 */

export interface ShedCard {
  id: string;
  /** Whatever the game needs to render and match. */
  data: Record<string, unknown>;
}

export interface HandState<C extends ShedCard = ShedCard> {
  hands: C[][];          // one hand per seat
  drawPile: C[];
  discardPile: C[];      // bottom → top; top is last
  turn: number;          // current seat index
  direction: 1 | -1;     // 1 = clockwise, -1 = counter-clockwise
  seats: number;
}
