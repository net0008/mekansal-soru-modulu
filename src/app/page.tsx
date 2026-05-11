"use client";
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

// LİSANS BİLGİSİ
const LICENSE_OWNER = "Hasbi ERDOĞMUŞ";
const LICENSE_URL = "hasbierdogmus.com.tr";

interface CatalogItem {
  Konu_Basligi: string;
  Harita_Link: string;
  Sheet_ID: string;
  Kategori: string;
  GID?: string;
}

export default function MSM_Dashboard() {
  const [config, setConfig] = useState({ map: '', sheet: '', gid: '0' });
  const [catalogId, setCatalogId] = useState('');
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchCatalog = () => {
    if (!catalogId) return;
    setIsLoading(true);
    const csvUrl = `https://docs.google.com/spreadsheets/d/${catalogId}/export?format=csv`;

    Papa.parse(csvUrl, {
      download: true,
      header: true,
      complete: (results) => {
        setCatalogItems(results.data as CatalogItem[]);
        setIsLoading(false);
      },
      error: () => {
        alert("Katalog yüklenemedi. ID'yi ve paylaşım ayarlarını kontrol edin.");
        setIsLoading(false);
      }
    });
  };

  const selectFromCatalog = (item: CatalogItem) => {
    const gidValue = item.GID || '0';
    setConfig({ map: item.Harita_Link, sheet: item.Sheet_ID, gid: gidValue });
    const base = window.location.origin;
    setGeneratedUrl(`${base}/play?map=${encodeURIComponent(item.Harita_Link)}&sheet=${item.Sheet_ID}&gid=${gidValue}`);
  };

  const generateManual = () => {
    if (!config.map || !config.sheet) return;
    const base = window.location.origin;
    setGeneratedUrl(`${base}/play?map=${encodeURIComponent(config.map)}&sheet=${config.sheet}&gid=${config.gid}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-green-500 font-mono p-4 md:p-10">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8 border border-green-900/50 p-6 bg-black/40 backdrop-blur-md rounded-lg shadow-2xl">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-white">MSM DASHBOARD</h1>
            <p className="text-[10px] text-green-700 tracking-[0.3em] uppercase mt-1">Mekânsal Soru Modülü Yönetim Paneli</p>
          </div>
          <section className="space-y-4 p-4 border border-blue-900/30 bg-blue-950/10 rounded">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">Ders Arşivi Yükle</h2>
            <div className="flex gap-2">
              <input type="text" placeholder="Katalog Sheet ID..." className="flex-1 bg-transparent border-b border-blue-900 p-2 text-xs text-blue-100 outline-none" onChange={(e) => setCatalogId(e.target.value)} />
              <button onClick={fetchCatalog} className="bg-blue-900/20 border border-blue-800 px-4 py-2 text-[10px] font-bold">YÜKLE</button>
            </div>
          </section>
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-green-700 uppercase tracking-widest italic">Hızlı Modül Oluştur</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Harita URL" value={config.map} onChange={(e) => setConfig({...config, map: e.target.value})} className="w-full bg-transparent border-b border-green-900 p-2 text-xs outline-none" />
              <input type="text" placeholder="Sheet ID" value={config.sheet} onChange={(e) => setConfig({...config, sheet: e.target.value})} className="w-full bg-transparent border-b border-green-900 p-2 text-xs outline-none" />
              <button onClick={generateManual} className="w-full bg-green-600 text-black font-black py-3 uppercase">Modülü Başlat</button>
            </div>
          </section>
          {generatedUrl && (
            <div className="p-4 border border-dashed border-green-800 bg-green-950/10">
              <p className="text-[9px] uppercase text-green-700 mb-2">Yayın Linki Hazır:</p>
              <input readOnly value={generatedUrl} className="w-full bg-transparent text-[10px] text-green-300 mb-3" />
              <button onClick={() => window.open(generatedUrl)} className="text-xs font-bold underline uppercase">Sınıf Ekranına Aktar →</button>
            </div>
          )}
        </div>
        <div className="border border-green-900/50 p-6 bg-black/40 backdrop-blur-md rounded-lg flex flex-col">
          <h2 className="text-xs font-bold text-green-700 uppercase tracking-widest mb-6">Arşivlenmiş İçerikler</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoading ? <p className="text-xs animate-pulse">Yükleniyor...</p> : catalogItems.map((item, idx) => (
              <div key={idx} onClick={() => selectFromCatalog(item)} className="p-4 border border-slate-800 bg-slate-900/50 hover:border-green-500 cursor-pointer transition-all flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-green-800 uppercase font-bold">{item.Kategori}</p>
                  <h3 className="text-sm font-bold text-slate-200">{item.Konu_Basligi}</h3>
                </div>
                <span className="text-[10px] text-slate-700">SEÇ {'>'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <footer className="mt-10 border-t border-green-900/30 pt-6 flex flex-col items-center">
        <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest opacity-40 hover:opacity-100 transition-opacity">
          <span>{new Date().getFullYear()} © MEKÂNSAL SORU MODÜLÜ</span>
          <a href={`https://${LICENSE_URL}`} target="_blank" className="text-green-600 hover:underline">{LICENSE_OWNER}</a>
        </div>
      </footer>
    </div>
  );
}