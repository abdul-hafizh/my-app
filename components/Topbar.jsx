export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="flex h-full items-center justify-between px-8">
        <div>
          <p className="text-sm text-gray-400">Welcome back,</p>
          <h2 className="font-semibold text-gray-800">Administrator</h2>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Notifikasi
          </button>

          <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}