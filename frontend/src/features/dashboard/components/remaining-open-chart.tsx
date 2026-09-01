/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */

function tickLabel(day: string): string {
  const [, month, date] = day.split('-');
  return `${Number(month)}/${Number(date)}`;
}

export function RemainingOpenChart({
  points,
  label,
  empty,
}: {
  points: { day: string; open: number }[];
  label: string;
  empty: string;
}) {
  const max = Math.max(0, ...points.map((point) => point.open));
  if (points.length === 0 || max === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  const width = 320;
  const height = 88;
  const padX = 4;
  const padY = 8;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const coords = points.map((point, index) => {
    const x = padX + (points.length === 1 ? innerW / 2 : (index / (points.length - 1)) * innerW);
    const y = padY + innerH - (point.open / max) * innerH;
    return { x, y, ...point };
  });
  const line = coords.map((point) => `${point.x},${point.y}`).join(' ');
  const last = coords[coords.length - 1];
  const area = `${padX},${padY + innerH} ${line} ${last.x},${padY + innerH}`;

  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full overflow-visible" role="img" aria-label={label}>
        <polygon points={area} fill="#0f766e22" />
        <polyline
          points={line}
          fill="none"
          stroke="#0f766e"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.map((point) => (
          <circle key={point.day} cx={point.x} cy={point.y} r={2} fill="#0f766e">
            <title>{`${tickLabel(point.day)} · ${point.open}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{tickLabel(points[0].day)}</span>
        <span>{tickLabel(points[points.length - 1].day)}</span>
      </div>
    </div>
  );
}
