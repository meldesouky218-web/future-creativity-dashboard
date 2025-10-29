// components/Sparkline.js
export default function Sparkline({
  data = [],
  width = 280,
  height = 60,
  strokeWidth = 2,
}) {
  if (!data || data.length === 0) {
    return (
      <svg width={width} height={height}>
        <text x="8" y={height / 2} fill="#888" fontSize="10">
          No data
        </text>
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const dx = width / (data.length - 1 || 1);
  const norm = (v) =>
    height - ((v - min) / (max - min || 1)) * (height - 6) - 3; // padding

  const d = data
    .map((v, i) => `${i === 0 ? "M" : "L"} ${i * dx} ${norm(v)}`)
    .join(" ");

  const last = data[data.length - 1];
  const prev = data[data.length - 2] ?? last;
  const isUp = last >= prev;

  return (
    <svg width={width} height={height}>
      <path d={d} fill="none" stroke={isUp ? "#36caa4" : "#ef4444"} strokeWidth={strokeWidth} />
      <circle cx={width - 0} cy={norm(last)} r="3" fill={isUp ? "#36caa4" : "#ef4444"} />
    </svg>
  );
}
