import {
  ZONE_ROUTES,
  pointsToPath,
  resolveZoneRouteKey,
  type ZoneRouteKey,
} from "../lib/grave-routes";

type Props = {
  zone: string;
  plotNo: string;
  routeKey?: ZoneRouteKey;
};

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.85}>
      <ellipse cx="0" cy="-10" rx="14" ry="18" fill="#5f7059" />
      <ellipse cx="-8" cy="-4" rx="10" ry="12" fill="#6a7d64" />
      <ellipse cx="8" cy="-4" rx="10" ry="12" fill="#6a7d64" />
      <rect x="-2" y="4" width="4" height="10" fill="#8a7355" />
    </g>
  );
}

export function ParkMapIllustration({ zone, plotNo, routeKey }: Props) {
  const key = routeKey || resolveZoneRouteKey(zone, plotNo);
  const route = ZONE_ROUTES[key];
  const pathD = pointsToPath(route.points);
  const dest = route.points[route.points.length - 1];

  return (
    <div className="park-map-wrap">
      <svg viewBox="0 0 520 360" className="park-map-svg" role="img" aria-label={`${plotNo} 약도`}>
        <defs>
          <linearGradient id="parkSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8efe4" />
            <stop offset="100%" stopColor="#f4efe6" />
          </linearGradient>
          <linearGradient id="parkHill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d8e4d2" />
            <stop offset="100%" stopColor="#c5d4bc" />
          </linearGradient>
        </defs>

        <rect width="520" height="360" fill="url(#parkSky)" rx="12" />

        {/* 언덕·구역 */}
        <ellipse cx="110" cy="130" rx="92" ry="58" fill="url(#parkHill)" opacity={0.55} />
        <ellipse cx="400" cy="120" rx="88" ry="52" fill="url(#parkHill)" opacity={0.5} />
        <ellipse cx="310" cy="95" rx="72" ry="44" fill="#dce8d6" opacity={0.45} />

        {/* 산책로 */}
        <path
          d="M260 330 C220 300 170 280 120 250 S70 190 88 142"
          fill="none"
          stroke="#ddd2c4"
          strokeWidth="10"
          strokeLinecap="round"
          opacity={0.7}
        />
        <path
          d="M260 330 C300 290 350 270 380 250 S430 190 418 158"
          fill="none"
          stroke="#ddd2c4"
          strokeWidth="10"
          strokeLinecap="round"
          opacity={0.7}
        />
        <path
          d="M260 330 C320 290 360 250 392 224 S350 140 318 112"
          fill="none"
          stroke="#ddd2c4"
          strokeWidth="8"
          strokeLinecap="round"
          opacity={0.55}
        />

        {/* 주차·시설 */}
        <rect x="348" y="268" width="56" height="28" rx="6" fill="#e6ddd0" stroke="#ccc0ae" />
        <text x="376" y="286" textAnchor="middle" fontSize="10" fill="#6d645b">
          주차
        </text>
        <rect x="368" y="198" width="40" height="26" rx="5" fill="#ebe3d6" stroke="#ccc0ae" />
        <text x="388" y="215" textAnchor="middle" fontSize="9" fill="#6d645b">
          카페
        </text>

        {/* 구역 라벨 */}
        <rect x="52" y="118" width="52" height="22" rx="8" fill="#fffdf8" stroke="#c8d8c2" />
        <text x="78" y="133" textAnchor="middle" fontSize="11" fill="#3f4c3b" fontWeight="600">
          A구역
        </text>
        <rect x="392" y="132" width="52" height="22" rx="8" fill="#fffdf8" stroke="#c8d8c2" />
        <text x="418" y="147" textAnchor="middle" fontSize="11" fill="#3f4c3b" fontWeight="600">
          B구역
        </text>
        <rect x="286" y="88" width="58" height="22" rx="8" fill="#fffdf8" stroke="#c8d8c2" />
        <text x="315" y="103" textAnchor="middle" fontSize="11" fill="#3f4c3b" fontWeight="600">
          수목장
        </text>

        <Tree x={48} y={170} />
        <Tree x={90} y={188} s={0.85} />
        <Tree x={130} y={210} />
        <Tree x={450} y={175} />
        <Tree x={340} y={150} s={0.9} />
        <Tree x={200} y={120} s={0.75} />

        {/* 정문 */}
        <rect x="232" y="322" width="56" height="22" rx="4" fill="#8a7355" />
        <path d="M232 322 L260 308 L288 322 Z" fill="#a48b62" />
        <text x="260" y="336" textAnchor="middle" fontSize="10" fill="#fffdf8">
          정문
        </text>

        {/* 안내 경로 (점선) */}
        <path d={pathD} className="park-map-route-bg" />
        <path d={pathD} className="park-map-route" />

        {/* 경유지 */}
        {route.points.map((point, index) => (
          <g key={`${point.x}-${point.y}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={index === route.points.length - 1 ? 9 : 6}
              className={index === route.points.length - 1 ? "park-map-pin" : "park-map-waypoint"}
            />
            <text
              x={point.x}
              y={point.y - (index === route.points.length - 1 ? 16 : 12)}
              textAnchor="middle"
              fontSize="10"
              fill="#3f4c3b"
              fontWeight={index === route.points.length - 1 ? 600 : 400}
            >
              {point.label}
            </text>
          </g>
        ))}

        {/* 목적지 묘번 */}
        <rect x={dest.x - 28} y={dest.y + 10} width="56" height="18" rx="9" fill="#3f4c3b" />
        <text x={dest.x} y={dest.y + 22} textAnchor="middle" fontSize="10" fill="#fffdf8" fontWeight="600">
          {plotNo}
        </text>
      </svg>
    </div>
  );
}
