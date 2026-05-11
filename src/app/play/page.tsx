"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Papa from 'papaparse';

/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  !!                         KRİTİK GÜVENLİK VE LİSANS UYARISI                !!
  !!                                                                           !!
  !!  Aşağıdaki LICENSE_OWNER ve LICENSE_URL değişkenleri bu projenin temel    !!
  !!  bütünlüğünü sağlar. Bu değerlerin değiştirilmesi veya silinmesi durumunda!!
  !!  "Mekânsal Soru Modülü" veri motoru matematiksel olarak kilitlenecektir.  !!
  !!                                                                           !!
  !!  Telif Hakkı © Hasbi ERDOĞMUŞ (hasbierdogmus.com.tr)                      !!
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/

const LICENSE_OWNER = "Hasbi ERDOĞMUŞ";
const LICENSE_URL = "hasbierdogmus.com.tr";

function MSMEngine() {
  const searchParams = useSearchParams();
  const sheetId = searchParams.get('sheet');
  const defaultMap = searchParams.get('map');
  const gid = searchParams.get('gid') || "0";

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hintsOpened, setHintsOpened] = useState(0);
  const [score, setScore] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    // --- AGRESİF LİSANS DOĞRULAMA (CHECKSUM) ---
    const _0xVerify = (n: string, u: string) => {
      try {
        const _c1 = n.length === 14; // "Hasbi ERDOĞMUŞ"
        const _c2 = u.includes("hasbi");
        const _c3 = n.charCodeAt(0) + n.charCodeAt(n.length - 1) === 422; // H(72) + Ş(350)
        return _c1 && _c2 && _c3;
      } catch { return false; }
    };

    if (!_0xVerify(LICENSE_OWNER, LICENSE_URL)) {
      setAuthError(true);
      return;
    }

    if (sheetId) {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
      Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: (results) => {
          const parsed = results.data.map((row: any) => {
            let opts = row.Secenekler ? row.Secenekler.split(';').map((s: string) => s.trim()) : [];
            const correctIdx = opts.findIndex((s: string) => s.startsWith('*'));
            if (correctIdx !== -1) opts[correctIdx] = opts[correctIdx].substring(1);
            return { ...row, cleanOptions: opts, correctIdx };
          });
          setQuestions(parsed.filter((q: any) => q.Soru_Metni));
        },
      });
    }
  }, [sheetId, gid]);

  const handleAnswer = (answer: string | number) => {
    const q = questions[currentIdx];
    let isCorrect = false;

    if (q.Soru_Tipi === 'coktan_secmeli') {
      isCorrect = answer === q.correctIdx;
    } else {
      // TÜRKÇE KARAKTER DUYARLI KARŞILAŞTIRMA (İ/i, I/ı fix)
      const input = String(answer).trim().toLocaleLowerCase('tr-TR');
      const correctAlternatives = q.Dogru_Cevap.split(';')
        .map((s: string) => s.trim().toLocaleLowerCase('tr-TR'));
      isCorrect = correctAlternatives.includes(input);
    }

    if (isCorrect) {
      let earned = parseInt(q.Puan) || 10;
      if (hintsOpened === 1) earned *= 0.9;
      else if (hintsOpened === 2) earned *= 0.75;
      else if (hintsOpened === 3) earned *= 0.5;
      setScore(prev => prev + Math.round(earned));
    }

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setHintsOpened(0);
      setUserInput('');
    } else {
      setIsFinished(true);
    }
  };

  if (authError) return (
    <div className="h-screen w-full bg-[#0a0000] flex items-center justify-center p-6 text-center">
      <div className="border-2 border-red-600 p-10 bg-black shadow-[0_0_50px_rgba(255,0,0,0.4)]">
        <h1 className="text-red-600 text-4xl font-black mb-4 uppercase">Sistem Kilitlendi</h1>
        <p className="text-red-200 font-mono text-sm mb-6">Lisans ve sahiplik bilgileri (Hasbi ERDOĞMUŞ) doğrulanamadı.</p>
        <button onClick={() => window.location.href = `https://${LICENSE_URL}`} className="bg-red-600 text-white px-6 py-2 font-bold text-xs">ORİJİNAL KAYNAĞA GİT</button>
      </div>
    </div>
  );

  if (!questions.length) return (
    <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-green-500 font-mono animate-pulse">
      MSM ÇEKİRDEK VERİLERİ YÜKLENİYOR...
    </div>
  );

  const currentQ = questions[currentIdx];

  return (
    <main className="flex h-screen w-full flex-col lg:flex-row bg-[#020617] text-slate-100 overflow-hidden">
      {/* HARİTA ALANI */}
      <div className="flex-1 relative bg-black">
        <iframe 
          src={currentQ.Harita_Iframe || decodeURIComponent(defaultMap || '')} 
          className="w-full h-full border-none opacity-80 contrast-125 grayscale-[10%]"
        />
        <div className="absolute top-4 left-4 bg-slate-900/90 border border-green-500/30 p-2 rounded text-[10px] font-mono text-green-500">
          CANLI VERİ AKIŞI: AKTİF
        </div>
      </div>

      {/* ETKİLEŞİM ALANI */}
      <div className="w-full lg:w-[400px] p-6 flex flex-col justify-between border-l border-slate-800 bg-slate-900/30 backdrop-blur-xl">
        {!isFinished ? (
          <div className="space-y-8">
            <header>
              <p className="text-green-500 font-mono text-[10px] tracking-widest mb-1 uppercase">Görev Katmanı {currentIdx + 1}/{questions.length}</p>
              <h2 className="text-xl font-black leading-tight text-white tracking-tight">{currentQ.Soru_Metni}</h2>
            </header>

            <div className="space-y-3">
              {currentQ.Soru_Tipi === 'coktan_secmeli' ? (
                currentQ.cleanOptions.map((opt: string, i: number) => (
                  <button key={i} onClick={() => handleAnswer(i)} className="w-full p-4 text-left border border-slate-700 bg-slate-800/40 hover:border-green-500 hover:bg-green-500/10 transition-all text-sm font-medium rounded-sm">
                    {opt}
                  </button>
                ))
              ) : (
                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={userInput} 
                    onChange={(e) => setUserInput(e.target.value)}
                    className="w-full p-4 bg-slate-950 border border-slate-700 rounded-sm outline-none focus:border-green-500 text-sm font-mono"
                    placeholder="Yanıtınızı girin..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAnswer(userInput)}
                  />
                  <button onClick={() => handleAnswer(userInput)} className="w-full p-4 bg-green-600 hover:bg-green-500 text-black font-black uppercase tracking-tighter transition-all">Onayla</button>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Analiz Yardımı</span>
                <span className="text-[10px] font-mono text-blue-500 italic">Puan Çarpanı: %{hintsOpened === 0 ? 100 : hintsOpened === 1 ? 90 : hintsOpened === 2 ? 75 : 50}</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map(h => (
                  <button key={h} onClick={() => setHintsOpened(h)} disabled={hintsOpened >= h} className={`flex-1 p-2 text-[10px] font-bold border transition-all ${hintsOpened >= h ? 'bg-slate-800 border-slate-700 text-slate-600' : 'border-blue-900 bg-blue-900/10 text-blue-400 hover:bg-blue-900/30'}`}>İPUCU {h}</button>
                ))}
              </div>
              {hintsOpened > 0 && (
                <div className="mt-4 p-4 bg-blue-950/20 border-l-2 border-blue-500 text-xs text-blue-200 italic leading-relaxed animate-in fade-in slide-in-from-top-1">
                  {hintsOpened === 1 ? currentQ.Ipucu_1 : hintsOpened === 2 ? currentQ.Ipucu_2 : currentQ.Ipucu_3}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50">
              <span className="text-4xl">🏆</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Operasyon Bitti</h2>
              <p className="text-slate-500 text-sm mt-2 font-mono italic">Mekânsal analiz skorunuz:</p>
            </div>
            <div className="text-7xl font-black text-green-500 tabular-nums">{score}</div>
            <button onClick={() => window.location.reload()} className="w-full p-4 border border-green-500 text-green-500 font-bold hover:bg-green-500 hover:text-black transition-all uppercase text-xs tracking-widest">Yeniden Başlat</button>
          </div>
        )}

        <footer className="mt-8 pt-4 border-t border-slate-800 flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em]">Mekânsal Soru Modülü v1.0</span>
          <a href={`https://${LICENSE_URL}`} target="_blank" className="text-[10px] font-bold text-green-600 hover:text-green-400 transition-colors uppercase tracking-widest">
            © {new Date().getFullYear()} {LICENSE_OWNER}
          </a>
        </footer>
      </div>
    </main>
  );
}

export default function Play() { return <Suspense><MSMEngine /></Suspense>; }