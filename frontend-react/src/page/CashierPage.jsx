import React, { useState, useEffect, useRef } from "react";
import TopBarKasir from "../components/TopBarKasir";
import Api from "../service/Api";

const CashierPage = () => {
  const [error, setError] = useState("");
  const [stok, setStok] = useState([]);
  const [stokBelanja, setStokBelanja] = useState([]);
  const [totalStok, setTotalStok] = useState(0);
  const [, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [pageBelanja] = useState(1);
  const [limit, setLimit] = useState(5);
  const [limitBelanja] = useState(50);
  const [keyword, setKeyword] = useState("");
  const [metode_pembayaran, setMetodePembayaran] = useState("");
  const [jumlahTunai, setJumlahTunai] = useState("");
  /** Data struk yang akan dicetak (di-set setelah bayar sukses) */
  const [strukData, setStrukData] = useState(null);

  const fetchStokRef = useRef();
  const fetchBelanjaRef = useRef();
  const searchTimeout = useRef();

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // bulan dimulai dari 0
  const dd = String(today.getDate()).padStart(2, "0");

  const formattedDate = `${yyyy}-${mm}-${dd}`;

  const searchStok = async (keyword) => {
    try {
      const res = await Api.get(`/kasir/search?produk=${keyword}`);
      console.log("Hasil search:", res.data);
      setStok(res.data || []);
      setTotalStok(res.data.total || 0);
      setTotalPage(res.data.totalPages || 1);
      setError("");
    } catch {
      setError("Gagal mencari produk");
    }
  };

  const handleMetodePembayaranChange = (event) => {
    const metode = event.target.value;
    setMetodePembayaran(metode);
    if (metode !== "tunai") {
      setJumlahTunai("");
    }
  };

  const handleJumlahTunaiChange = (event) => {
    const raw = event.target.value.replace(/\D/g, "");
    setJumlahTunai(raw);
  };

  // SEARCH
  const handleSearch = async (keyword) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setKeyword(keyword);
    searchTimeout.current = setTimeout(() => {
      if (keyword !== "") {
        searchStok(keyword);
      } else {
        // Jika kosong, tampilkan data default
        if (fetchStokRef.current) fetchStokRef.current();
      }
    }, 500);
  };

  // Add Stok
  const handleAdd = async (id_kategori, id_produk, jumlah) => {
    try {
      const dataToSend = {
        tgl_trx: formattedDate,
        id_produk: id_produk,
        id_kategori: id_kategori,
        movement_type: "OUT",
        status: "pending",
        quantity: jumlah,
        user_name: localStorage.getItem("user_name"),
      };
      console.log("data yang dikirim :", dataToSend);
      await Api.post(`/stok`, dataToSend);

      if (fetchStokRef.current) fetchStokRef.current();
      if (fetchBelanjaRef.current) fetchBelanjaRef.current();
    } catch {
      setError("Gagal tambah stok");
    }
  };

  // DELETE
  const handleHapus = async (id) => {
    //console.log("Id barang yang dihapus : ", id)
    if (!window.confirm("Yakin hapus data ini?")) return;
    try {
      await Api.delete(`/stok/${id}`);

      if (fetchBelanjaRef.current) fetchBelanjaRef.current();
      if (fetchStokRef.current) fetchStokRef.current();
    } catch {
      setError("Gagal menghapus belanja");
    }
  };

  // BAYAR: proses pembayaran lalu cetak struk
  const handleBayar = async () => {
    const user = localStorage.getItem("user_name") || "";
    const totalHarga = stokBelanja.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tunaiVal = Number(jumlahTunai) || 0;
    const kembalianVal = Math.max(0, tunaiVal - totalHarga);
    const dataStruk = {
      items: stokBelanja.map((i) => ({
        produk: i.produk,
        qty: i.quantity,
        price: i.price,
        subtotal: i.price * i.quantity,
      })),
      total: totalHarga,
      metode: metode_pembayaran,
      tunai: metode_pembayaran === "tunai" ? tunaiVal : null,
      kembalian: metode_pembayaran === "tunai" ? kembalianVal : null,
      date: new Date(),
      kasir: user,
    };

    try {
      await Api.put(`/kasir/bayar/${user}`);
      setMetodePembayaran("");
      setJumlahTunai("");
      setError("");
      setStrukData(dataStruk);
      if (fetchStokRef.current) fetchStokRef.current();
      if (fetchBelanjaRef.current) fetchBelanjaRef.current();
    } catch {
      setError("Gagal melakukan pembayaran");
    }
  };

  const handleJumlahChange = (id_produk, jumlah) => {
    setStok((prevStok) =>
      prevStok.map((item) =>
        item.id_produk === id_produk
          ? { ...item, jumlah: parseInt(jumlah) }
          : item,
      ),
    );
  };

  useEffect(() => {
    let isMounted = true;
    const fetchStok = async () => {
      try {
        const stok = await Api.get(`/kasir?page=${page}&limit=${limit}`);

        if (!isMounted) return;
        setStok(stok.data.data || []);
        setTotalStok(stok.data.total);
        setTotalPage(stok.data.totalPages);
        setError("");
      } catch {
        if (isMounted) {
          setError("Gagal menampilkan Daftar Produk");
        }
      }
    };
    fetchStokRef.current = fetchStok;
    fetchStok();

    return () => {
      isMounted = false;
    };
  }, [page, limit]);

  // keranjang Belanja
  useEffect(() => {
    let isMounted = true;
    const fetchBelanja = async () => {
      try {
        const belanja = await Api.get(
          `/belanja/user/${localStorage.getItem("user_name")}?page=${pageBelanja}&limit=${limitBelanja}`,
        );
        console.log("data belanja : ", belanja.data);
        if (!isMounted) return;
        setStokBelanja(belanja.data.data || []);
        setError("");
      } catch {
        if (isMounted) {
          setError("Gagal menampilkan Daftar Belanja");
        }
      }
    };
    fetchBelanjaRef.current = fetchBelanja;
    fetchBelanja();

    return () => {
      isMounted = false;
    };
  }, [pageBelanja, limitBelanja]);

  // Setelah bayar sukses: buka dialog print struk, lalu bersihkan
  useEffect(() => {
    if (!strukData) return;
    const onAfterPrint = () => {
      setStrukData(null);
      window.removeEventListener("afterprint", onAfterPrint);
    };
    window.addEventListener("afterprint", onAfterPrint);
    const timer = setTimeout(() => window.print(), 150);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, [strukData]);

  // Hitung total harga
  const totalPrice = stokBelanja.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);
  const jumlahTunaiValue = Number(jumlahTunai) || 0;
  const isTunaiInvalid =
    metode_pembayaran === "tunai" && jumlahTunaiValue < totalPrice;
  const kembalian = Math.max(0, jumlahTunaiValue - totalPrice);
  const formattedJumlahTunai = jumlahTunai
    ? `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(jumlahTunaiValue)}`
    : "";
  const formattedKembalian = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(kembalian);

  return (
    <>
      {/* Area struk: hanya tampil saat print */}
      {strukData && (
        <div
          className="hidden print:block p-6 max-w-[80mm] mx-auto bg-white text-black text-sm"
          style={{ fontFamily: "monospace" }}
        >
          <div className="text-center border-b border-black pb-2 mb-3">
            <p className="font-bold text-base">STRUK BELANJA</p>
            <p>{strukData.date.toLocaleString("id-ID")}</p>
            <p>Kasir: {strukData.kasir}</p>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left py-1">Barang</th>
                <th className="text-center py-1 w-8">Qty</th>
                <th className="text-right py-1">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {strukData.items.map((row, i) => (
                <tr key={i} className="border-b border-gray-300">
                  <td className="py-1">{row.produk}</td>
                  <td className="text-center py-1">{row.qty}</td>
                  <td className="text-right py-1">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(row.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 pt-2 border-t-2 border-black space-y-1">
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-semibold">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(strukData.total)}
              </span>
            </div>
            {strukData.metode === "tunai" && (
              <>
                <div className="flex justify-between">
                  <span>Tunai</span>
                  <span>
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(strukData.tunai)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kembalian</span>
                  <span>
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(strukData.kembalian)}
                  </span>
                </div>
              </>
            )}
            {strukData.metode === "nontunai" && (
              <div className="flex justify-between">
                <span>Metode</span>
                <span>Non-Tunai</span>
              </div>
            )}
          </div>
          <p className="text-center mt-4 text-xs">Terima kasih</p>
        </div>
      )}

      <div className="min-h-screen bg-slate-50 pt-16 print:hidden">
      <TopBarKasir />
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* Baris: Cari + Total */}
        <div className=" fixed flex flex-col sm:flex-row gap-36 mb-6">
          <div className="flex-1">
            <input
              id="search-produk"
              type="text"
              placeholder="Cari produk..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-80 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition"
            />
          </div>
          <div className="shrink-0 w-1/2">
            <div className="bg-slate-800 text-emerald-400 rounded-xl px-5 py-4 text-right shadow-md">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-0.5">
                Total Belanja
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(totalPrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Grid: Daftar Produk (lebih lebar) | Keranjang (lebih sempit) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0">
          {/* Kolom Daftar Produk - 3/5 */}
          <div className="lg:col-span-3 flex flex-col min-h-0 mt-25">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">
                  Daftar Produk
                </h2>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm" id="tabel_produk">
                    <thead>
                      <tr className="bg-slate-700 text-white">
                        <th className="text-left py-3 px-4 font-medium rounded-tl-xl">
                          No
                        </th>
                        <th className="text-left py-3 px-4 font-medium">
                          Nama Produk
                        </th>
                        <th className="text-center py-3 px-4 font-medium w-16">
                          Stok
                        </th>
                        <th className="text-right py-3 px-4 font-medium">
                          Harga
                        </th>
                        <th className="text-center py-3 px-4 font-medium w-24">
                          Jumlah
                        </th>
                        <th className="text-center py-3 px-4 font-medium w-24 rounded-tr-xl">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stok.map((item, nourut) => (
                        <tr
                          key={nourut}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="py-3 px-4 text-slate-600">
                            {nourut + 1}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {item.produk}
                          </td>
                          <td className="py-3 px-4 text-center text-slate-600">
                            {item.total_stock}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums text-slate-700">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(item.price)}
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min="1"
                              max={item.total_stock}
                              className="w-full max-w-20 mx-auto block px-2 py-1.5 rounded-lg border border-slate-200 text-center text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              value={item.jumlah || ""}
                              onChange={(e) =>
                                handleJumlahChange(
                                  item.id_produk,
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition shadow-sm"
                              onClick={() => {
                                handleAdd(
                                  item.id_kategori,
                                  item.id_produk,
                                  item.jumlah,
                                );
                              }}
                            >
                              Beli
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Sebelumnya
                    </button>
                    <span className="text-sm text-slate-600">
                      Halaman {page} / {Math.ceil(totalStok / limit) || 1}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      onClick={() =>
                        setPage((p) => (p * limit < totalStok ? p + 1 : p))
                      }
                      disabled={page * limit >= totalStok}
                    >
                      Selanjutnya
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-slate-600">
                      Per halaman:
                    </label>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      {[5, 10, 20, 50].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm text-slate-500">
                      Total: {totalStok}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Keranjang & Pembayaran - 2/5 */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">
                  Daftar Belanja
                </h2>
              </div>
              <div className="flex-1 overflow-auto p-4 flex flex-col min-h-0">
                <div className="overflow-x-auto overflow-y-auto max-h-[200px] rounded-xl border border-slate-200 flex-1 min-h-0">
                  <table className="w-full text-sm" id="tabel_belanja">
                    <thead className="sticky top-0">
                      <tr className="bg-slate-700 text-white">
                        <th className="text-left py-3 px-3 font-medium rounded-tl-xl">
                          No
                        </th>
                        <th className="text-left py-3 px-3 font-medium">
                          Produk
                        </th>
                        <th className="text-center py-3 px-3 font-medium w-14">
                          Qty
                        </th>
                        <th className="text-right py-3 px-3 font-medium">
                          Harga
                        </th>
                        <th className="text-center py-3 px-3 font-medium w-20 rounded-tr-xl">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stokBelanja.map((item, nourut) => (
                        <tr
                          key={nourut}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="py-2.5 px-3 text-slate-600">
                            {nourut + 1}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {item.produk}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(item.price * item.quantity)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium transition"
                              onClick={() => handleHapus(item.id)}
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

                {/* Total & Pembayaran */}
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                  <div className="flex justify-between items-center text-base font-semibold text-slate-800">
                    <span>Total</span>
                    <span className="tabular-nums">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(totalPrice)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label
                      htmlFor="metode_pembayaran"
                      className="text-sm font-medium text-slate-700 shrink-0"
                    >
                      Metode Pembayaran
                    </label>
                    <select
                      id="metode_pembayaran"
                      name="metode_pembayaran"
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                      required
                      value={metode_pembayaran}
                      onChange={handleMetodePembayaranChange}
                    >
                      <option value="">— Pilih —</option>
                      <option value="tunai">Tunai</option>
                      <option value="nontunai">Non-Tunai</option>
                    </select>
                  </div>

                  {metode_pembayaran === "tunai" && (
                    <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <label
                          htmlFor="jumlah_tunai"
                          className="block text-sm font-medium text-slate-700 mb-1"
                        >
                          Jumlah Tunai
                        </label>
                        <input
                          type="text"
                          id="jumlah_tunai"
                          name="jumlah_tunai"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          inputMode="numeric"
                          value={formattedJumlahTunai}
                          onChange={handleJumlahTunaiChange}
                        />
                        {isTunaiInvalid && (
                          <p className="mt-1 text-xs text-red-600">
                            Jumlah tunai minimal sama dengan total.
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="kembalian"
                          className="block text-sm font-medium text-slate-700 mb-1"
                        >
                          Kembalian
                        </label>
                        <input
                          type="text"
                          id="kembalian"
                          name="kembalian"
                          className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
                          readOnly
                          value={formattedKembalian}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                    disabled={isTunaiInvalid}
                    onClick={handleBayar}
                  >
                    Bayar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CashierPage;
