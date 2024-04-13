interface TooltipObj {
  message: (xAxisData: number, yAxisData: number) => string;
  position: () => { x: number; y: number };
}

export type { TooltipObj };
