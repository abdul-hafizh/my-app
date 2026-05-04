import DashboardCard from "@/components/DashboardCard";

async function getDashboard() {
  const res = await fetch("http://localhost:3000/api/dashboard", {
    cache: "no-store",
  });

  const json = await res.json();
  return json.data;
}

function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);
}

export default async function DashboardPage() {
  const data = await getDashboard();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Payment Gateway
        </h1>
        <p className="mt-2 text-gray-500">
          Ringkasan merchant, transaksi, pembayaran, dan pencairan dana.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Total Merchant"
          value={data.total_merchant}
          subtitle="Merchant terdaftar"
        />

        <DashboardCard
          title="Total Transaksi"
          value={data.total_transaction}
          subtitle={rupiah(data.total_transaction_amount)}
        />

        <DashboardCard
          title="Transaksi Berhasil"
          value={data.paid_transaction}
          subtitle={rupiah(data.paid_transaction_amount)}
        />

        <DashboardCard
          title="Total Pencairan"
          value={data.total_settlement}
          subtitle={rupiah(data.total_settlement_amount)}
        />
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">
          Alur Sistem
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-700">1. Merchant Daftar</h3>
            <p className="mt-2 text-sm text-blue-600">
              Merchant melakukan pendaftaran dan melengkapi data usaha.
            </p>
          </div>

          <div className="rounded-xl bg-green-50 p-4">
            <h3 className="font-semibold text-green-700">2. Pembayaran</h3>
            <p className="mt-2 text-sm text-green-600">
              Customer membayar melalui QRIS, VA, atau FT.
            </p>
          </div>

          <div className="rounded-xl bg-yellow-50 p-4">
            <h3 className="font-semibold text-yellow-700">3. Saldo Masuk</h3>
            <p className="mt-2 text-sm text-yellow-600">
              Transaksi berhasil masuk ke saldo merchant.
            </p>
          </div>

          <div className="rounded-xl bg-purple-50 p-4">
            <h3 className="font-semibold text-purple-700">4. Pencairan</h3>
            <p className="mt-2 text-sm text-purple-600">
              Merchant mengajukan settlement ke rekening tujuan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}