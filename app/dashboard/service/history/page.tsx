"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Smartphone, 
  Wrench, 
  Plus, 
  Layers, 
  RefreshCw, 
  History, 
  ShieldCheck,
  Search,
  Sparkles,
  HelpCircle,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeviceHistoryQueryResult } from "@/types/device-history"
import { getDeviceHistoryByIMEI, DEVICE_HISTORY_PRESETS } from "@/lib/device-history-service"
import { DeviceHistorySearch } from "@/components/devices/device-history-search"
import { DeviceHistoryHeader } from "@/components/devices/device-history-header"
import { DeviceHistoryTimeline } from "@/components/devices/device-history-timeline"
import { DeviceHistoryReportModal } from "@/components/devices/device-history-report-modal"

function DeviceHistoryContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const imeiParam = searchParams.get("imei")

  const [currentImei, setCurrentImei] = useState<string>(imeiParam || "359102948576102")
  const [historyResult, setHistoryResult] = useState<DeviceHistoryQueryResult | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false)

  // IMEI Sorgulama
  const fetchHistory = useCallback(async (imeiToQuery: string) => {
    setIsLoading(true)
    try {
      const data = await getDeviceHistoryByIMEI(imeiToQuery)
      setHistoryResult(data)
      setCurrentImei(imeiToQuery)
    } catch (err) {
      console.warn("IMEI sorgulama hatası:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const initialImei = imeiParam || "359102948576102"
    fetchHistory(initialImei)
  }, [imeiParam, fetchHistory])

  const handleSearchSubmit = (searchedImei: string) => {
    router.push(`/dashboard/service/history?imei=${searchedImei}`)
    fetchHistory(searchedImei)
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. ÜST GEZİNME VE BAŞLIK ŞERİDİ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <Link
            href="/dashboard/service"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-medium transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Teknik Servis Panosuna Dön
          </Link>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <History className="w-6 h-6 text-cyan-400" />
              <span>Cihaz Geçmişi & IMEI Zaman Çizelgesi</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 uppercase">
              Gün 25
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Bir cihazın IMEI numarası üzerinden dükkanda gördüğü tüm alım, satım, servis ve garanti işlemlerini takip edin.
          </p>
        </div>

        {/* Hızlı Eylemler */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link href="/dashboard/service">
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 bg-slate-900 text-slate-200 hover:text-white text-xs gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Kanban Panosu
            </Button>
          </Link>

          <Link href="/dashboard/service/new">
            <Button
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-cyan-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Yeni Servis Kaydı
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. IMEI ARAMA VE SEÇİM BİLEŞENİ */}
      <DeviceHistorySearch
        currentImei={currentImei}
        onSearch={handleSearchSubmit}
        isLoading={isLoading}
      />

      {/* 3. YÜKLENİYOR VEYA SONUÇ GÖRÜNÜMÜ */}
      {isLoading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3 bg-slate-900/60 rounded-2xl border border-slate-800 p-8">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-semibold text-slate-200">
            IMEI ({currentImei}) veritabanında taranıyor...
          </p>
          <p className="text-xs text-slate-500">
            Alış faturaları, satış fişleri ve servis biletleri taranıyor.
          </p>
        </div>
      ) : historyResult ? (
        <div className="space-y-6">
          {/* Cihaz Künye & İstatistik Kartı */}
          <DeviceHistoryHeader
            device={historyResult.device}
            onPrintReport={() => setIsReportModalOpen(true)}
          />

          {/* İnteraktif Dikey Zaman Çizelgesi */}
          <DeviceHistoryTimeline
            events={historyResult.events}
          />

          {/* Yazdırılabilir Resmi Ekspertiz & Geçmiş Raporu Modalı */}
          <DeviceHistoryReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            device={historyResult.device}
            events={historyResult.events}
          />
        </div>
      ) : (
        /* Bulunamadı Boş Durum */
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center space-y-4">
          <Smartphone className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Bu IMEI İçin Kayıt Bulunamadı</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Girdiğiniz IMEI ({currentImei}) ile eşleşen bir mağaza alımı, satışı veya servis kaydı mevcut değil.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Link href="/dashboard/service/new">
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs gap-1.5 font-bold">
                <Plus className="w-3.5 h-3.5" />
                Bu Cihaz İçin Yeni Servis Kaydı Aç
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ServiceHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-slate-400">Cihaz geçmiş modülü yükleniyor...</p>
        </div>
      }
    >
      <DeviceHistoryContent />
    </Suspense>
  )
}
