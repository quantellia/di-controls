interface TooltipObj {
  message: (currentX: number, currentY: number) => string;
  position: () => { x: number; y: number };
}

export type { TooltipObj };
