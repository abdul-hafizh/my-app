"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

type PaymentData = {
  id: number;
  transaction_code: string;
  external_reference: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  amount: number;
  fee: number;
  net_amount: number;
  status: "pending" | "paid" | "expired" | "failed" | "refunded";
  expired_at: string | null;
  paid_at: string | null;
  merchant_name: string | null;
  payment_method_name: string | null;
  payment_method_type: "qris" | "va" | "ft" | string | null;
  provider_name: string | null;
  qris_content: string | null;
  va_number: string | null;
  bank_code: string | null;
  ft_account_number: string | null;
  ft_account_name: string | null;
};

export default function PublicPaymentPage() {
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentData | null>(null);

  async function fetchPayment() {
    try {
      const res = await fetch(`/api/pay/${params.transaction_code}`, {
        cache: "no-store",
      });

      const json = await res.json();

      if (!json.success) {
        setPayment(null);
        return;
      }

      setPayment(json.data);
    } catch {
      setPayment(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.transaction_code) {
      fetchPayment();
    }
  }, [params.transaction_code]);

  function rupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  function formatDate(value: string | null) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function statusClass(status: string) {
    if (status === "paid") return "bg-green-100 text-green-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "failed") return "bg-red-100 text-red-700";
    if (status === "expired") return "bg-gray-100 text-gray-700";
    if (status === "refunded") return "bg-blue-100 text-blue-700";

    return "bg-gray-100 text-gray-700";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-center text-gray-500">Memuat halaman pembayaran...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Transaksi Tidak Ditemukan
          </h1>
          <p className="mt-2 text-gray-500">
            Link pembayaran tidak valid atau transaksi sudah tidak tersedia.
          </p>
        </div>
      </div>
    );
  }

  const isPaid = payment.status === "paid";
  const isExpired = payment.status === "expired";
  const isFailed = payment.status === "failed";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Pembayaran
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {payment.merchant_name || "Merchant"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Kode Transaksi</p>
              <h2 className="font-semibold text-gray-900">
                {payment.transaction_code}
              </h2>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                payment.status
              )}`}
            >
              {payment.status}
            </span>
          </div>

          <div className="mb-6 rounded-xl bg-gray-50 p-5 text-center">
            <p className="text-sm text-gray-500">Total Pembayaran</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {rupiah(payment.amount)}
            </h2>
          </div>

          {payment.status === "pending" && (
            <>
              {payment.payment_method_type === "qris" && payment.qris_content && (
                <div className="text-center">
                  <p className="mb-4 text-sm font-semibold text-gray-700">
                    Scan QRIS untuk membayar
                  </p>

                  <div className="mx-auto flex w-fit rounded-2xl border border-gray-200 bg-white p-4">
                    <QRCodeSVG value={payment.qris_content} size={240} />
                  </div>

                  <p className="mt-4 break-all rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
                    {payment.qris_content}
                  </p>
                </div>
              )}

              {payment.payment_method_type === "va" && (
                <div className="space-y-4">
                  <Info label="Bank" value={payment.bank_code || "-"} />
                  <Info label="Nomor Virtual Account" value={payment.va_number || "-"} />

                  <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                    Silakan transfer sesuai nominal ke nomor VA di atas sebelum waktu expired.
                  </div>
                </div>
              )}

              {payment.payment_method_type === "ft" && (
                <div className="space-y-4">
                  <Info label="Nomor Rekening" value={payment.ft_account_number || "-"} />
                  <Info label="Nama Rekening" value={payment.ft_account_name || "-"} />
                  <Info label="Bank" value={payment.bank_code || "-"} />

                  <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                    Silakan transfer sesuai nominal ke rekening tujuan di atas.
                  </div>
                </div>
              )}

              {!["qris", "va", "ft"].includes(payment.payment_method_type || "") && (
                <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
                  Metode pembayaran belum dikenali.
                </div>
              )}
            </>
          )}

          {isPaid && (
            <div className="rounded-xl bg-green-50 p-5 text-center text-green-700">
              <h3 className="font-bold">Pembayaran Berhasil</h3>
              <p className="mt-1 text-sm">
                Transaksi ini sudah dibayar pada {formatDate(payment.paid_at)}.
              </p>
            </div>
          )}

          {isExpired && (
            <div className="rounded-xl bg-gray-100 p-5 text-center text-gray-700">
              <h3 className="font-bold">Transaksi Expired</h3>
              <p className="mt-1 text-sm">
                Silakan buat transaksi baru melalui merchant.
              </p>
            </div>
          )}

          {isFailed && (
            <div className="rounded-xl bg-red-50 p-5 text-center text-red-700">
              <h3 className="font-bold">Pembayaran Gagal</h3>
              <p className="mt-1 text-sm">
                Transaksi ini gagal diproses.
              </p>
            </div>
          )}

          <div className="mt-6 border-t border-gray-100 pt-5">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <Info label="Metode Pembayaran" value={payment.payment_method_name || "-"} />
              <Info label="Customer" value={payment.customer_name || "-"} />
              <Info label="Email" value={payment.customer_email || "-"} />
              <Info label="Expired At" value={formatDate(payment.expired_at)} />
            </div>
          </div>

          <button
            onClick={fetchPayment}
            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Cek Status Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 break-all font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}