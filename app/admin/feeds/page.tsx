"use client"
import { useState } from "react"
import { Search, Plus, Play, Pause, RefreshCw, FileText, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

const mockFeeds = [
  { id: 1, name: "Alza.sk - Hlavný feed", url: "https://alza.sk/feed.xml", type: "xml", active: true, last_run: "2024-01-02 14:30", status: "success", products: 12450 },
  { id: 2, name: "Mall.sk - Elektronika", url: "https://mall.sk/products.xml", type: "xml", active: true, last_run: "2024-01-02 14:15", status: "success", products: 8920 },
  { id: 3, name: "Datart - CSV export", url: "https://datart.sk/export.csv", type: "csv", active: false, last_run: "2024-01-01 09:00", status: "error", products: 0 },
  { id: 4, name: "Heureka feed", url: "https://heureka.sk/feed.xml", type: "xml", active: true, last_run: "2024-01-02 14:00", status: "running", products: 5670 },
]

export default function FeedsPage() {
  const [feeds] = useState(mockFeeds)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case "error": return <XCircle className="h-5 w-5 text-red-500" />
      case "running": return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      default: return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">XML/CSV Feedy</h1>
          <p className="text-gray-500 mt-1">{feeds.length} nakonfigurovaných feedov</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Spustiť všetky</Button>
          <Link href="/admin/feeds/new"><Button><Plus className="h-4 w-4 mr-2" />Pridať feed</Button></Link>
        </div>
      </div>

      <div className="grid gap-4">
        {feeds.map((feed) => (
          <div key={feed.id} className={cn("bg-white rounded-xl border p-5 hover:shadow-lg transition-all", feed.active ? "border-gray-200" : "border-gray-200 bg-gray-50")}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", feed.type === "xml" ? "bg-blue-100" : "bg-green-100")}>
                  <FileText className={cn("h-6 w-6", feed.type === "xml" ? "text-blue-600" : "text-green-600")} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{feed.name}</h3>
                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium uppercase", feed.type === "xml" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700")}>{feed.type}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 truncate max-w-md">{feed.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusIcon(feed.status)}
                <Button size="icon" variant="ghost" className={cn(feed.active ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700")}>
                  {feed.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-4 pt-4 border-t border-gray-100">
              <div><p className="text-xs text-gray-500 uppercase">Posledný import</p><p className="font-medium text-gray-900 mt-0.5">{feed.last_run}</p></div>
              <div><p className="text-xs text-gray-500 uppercase">Produkty</p><p className="font-medium text-gray-900 mt-0.5">{feed.products.toLocaleString()}</p></div>
              <div><p className="text-xs text-gray-500 uppercase">Stav</p><p className={cn("font-medium mt-0.5", feed.status === "success" ? "text-emerald-600" : feed.status === "error" ? "text-red-600" : "text-blue-600")}>{feed.status === "success" ? "Úspešný" : feed.status === "error" ? "Chyba" : "Prebieha..."}</p></div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm"><Play className="h-4 w-4 mr-1" />Spustiť teraz</Button>
              <Link href={`/admin/feeds/${feed.id}`}><Button variant="outline" size="sm">Nastavenia</Button></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
