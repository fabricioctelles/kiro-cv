// Kiro Braille font engine
// The kiro-cli binary only ships K, I, R and O. Analysing them dot by dot shows
// a consistent construction: a heavy, round-capped letter (~14 dots thick on a
// 44-dot / 11-row cap height) of which only a 3-dot inner outline is drawn.
// Every other glyph is described here as a skeleton of strokes; the engine
// rasterizes the stroked silhouette on the Braille dot grid, keeps the dots
// near its edge; kiro-text.ts lays the resulting dot bitmaps out next to the
// original letters from kiro-logo.ts.

type Point = [number, number];

interface Stroke {
  pts: Point[];
  r: number;
}

export interface GlyphDef {
  // Total width in dots (rounded up to an even number of dots = whole columns)
  w: number;
  strokes: Stroke[];
}

export const GLYPH_ROWS = 11;
const H = GLYPH_ROWS * 4;
const RING = 3.2;

// Default stroke radius, plus a thinner one for letters with three horizontal
// bars (E, B, S…) so their counters stay open.
const R = 7;
const RT = 5.5;

// Vertical metrics for a stroke of radius r: edge touches dot row 1 / row 42
const top = (r = R) => 1 + r;
const bot = (r = R) => H - 1 - r;
const mid = H / 2;

function line(x1: number, y1: number, x2: number, y2: number, r = R): Stroke {
  return { pts: [[x1, y1], [x2, y2]], r };
}

function path(pts: Point[], r = R): Stroke {
  return { pts, r };
}

// Elliptical arc, angles in degrees, 0 = right, 90 = down (screen space)
function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, r = R): Stroke {
  const steps = Math.max(8, Math.ceil(Math.abs(a1 - a0) / 6));
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((a0 + ((a1 - a0) * i) / steps) * Math.PI) / 180;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return { pts, r };
}

function segDist(px: number, py: number, [ax, ay]: Point, [bx, by]: Point) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = dx * dx + dy * dy;
  const t = len === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

function inside(strokes: Stroke[], px: number, py: number) {
  return strokes.some(({ pts, r }) => {
    if (pts.length === 1) return Math.hypot(px - pts[0][0], py - pts[0][1]) < r;
    for (let i = 1; i < pts.length; i++) if (segDist(px, py, pts[i - 1], pts[i]) < r) return true;
    return false;
  });
}

// Dot bitmap (rows × cols) of the outline ring
export function rasterize({ w, strokes }: GlyphDef): boolean[][] {
  const W = Math.ceil(w / 2) * 2;
  const fill = Array.from({ length: H }, (_, y) =>
    Array.from({ length: W }, (_, x) => inside(strokes, x + 0.5, y + 0.5)),
  );
  const isFilled = (x: number, y: number) => y >= 0 && y < H && x >= 0 && x < W && fill[y][x];
  const reach = Math.ceil(RING);

  return fill.map((row, y) =>
    row.map((on, x) => {
      if (!on) return false;
      for (let dy = -reach; dy <= reach; dy++)
        for (let dx = -reach; dx <= reach; dx++)
          if (Math.hypot(dx, dy) <= RING && !isFilled(x + dx, y + dy)) return true;
      return false;
    }),
  );
}

// Skeletons — x in dots, left stem centered at L
const L = 8;

const T = top();
const B = bot();
const tT = top(RT);
const tB = bot(RT);

export const glyphDefs: Record<string, GlyphDef> = {
  A: { w: 38, strokes: [line(L, B, L, 18), arc(19, 18, 11, 10, 180, 360), line(30, 18, 30, B), line(L, 27, 30, 27, RT)] },
  B: {
    w: 38,
    strokes: [
      line(L, T, L, B),
      line(L, tT, 20, tT, RT),
      line(L, mid, 21, mid, RT),
      line(L, tB, 21, tB, RT),
      arc(20, 14.25, 9, 7.75, -90, 90, RT),
      arc(21, 29.75, 10, 7.75, -90, 90, RT),
    ],
  },
  C: { w: 38, strokes: [arc(20, mid, 12, 14, 40, 320)] },
  D: { w: 38, strokes: [line(L, T, L, B), line(L, T, 16, T), line(L, B, 16, B), arc(16, mid, 14, 14, -90, 90)] },
  E: { w: 36, strokes: [line(L, T, L, B), line(L, tT, 30, tT, RT), line(L, mid, 26, mid, RT), line(L, tB, 30, tB, RT)] },
  F: { w: 36, strokes: [line(L, T, L, B), line(L, tT, 30, tT, RT), line(L, mid, 26, mid, RT)] },
  G: { w: 40, strokes: [arc(20, mid, 12, 14, 40, 320), path([[23, 25], [32, 25], [32, 31]], RT)] },
  H: { w: 38, strokes: [line(L, T, L, B), line(30, T, 30, B), line(L, mid, 30, mid, RT)] },
  J: { w: 36, strokes: [line(28, T, 28, 26), arc(18, 26, 10, 10, 0, 180)] },
  L: { w: 36, strokes: [line(L, T, L, B), line(L, B, 28, B)] },
  M: { w: 46, strokes: [line(L, T, L, B), line(38, T, 38, B), path([[L, T], [23, 26], [38, T]], RT)] },
  N: { w: 38, strokes: [line(L, T, L, B), line(30, T, 30, B), line(L, T, 30, B, RT)] },
  P: {
    w: 36,
    strokes: [line(L, T, L, B), line(L, tT, 20, tT, RT), line(L, 23.5, 20, 23.5, RT), arc(20, 15, 10, 8.5, -90, 90, RT)],
  },
  Q: { w: 42, strokes: [arc(19, mid, 11, 14, 0, 360), line(27, 33, 35, 39, RT)] },
  S: { w: 36, strokes: [arc(19, 14.25, 10, 7.75, 340, 90, RT), arc(19, 29.75, 10, 7.75, 270, 520, RT)] },
  T: { w: 38, strokes: [line(L, T, 30, T), line(19, T, 19, B)] },
  U: { w: 38, strokes: [line(L, T, L, 24), line(30, T, 30, 24), arc(19, 24, 11, 12, 0, 180)] },
  V: { w: 38, strokes: [path([[L, T], [19, B], [30, T]])] },
  W: { w: 46, strokes: [path([[L, T], [15, B], [23, 18], [31, B], [38, T]], 6)] },
  X: { w: 38, strokes: [line(L, T, 30, B), line(30, T, L, B)] },
  Y: { w: 38, strokes: [path([[L, T], [19, mid], [30, T]]), line(19, mid, 19, B)] },
  Z: { w: 38, strokes: [line(L, tT, 30, tT, RT), line(L, tB, 30, tB, RT), line(30, tT, L, tB)] },

  0: { w: 36, strokes: [arc(18, mid, 10, 14, 0, 360)] },
  1: { w: 26, strokes: [line(18, T, 18, B), line(10, 14, 18, T)] },
  2: { w: 38, strokes: [arc(18, 15, 10, 7.5, 190, 380, 6), line(27.4, 17.6, L, tB, 6), line(L, tB, 30, tB, RT)] },
  3: { w: 36, strokes: [arc(18, 14.25, 10, 7.75, 200, 450, RT), arc(18, 29.75, 10, 7.75, 270, 520, RT)] },
  4: { w: 40, strokes: [line(L, T, L, 27), line(L, 27, 32, 27, RT), line(26, T, 26, B)] },
  5: {
    w: 36,
    strokes: [line(10, tT, 30, tT, RT), line(10, tT, 10, 21, RT), arc(19, 28, 11, 9.5, 220, 510, RT)],
  },
  6: { w: 38, strokes: [arc(19, 29, 10.5, 8.5, 0, 360, RT), arc(20, 22, 11.5, 15.5, 180, 300, RT)] },
  7: { w: 38, strokes: [line(L, tT, 30, tT, RT), line(30, tT, 15, B)] },
  8: { w: 36, strokes: [arc(18, 14.25, 9, 7.75, 0, 360, RT), arc(18, 29.75, 10.5, 7.75, 0, 360, RT)] },
  9: { w: 38, strokes: [arc(19, 15, 10.5, 8.5, 0, 360, RT), arc(18, 22, 11.5, 15.5, 0, 120, RT)] },

  '-': { w: 24, strokes: [line(6, mid, 18, mid, RT)] },
  '.': { w: 16, strokes: [path([[L, B]])] },
  '!': { w: 16, strokes: [line(L, T, L, 21), path([[L, tB]], RT)] },
};
