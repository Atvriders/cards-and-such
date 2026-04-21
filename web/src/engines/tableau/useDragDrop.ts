import { useCallback, useRef } from "react";

export interface DragState {
  fromPile: string | null;
  count: number;
}

export interface DragDrop {
  onDragStart: (pileId: string, indexFromTop: number) => (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (pileId: string, onMove: (from: string, to: string, count: number) => void) => (e: React.DragEvent) => void;
}

export function useDragDrop(): DragDrop {
  const ref = useRef<DragState>({ fromPile: null, count: 0 });

  const onDragStart = useCallback(
    (pileId: string, indexFromTop: number) => (e: React.DragEvent) => {
      ref.current = { fromPile: pileId, count: indexFromTop + 1 };
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", `${pileId}:${indexFromTop + 1}`);
    },
    [],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (toPileId: string, onMove: (from: string, to: string, count: number) => void) =>
      (e: React.DragEvent) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData("text/plain") || "";
        const [fromPile, countStr] = raw.split(":");
        const count = Number(countStr);
        if (fromPile && count > 0) onMove(fromPile, toPileId, count);
        ref.current = { fromPile: null, count: 0 };
      },
    [],
  );

  return { onDragStart, onDragOver, onDrop };
}
