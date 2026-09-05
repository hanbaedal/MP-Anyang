export type MapPoint = { x: number; y: number; label?: string };

export type ZoneRouteKey = "A" | "B" | "C";

export const ZONE_ROUTES: Record<ZoneRouteKey, { points: MapPoint[] }> = {
  A: {
    points: [
      { x: 260, y: 318, label: "정문" },
      { x: 132, y: 246, label: "소나무길" },
      { x: 88, y: 142, label: "A구역" },
    ],
  },
  B: {
    points: [
      { x: 260, y: 318, label: "정문" },
      { x: 372, y: 262, label: "제2주차장" },
      { x: 418, y: 158, label: "B구역" },
    ],
  },
  C: {
    points: [
      { x: 260, y: 318, label: "정문" },
      { x: 392, y: 224, label: "카페 옆" },
      { x: 318, y: 112, label: "수목장" },
    ],
  },
};

export function resolveZoneRouteKey(zone: string, plotNo: string): ZoneRouteKey {
  const text = `${zone} ${plotNo}`.toUpperCase();
  if (text.includes("B")) return "B";
  if (text.includes("C")) return "C";
  return "A";
}

export function pointsToPath(points: MapPoint[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}
