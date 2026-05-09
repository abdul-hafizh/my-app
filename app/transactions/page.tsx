import Link from "next/link";

type Transaction = {
  id: number;
  transaction_code: string;
  external_reference: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  amount: number;
  fee: number;
  net_amount: number;
  status: string;
  payment_url: string | null;
  expired_at: string | null;
  paid_at: string | null;
  created_at: string;
  merchant_name: string | null;
  payment_method_name: string | null;
};

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
};

async function getTransactions({
  search = "",
  status = "",
  page = "1",
}: {
  search?: string;
  status?: string;
  page?: string;
}) {
  const query = new URLSearchParams({
    search,
    status,
    page,
    limit: "10",
  });

  const res = await fetch(`http://localhost:3000/api/transactions?${query}`, {
    cache: "no-store",
  });

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      message: text,
      data: [],
      pagination: {
        page: 1,
        total_page: 1,
      },
    };
  }
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function statusBadge(status: string) {
  const base = "rounded-full px-3 py-1 text-xs font-semibold";

  if (status === "paid") return `${base} bg-green-100 text-green-700`;
  if (status === "pending") return `${base} bg-yellow-100 text-yellow-700`;
  if (status === "failed") return `${base} bg-red-100 text-red-700`;
  if (status === "expired") return `${base} bg-gray-100 text-gray-700`;
  if (status === "refunded") return `${base} bg-blue-100 text-blue-700`;

  return `${base} bg-gray-100 text-gray-700`;
}

export default async function TransactionsPage({ searchParams }: Props) {
  const params = await searchParams;

  const search = params.search || "";
  const status = params.status || "";
  const page = Number(params.page || 1);

  const json = await getTransactions({
    search,
    status,
    page: String(page),
  });

  const transactions: Transaction[] = json.data || [];
  const pagination = json.pagination || {
    page: 1,
    total_page: 1,
    total: 0,
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Data Transaksi
          </h1>
          <p className="mt-2 text-gray-500">
            Kelola data transaksi pembayaran online.
          </p>
        </div>
      </div>

      {!json.success && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {json.message || "Gagal memuat data transaksi"}
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Daftar Transaksi
            </h2>

            <p className="text-sm text-gray-500">
              Total: {pagination.total || 0} data
            </p>
          </div>

          <form className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Cari kode, customer, merchant..."
              className="md:col-span-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <select
              name="status"
              defaultValue={status}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="expired">Expired</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Cari
            </button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-4">Kode Transaksi</th>
                <th className="px-5 py-4">Merchant</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Metode</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Fee</th>
                <th className="px-5 py-4">Net Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    Data transaksi belum tersedia.
                  </td>
                </tr>
              ) : (
                transactions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">
                        {item.transaction_code}
                      </div>
                      <div className="text-xs text-gray-500">
                        Ref: {item.external_reference || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {item.merchant_name || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">
                        {item.customer_name || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.customer_email || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {item.payment_method_name || "-"}
                    </td>

                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {formatRupiah(item.amount)}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {formatRupiah(item.fee)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {formatRupiah(item.net_amount)}
                    </td>

                    <td className="px-5 py-4">
                      <span className={statusBadge(item.status)}>
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/transactions/${item.id}`}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
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

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
          <div className="text-sm text-gray-500">
            Total data: {pagination.total || 0}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/transactions?search=${search}&status=${status}&page=${Math.max(
                page - 1,
                1
              )}`}
              className={`rounded-lg border px-3 py-2 text-sm ${
                page <= 1
                  ? "pointer-events-none opacity-40"
                  : "hover:bg-gray-100"
              }`}
            >
              Prev
            </Link>

            <span className="text-sm text-gray-600">
              Page {page} / {pagination.total_page || 1}
            </span>

            <Link
              href={`/transactions?search=${search}&status=${status}&page=${Math.min(
                page + 1,
                pagination.total_page || 1
              )}`}
              className={`rounded-lg border px-3 py-2 text-sm ${
                page >= (pagination.total_page || 1)
                  ? "pointer-events-none opacity-40"
                  : "hover:bg-gray-100"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}