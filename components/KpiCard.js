// components/KpiCard.js
export default function KpiCard({
  title,
  value,
  delta,
  hint,
  icon = null,
  className = "",
}) {
  const isUp = typeof delta === "number" && delta >= 0;
  return (
    <div
      className={
        "rounded-2xl border border-[#1F2837] bg-[#0F1524] p-5 shadow-sm " +
        className
      }
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-lightText/60">{title}</div>
        {icon ? <div className="opacity-80">{icon}</div> : null}
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <div className="text-3xl font-semibold text-matteGold">{value}</div>
        {typeof delta === "number" && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isUp
                ? "text-royalGreen bg-royalGreen/15"
                : "text-red-400 bg-red-400/10"
            }`}
          >
            {isUp ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-lightText/50">{hint}</div>}
    </div>
  );
}
