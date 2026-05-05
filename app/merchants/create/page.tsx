"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateMerchantPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "payment">("info");

  const [form, setForm] = useState({
    business_name: "",
    owner_name: "",
    email: "",
    phone: "",
    password: "",
    business_type: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",

    bank_name: "",
    bank_code: "",
    account_number: "",
    account_name: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch("/api/merchants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok || !json?.success) {
        alert(json?.message || `Gagal menambahkan merchant. HTTP ${res.status}`);
        return;
      }

      alert("Merchant berhasil ditambahkan");
      router.push("/merchants");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi error";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tambah Merchant</h1>
        <p className="mt-2 text-gray-500">
          Tambahkan data merchant baru ke platform payment gateway.
        </p>
      </div>

      <div className="mb-6 flex gap-2 rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            activeTab === "info"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Info Umum
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payment")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            activeTab === "payment"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Metode Pembayaran
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >

        {activeTab === "info" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nama Bisnis
                </label>
                <input
                  name="business_name"
                  value={form.business_name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Contoh: Toko Berkah Jaya"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nama Pemilik
                </label>
                <input
                  name="owner_name"
                  value={form.owner_name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Nama pemilik usaha"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="merchant@email.com"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  No. HP
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Password login merchant"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Jenis Usaha
                </label>
                <input
                  name="business_type"
                  value={form.business_type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Retail, F&B, Jasa, Online Shop"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Kota
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Jakarta"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Provinsi
                </label>
                <input
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="DKI Jakarta"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Kode Pos
                </label>
                <input
                  name="postal_code"
                  value={form.postal_code}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="12345"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Alamat Usaha
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="min-h-28 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Alamat lengkap usaha"
                />
              </div>
            </div>            
          </div>
        )}

        {activeTab === "payment" && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nama Bank
              </label>
              <input
                name="bank_name"
                value={form.bank_name || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Contoh: BCA"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Kode Bank
              </label>
              <input
                name="bank_code"
                value={form.bank_code || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Contoh: 014"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nomor Rekening
              </label>
              <input
                name="account_number"
                value={form.account_number || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Nomor rekening merchant"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nama Pemilik Rekening
              </label>
              <input
                name="account_name"
                value={form.account_name || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Nama sesuai rekening"
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/merchants")}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan Merchant"}
          </button>
        </div>

      </form>
    </div>
  );
}