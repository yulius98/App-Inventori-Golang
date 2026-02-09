import React, { useCallback, useEffect, useRef, useState } from "react"
import ApexCharts from "apexcharts"
import Api from "../service/Api"
import TopBar from "../components/TopBar"
import { SideBar } from "../components/SideBar"
import { ChartBarIcon, CircleStackIcon } from "@heroicons/react/24/outline"

const BAR_CHART_MAX_HEIGHT = 200
const BAR_CHART_MIN_HEIGHT = 24

const DashboardAdminPage = () => {
  const [serieskategori, setSeriesKategori] = useState([])
  const [labelskategori, setLabelsKategori] = useState([])
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  const [chartData, setChartData] = useState([])
  const [labelsPenjualan, setLabelsPenjualan] = useState([])

  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [tooltipContent, setTooltipContent] = useState("")
  const [tooltipX, setTooltipX] = useState(0)
  const [tooltipY, setTooltipY] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPenjualan = async () => {
      try {
        const response = await Api.get(`/penjualan/`)
        const data = response.data.data || []
        setChartData(data.map((item) => item.total_qty))
        setLabelsPenjualan(data.map((item) => item.produk))
        setLoading(false)
      } catch {
        setError("Gagal mengambil data penjualan")
        setLoading(false)
      }
    }
    fetchPenjualan()
  }, [])

  const showTooltip = (e, value) => {
    const rect = e.target.getBoundingClientRect()
    setTooltipContent(value)
    setTooltipX(rect.left + rect.width / 2)
    setTooltipY(rect.height + 10)
    setTooltipOpen(true)
  }

  const hideTooltip = () => {
    setTooltipOpen(false)
    setTooltipContent("")
    setTooltipX(0)
    setTooltipY(0)
  }

  const getCssVar = (name, fallback) => {
    const style = getComputedStyle(document.documentElement)
    return style.getPropertyValue(name).trim() || fallback
  }

  const brandColor = getCssVar("--color-fg-brand", "#2563eb")
  const brandSecondaryColor = getCssVar("--color-fg-brand-subtle", "#60a5fa")
  const brandTertiaryColor = getCssVar("--color-fg-brand-strong", "#1d4ed8")
  const neutralPrimaryColor = getCssVar("--color-neutral-primary", "#ffffff")

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await Api.get(`/kategori/total-barang`)
        const chartData = res.data?.data || []
        setLabelsKategori(chartData.map((item) => item.kategori))
        setSeriesKategori(chartData.map((item) => item.total_produk))
      } catch (err) {
        console.error("Gagal mengambil data grafik:", err)
      }
    }
    fetchChartData()
  }, [])

  const getChartOptions = useCallback(
    () => ({
      series: serieskategori,
      labels: labelskategori,
      colors: [brandColor, brandSecondaryColor, brandTertiaryColor, "#93c5fd", "#1e40af"],
      chart: {
        type: "pie",
        height: 320,
        fontFamily: "Inter, system-ui, sans-serif",
      },
      stroke: {
        colors: [neutralPrimaryColor],
        width: 2,
      },
      plotOptions: {
        pie: {
          dataLabels: { offset: -16 },
          donut: { labels: { show: false } },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${Math.round(val)}%`,
        style: { fontSize: "12px" },
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "13px",
        itemMargin: { horizontal: 12, vertical: 6 },
      },
    }),
    [
      serieskategori,
      labelskategori,
      brandColor,
      brandSecondaryColor,
      brandTertiaryColor,
      neutralPrimaryColor,
    ]
  )

  useEffect(() => {
    if (!chartRef.current || serieskategori.length === 0) return
    if (chartInstance.current) chartInstance.current.destroy()
    chartInstance.current = new ApexCharts(chartRef.current, getChartOptions())
    chartInstance.current.render()
    return () => {
      if (chartInstance.current) chartInstance.current.destroy()
    }
  }, [serieskategori, labelskategori, getChartOptions])

  const maxQty = Math.max(...chartData, 1)
  const barHeight = (val) => {
    const pct = maxQty > 0 ? val / maxQty : 0
    const h = pct * (BAR_CHART_MAX_HEIGHT - BAR_CHART_MIN_HEIGHT) + BAR_CHART_MIN_HEIGHT
    return Math.round(h)
  }

  if (loading) {
    return (
      <div className="flex">
        <SideBar />
        <div className="flex-1" style={{ marginLeft: "200px", marginTop: "64px" }}>
          <TopBar />
          <div className="min-h-screen bg-slate-50/80 dark:bg-gray-900 flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-slate-300 dark:border-gray-600 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-slate-600 dark:text-gray-300 font-medium">Memuat dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex">
        <SideBar />
        <div className="flex-1" style={{ marginLeft: "200px", marginTop: "64px" }}>
          <TopBar />
          <div className="min-h-screen bg-slate-50/80 dark:bg-gray-900 flex items-center justify-center p-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-red-100 dark:border-red-900 p-8 max-w-md text-center">
              <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
              <p className="text-slate-500 dark:text-gray-400 text-sm mt-2">Periksa koneksi atau coba lagi nanti.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <SideBar />
      <div className="flex-1" style={{ marginLeft: "200px", marginTop: "64px" }}>
        <TopBar />
        <div className="min-h-screen bg-slate-50/80 dark:bg-gray-900 p-6 md:p-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-gray-100 tracking-tight">
              Dashboard
            </h1>
            <p className="mt-1 text-slate-500 dark:text-gray-400 text-sm md:text-base">
              Ringkasan kategori dan penjualan bulan{" "}
              {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </p>
          </header>

          {/* Cards grid - proporsi 1:1 di desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl">
            {/* Card Kategori - Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-gray-700 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <CircleStackIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-gray-100">Stok per Kategori</h2>
                  <p className="text-sm text-slate-500 dark:text-gray-400">Distribusi barang menurut kategori</p>
                </div>
              </div>
              <div className="p-6 flex-1 flex items-center justify-center min-h-[320px]">
                <div ref={chartRef} className="w-full max-w-[320px] mx-auto" />
              </div>
            </div>

            {/* Card Penjualan - Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-gray-700 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <ChartBarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-gray-100">Penjualan per Produk</h2>
                  <p className="text-sm text-slate-500 dark:text-gray-400">Qty terjual bulan ini</p>
                </div>
              </div>
              <div className="p-6 flex-1 min-h-[320px] flex flex-col justify-end">
                <div className="relative my-4" style={{ minHeight: BAR_CHART_MAX_HEIGHT + 80 }}>
                  {tooltipOpen && (
                    <div
                      className="z-10 absolute bg-slate-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl whitespace-nowrap"
                      style={{
                        left: tooltipX,
                        bottom: tooltipY,
                        transform: "translate(-50%, 0)",
                      }}
                    >
                      <span className="font-semibold">Qty: {tooltipContent}</span>
                    </div>
                  )}

                  <div
                    className="flex gap-2 md:gap-3 items-end w-full h-52"
                    style={{ height: BAR_CHART_MAX_HEIGHT + 8 }}
                  >
                    {chartData.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-gray-500 text-sm py-8">
                        Belum ada data penjualan
                      </div>
                    ) : (
                      chartData.map((val, i) => (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center justify-end min-w-0"
                        >
                          <span className="text-xs font-medium text-slate-600 dark:text-gray-400 mb-1 truncate w-full text-center">
                            {val}
                          </span>
                          <div
                            style={{ height: `${barHeight(val)}px` }}
                            className="w-full max-w-[56px] rounded-t-lg bg-linear-to-t from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all duration-200 cursor-default"
                            onMouseEnter={(e) => showTooltip(e, val)}
                            onMouseLeave={hideTooltip}
                          />
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-slate-200 dark:border-gray-600 mt-4 pt-3">
                    <div className="flex gap-2 md:gap-3">
                      {labelsPenjualan.map((label, i) => (
                        <div
                          key={i}
                          className="flex-1 text-center min-w-0 text-xs text-slate-600 dark:text-gray-400 truncate"
                          title={label}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardAdminPage
