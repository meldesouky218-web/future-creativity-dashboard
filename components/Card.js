export default function Card({ title, value, children }) {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl shadow-lg p-6">
      <h3 className="text-matteGold text-lg font-semibold">{title}</h3>
      {value !== undefined && (
        <p className="text-3xl font-bold mt-2 text-lightText">{value}</p>
      )}
      {children && <div className="mt-4 text-sm text-lightText/80">{children}</div>}
    </div>
  );
}

