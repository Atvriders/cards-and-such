import "@testing-library/jest-dom/vitest";

// jsdom 24 does not implement PointerEvent, so pointer-event handlers never fire.
// This minimal polyfill extends MouseEvent to carry clientX/clientY through
// fireEvent.pointerDown / pointerUp / pointerCancel in tests.
if (typeof window !== "undefined" && !("PointerEvent" in window)) {
  class PointerEvent extends MouseEvent {
    pointerId: number;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
    }
  }
  (window as unknown as Record<string, unknown>).PointerEvent = PointerEvent;
}
