import Link from "next/link"

async function getMerchants(): Promise<Merchant[]> {
  const res = await fetch("http://localhost:3000/api/merchants", {
    cache: "no-store",
  });

  const text = await res.text();
  console.log("API RESPONSE:", text);

  try {
    const json = JSON.parse(text);
    return json.data || [];
  } catch (err) {
    console.error("Bukan JSON:", text);
    return [];
  }
}

type MerchantStatus = "active" | "pending" | "suspended" | "rejected";

type Merchant = {
  id: number;
  merchant_code: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone?: string;
  status: "active" | "pending" | "suspended" | "rejected";
};

function StatusBadge({ status }: { status: MerchantStatus }) {
  const style = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    suspended: "bg-red-100 text-red-700",
    rejected: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        style[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

export default async function MerchantsPage() {
  const merchants = await getMerchants();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Merchant</h1>
          <p className="mt-2 text-gray-500">
            Kelola data merchant yang terdaftar di platform.
          </p>
        </div>

        <Link
          href="/merchants/create"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Tambah Merchant
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Daftar Merchant
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-4">Kode</th>
                <th className="px-5 py-4">Nama Bisnis</th>
                <th className="px-5 py-4">Pemilik</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">No. HP</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {merchants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                    Belum ada data merchant
                  </td>
                </tr>
              ) : (
                merchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {merchant.merchant_code}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {merchant.business_name}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {merchant.owner_name}
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {merchant.email}
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {merchant.phone || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={merchant.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/merchants/${merchant.id}`}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}