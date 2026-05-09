"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Transaction = {
  id: number;
  transaction_code: string;
  external_reference: string | null;
  merchant_id: number;
  merchant_name: string | null;
  merchant_code: string | null;
  payment_method_id: number;
  payment_method_name: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  amount: number;
  fee: number;
  net_amount: number;
  status: "pending" | "paid" | "expired" | "failed" | "refunded";
  payment_url: string | null;
  expired_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  provider_name: string | null;
  qris_content: string | null;
  va_number: string | null;
  bank_code: string | null;
  ft_account_number: string | null;
  ft_account_name: string | null;
  raw_response: string | null;
};

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  async function fetchTransaction() {
    try {
      setLoading(true);

      const res = await fetch(`/api/transactions/${params.id}`, {
        cache: "no-store",
      });

      const json = await res.json();

      if (!json.success) {
        alert(json.message || "Transaksi tidak ditemukan");
        router.push("/transactions");
        return;
      }

      setTransaction(json.data);
    } catch (error) {
      alert("Gagal memuat detail transaksi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchTransaction();
    }
  }, [params.id]);

  function rupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
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

  function formatDate(value: string | null) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  async function updateStatus(status: Transaction["status"]) {
    if (!transaction) return;

    const confirmAction = confirm(
      `Yakin ubah status transaksi menjadi ${status}?`
    );

    if (!confirmAction) return;

    try {
      setUpdating(true);

      const res = await fetch(`/api/transactions/${transaction.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const json = await res.json();

      if (!json.success) {
        alert(json.message || "Gagal update status transaksi");
        return;
      }

      alert("Status transaksi berhasil diperbarui");

      setTransaction({
        ...transaction,
        status,
        paid_at: status === "paid" ? new Date().toISOString() : transaction.paid_at,
      });

      router.refresh();
    } catch (error) {
      alert("Terjadi kesalahan saat update status");
    } finally {
      setUpdating(false);
    }
  }

  if (loading || !transaction) {
    return <p className="text-gray-500">Memuat detail transaksi...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Detail Transaksi
          </h1>
          <p className="mt-2 text-gray-500">
            {transaction.transaction_code}
          </p>
        </div>

        <button
          onClick={() => router.push("/transactions")}
          className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Kembali
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Amount</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">
            {rupiah(transaction.amount)}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Fee</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">
            {rupiah(transaction.fee)}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Net Amount</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">
            {rupiah(transaction.net_amount)}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Status</p>
          <div className="mt-3">
            <span className={statusBadge(transaction.status)}>
              {transaction.status}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Update Status
            </h2>
            <p className="text-sm text-gray-500">
              Tombol ini untuk simulasi proses pembayaran.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {transaction.status !== "paid" && (
              <button
                onClick={() => updateStatus("paid")}
                disabled={updating}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                Set Paid
              </button>
            )}

            {transaction.status !== "failed" && (
              <button
                onClick={() => updateStatus("failed")}
                disabled={updating}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Set Failed
              </button>
            )}

            {transaction.status !== "expired" && (
              <button
                onClick={() => updateStatus("expired")}
                disabled={updating}
                className="rounded-xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
              >
                Set Expired
              </button>
            )}

            {transaction.status === "paid" && (
              <button
                onClick={() => updateStatus("refunded")}
                disabled={updating}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Set Refunded
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">
            Informasi Transaksi
          </h2>

          <div className="space-y-4 text-sm">
            <Info label="Kode Transaksi" value={transaction.transaction_code} />
            <Info label="External Reference" value={transaction.external_reference} />
            <Info label="Payment URL" value={transaction.payment_url} />
            <Info label="Metode Pembayaran" value={transaction.payment_method_name} />
            <Info label="Provider" value={transaction.provider_name} />
            <Info label="Dibuat" value={formatDate(transaction.created_at)} />
            <Info label="Expired" value={formatDate(transaction.expired_at)} />
            <Info label="Paid At" value={formatDate(transaction.paid_at)} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">
            Informasi Merchant
          </h2>

          <div className="space-y-4 text-sm">
            <Info label="Merchant" value={transaction.merchant_name} />
            <Info label="Kode Merchant" value={transaction.merchant_code} />
            <Info label="Customer Name" value={transaction.customer_name} />
            <Info label="Customer Email" value={transaction.customer_email} />
            <Info label="Customer Phone" value={transaction.customer_phone} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-gray-900">
          Detail Pembayaran
        </h2>

        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <Info label="QRIS Content" value={transaction.qris_content} />
          <Info label="VA Number" value={transaction.va_number} />
          <Info label="Bank Code" value={transaction.bank_code} />
          <Info label="FT Account Number" value={transaction.ft_account_number} />
          <Info label="FT Account Name" value={transaction.ft_account_name} />
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-gray-700">
            Raw Response
          </p>

          <pre className="max-h-72 overflow-auto rounded-xl bg-gray-900 p-4 text-xs text-white">
            {transaction.raw_response || "-"}
          </pre>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 break-all font-medium text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}