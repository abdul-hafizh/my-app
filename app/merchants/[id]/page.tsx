"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Merchant = {
  id: number;
  merchant_code: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  status: "pending" | "active" | "suspended" | "rejected";
  business_type: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  available_balance: number;
  pending_balance: number;
  total_withdrawn: number;
};

export default function MerchantDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Merchant | null>(null);

  useEffect(() => {
    async function fetchMerchant() {
      const res = await fetch(`/api/merchants/${params.id}`);
      const json = await res.json();

      if (!json.success) {
        alert(json.message || "Merchant tidak ditemukan");
        router.push("/merchants");
        return;
      }

      setForm(json.data);
      setLoading(false);
    }

    fetchMerchant();
  }, [params.id, router]);

  function rupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value || 0);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    if (!form) return;

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    setSaving(true);

    const res = await fetch(`/api/merchants/${form.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const json = await res.json();

    setSaving(false);

    if (!json.success) {
      alert(json.message || "Gagal update merchant");
      return;
    }

    alert("Merchant berhasil diperbarui");
    router.push("/merchants");
    router.refresh();
  }

  if (loading || !form) {
    return <p className="text-gray-500">Memuat data merchant...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Detail Merchant
          </h1>
          <p className="mt-2 text-gray-500">
            {form.merchant_code} - {form.business_name}
          </p>
        </div>

        <button
          onClick={() => router.push("/merchants")}
          className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Kembali
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Saldo Tersedia</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {rupiah(form.available_balance)}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Saldo Pending</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {rupiah(form.pending_balance)}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Dicairkan</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {rupiah(form.total_withdrawn)}
          </h2>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Informasi Merchant
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Kode Merchant
            </label>
            <input
              value={form.merchant_code}
              disabled
              className="input w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="input w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nama Bisnis
            </label>
            <input
              name="business_name"
              value={form.business_name || ""}
              onChange={handleChange}
              className="input w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nama Pemilik
            </label>
            <input
              name="owner_name"
              value={form.owner_name || ""}
              onChange={handleChange}
              className="input w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              className="input w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              No. HP
            </label>
            <input
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              className="input w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Jenis Usaha
            </label>
            <input
              name="business_type"
              value={form.business_type || ""}
              onChange={handleChange}
              className="input w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Kota
            </label>
            <input
              name="city"
              value={form.city || ""}
              onChange={handleChange}
              className="input w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Provinsi
            </label>
            <input
              name="province"
              value={form.province || ""}
              onChange={handleChange}
              className="input w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Kode Pos
            </label>
            <input
              name="postal_code"
              value={form.postal_code || ""}
              onChange={handleChange}
              className="input w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Alamat
            </label>
            <textarea
              name="address"
              value={form.address || ""}
              onChange={handleChange}
              className="input min-h-28 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/merchants")}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}