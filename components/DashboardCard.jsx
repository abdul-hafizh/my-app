export default function DashboardCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="mt-3 text-3xl font-bold text-gray-900">{value}</h2>
      {subtitle && <p className="mt-2 text-sm text-gray-400">{subtitle}</p>}
    </div>
  );
}