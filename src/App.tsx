import React from 'react';
import { InputForm } from './components/InputForm';
import { OutputSection } from './components/OutputSection';
import { AppInputs, AppOutputs, HistoryEntry } from './types';
import { generateStudioAssets, generateThumbnailImage, validateApiKey, validateAistudioKey } from './services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { Mic2, Music2, Youtube, Radio, X, ArrowLeft, Settings, Moon, Sun, History } from 'lucide-react';
import { HistoryList } from './components/HistoryList';

export default function App() {
  const [view, setView] = React.useState<'input' | 'output' | 'history'>('input');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
  const [outputs, setOutputs] = React.useState<AppOutputs | null>(null);
  const [lastInputs, setLastInputs] = React.useState<AppInputs | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const [history, setHistory] = React.useState<HistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem('suno_studio_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Settings State
  const [showSettings, setShowSettings] = React.useState(false);
  const [appTheme, setAppTheme] = React.useState<'emerald' | 'blue' | 'violet' | 'rose'>('emerald');
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [manualApiKey, setManualApiKey] = React.useState(() => localStorage.getItem('gemini_api_key') || '');
  const [aistudioApiKey, setAistudioApiKey] = React.useState(() => localStorage.getItem('aistudio_api_key') || '');
  const [manualBaseUrl, setManualBaseUrl] = React.useState(() => localStorage.getItem('gemini_base_url') || 'https://api.kie.ai');
  const [kieModel, setKieModel] = React.useState(() => localStorage.getItem('kie_model') || 'gpt-5.2');
  const [kieMaxTokens, setKieMaxTokens] = React.useState(() => localStorage.getItem('kie_max_tokens') || '4096');
  const [kieTopP, setKieTopP] = React.useState(() => localStorage.getItem('kie_top_p') || '0.85');
  const [kieTemperature, setKieTemperature] = React.useState(() => localStorage.getItem('kie_temperature') || '0.95');
  const [isKeyValidating, setIsKeyValidating] = React.useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = React.useState<'idle' | 'valid' | 'invalid'>('idle');
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const [isAistudioKeyValidating, setIsAistudioKeyValidating] = React.useState(false);
  const [aistudioKeyValidationStatus, setAistudioKeyValidationStatus] = React.useState<'idle' | 'valid' | 'invalid'>('idle');
  const [aistudioValidationError, setAistudioValidationError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!manualApiKey) {
      setKeyValidationStatus('idle');
      setValidationError(null);
      return;
    }
    
    setKeyValidationStatus('idle');
    setValidationError(null);
    const timer = setTimeout(async () => {
      setIsKeyValidating(true);
      try {
        const isValid = await validateApiKey(manualApiKey);
        setKeyValidationStatus(isValid ? 'valid' : 'invalid');
        setValidationError(isValid ? null : 'Failed to validate API Key.');
      } catch (e: any) {
        setKeyValidationStatus('invalid');
        let errorMessage = e.message || String(e);
        if (errorMessage === 'Failed to fetch') {
          errorMessage = 'Failed to fetch. Ini biasanya terjadi karena masalah CORS (tidak diizinkan diakses langsung dari browser), jaringan terputus, atau API tersebut tidak mengenali request SDK.';
        }
        if (errorMessage.startsWith('{') && errorMessage.includes('"error"')) {
          try {
            const parsed = JSON.parse(errorMessage);
            if (parsed.error && parsed.error.message) {
              errorMessage = `${parsed.error.code ? `[${parsed.error.code}] ` : ''}${parsed.error.message}`;
            }
          } catch {}
        }
        setValidationError(errorMessage);
      } finally {
        setIsKeyValidating(false);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [manualApiKey]);

  React.useEffect(() => {
    if (!aistudioApiKey) {
      setAistudioKeyValidationStatus('idle');
      setAistudioValidationError(null);
      return;
    }
    
    setAistudioKeyValidationStatus('idle');
    setAistudioValidationError(null);
    const timer = setTimeout(async () => {
      setIsAistudioKeyValidating(true);
      try {
        const isValid = await validateAistudioKey(aistudioApiKey);
        setAistudioKeyValidationStatus(isValid ? 'valid' : 'invalid');
        setAistudioValidationError(isValid ? null : 'Failed to validate AI Studio Key.');
      } catch (e: any) {
        setAistudioKeyValidationStatus('invalid');
        setAistudioValidationError(e.message || String(e));
      } finally {
        setIsAistudioKeyValidating(false);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [aistudioApiKey]);

  React.useEffect(() => {
    const handleKeysUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setManualApiKey(customEvent.detail);
      setKeyValidationStatus('valid'); // Since it fell back to a valid one or we wouldn't be here, but wait, it might be exhausted.
      setValidationError(null);
      if (!customEvent.detail) {
        setKeyValidationStatus('idle');
        setValidationError(null);
      }
    };
    
    window.addEventListener('gemini_keys_updated', handleKeysUpdated);
    return () => window.removeEventListener('gemini_keys_updated', handleKeysUpdated);
  }, []);

  const handleValidateKey = async () => {
    if (!manualApiKey) return;
    setIsKeyValidating(true);
    setKeyValidationStatus('idle');
    setValidationError(null);
    try {
      const isValid = await validateApiKey(manualApiKey);
      setKeyValidationStatus(isValid ? 'valid' : 'invalid');
      setValidationError(isValid ? null : 'Failed to validate API Key.');
    } catch (e: any) {
      setKeyValidationStatus('invalid');
      let errorMessage = e.message || String(e);
      if (errorMessage === 'Failed to fetch') {
        errorMessage = 'Failed to fetch. Ini biasanya terjadi karena masalah CORS (tidak diizinkan diakses langsung dari browser), jaringan terputus, atau API tersebut tidak mengenali request SDK.';
      }
      // If it looks like JSON error from SDK
      if (errorMessage.startsWith('{') && errorMessage.includes('"error"')) {
        try {
          const parsed = JSON.parse(errorMessage);
          if (parsed.error && parsed.error.message) {
            errorMessage = `${parsed.error.code ? `[${parsed.error.code}] ` : ''}${parsed.error.message}`;
          }
        } catch {}
      }
      setValidationError(errorMessage);
    } finally {
      setIsKeyValidating(false);
    }
  };

  const handleValidateAistudioKey = async () => {
    if (!aistudioApiKey) return;
    setIsAistudioKeyValidating(true);
    setAistudioKeyValidationStatus('idle');
    setAistudioValidationError(null);
    try {
      const isValid = await validateAistudioKey(aistudioApiKey);
      setAistudioKeyValidationStatus(isValid ? 'valid' : 'invalid');
      setAistudioValidationError(isValid ? null : 'Failed to validate AI Studio Key.');
    } catch (e: any) {
      setAistudioKeyValidationStatus('invalid');
      let errorMessage = e.message || String(e);
      setAistudioValidationError(errorMessage);
    } finally {
      setIsAistudioKeyValidating(false);
    }
  };

  const outputRef = React.useRef<HTMLDivElement>(null);

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setIsGeneratingImage(false);
  };

  const handleBackToInput = () => {
    setView('input');
    // We don't clear outputs so they are still there if they go back to output view, 
    // but the UI will show the form again.
  };

  const handleGenerate = async (inputs: AppInputs) => {
    setIsLoading(true);
    setError(null);
    setLastInputs(inputs);

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await generateStudioAssets(inputs);
      
      if (controller.signal.aborted) return;

      // Initial image generation (Full Body and Close Up) - NO TEXT
      setIsGeneratingImage(true);
      try {
        const fullBodyPrompt = `Full body shot, ${result.basePrompt}`;
        const closeUpPrompt = `Extreme close-up portrait, detailed face, ${result.basePrompt}`;
        
        const [fullImg, closeImg] = await Promise.all([
          generateThumbnailImage(fullBodyPrompt, inputs.characterImage, aistudioApiKey),
          generateThumbnailImage(closeUpPrompt, inputs.characterImage, aistudioApiKey)
        ]);
        
        if (controller.signal.aborted) return;

        result.generatedImageFull = fullImg;
        result.generatedImageClose = closeImg;
        result.textOverlayInstructions = result.textOverlayInstructions || '';
      } catch (imgErr) {
        console.error("Initial image generation failed:", imgErr);
      } finally {
        setIsGeneratingImage(false);
      }

      if (controller.signal.aborted) return;

      setOutputs(result);
      
      const newEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        inputs,
        outputs: result,
      };
      setHistory(prev => {
        const next = [newEntry, ...prev].slice(0, 50);
        try { localStorage.setItem('suno_studio_history', JSON.stringify(next)); } catch (e) {}
        return next;
      });

      setView('output');
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation cancelled by user');
        return;
      }
      console.error(err);
      setError(err.message || 'Gagal generate aset. Pastikan API Key sudah terpasang dan coba lagi.');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleGenerateFinalThumbnail = async (editedPrompt: string, type: 'full' | 'close', customImage?: string) => {
    if (!outputs || !lastInputs) return;
    
    setIsGeneratingImage(true);
    setError(null);
    try {
      // Prepend the type modifier only if we're not using a custom image
      // (because for custom images, we generate a fresh description)
      const typeModifier = type === 'full' ? 'Full body shot, ' : 'Extreme close-up portrait, detailed face, ';
      const finalPrompt = customImage 
        ? editedPrompt 
        : (editedPrompt.includes(typeModifier) ? editedPrompt : `${typeModifier}${editedPrompt}`);
      
      // Use customImage if provided, otherwise fallback to the selected generated base image
      let referenceImage = customImage;
      if (!referenceImage) {
        referenceImage = type === 'full' ? outputs.generatedImageFull : outputs.generatedImageClose;
      }
      
      const imageUrl = await generateThumbnailImage(finalPrompt, referenceImage, aistudioApiKey);
      setOutputs({ ...outputs, imagePrompt: editedPrompt, generatedThumbnail: imageUrl });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal generate thumbnail final.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateSceneImage = async (sceneId: string, prompt: string) => {
    if (!outputs || !lastInputs) return;
    
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateThumbnailImage(prompt, lastInputs.characterImage, aistudioApiKey);
      const updatedScenes = outputs.visualAssets.scenes.map(s => 
        s.id === sceneId ? { ...s, generatedImage: imageUrl } : s
      );
      setOutputs({ 
        ...outputs, 
        visualAssets: { ...outputs.visualAssets, scenes: updatedScenes } 
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal generate gambar adegan.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleRegenerateBaseImages = async (newCharDesc?: string) => {
    if (!outputs || !lastInputs) return;
    
    setIsGeneratingImage(true);
    setError(null);
    try {
      // If a new character description is provided, we should ideally update the base prompt
      // For now, we'll just use the new description if provided, otherwise fallback to outputs.basePrompt
      const basePrompt = newCharDesc ? `${newCharDesc}, ${lastInputs.thumbnailLocation}` : outputs.basePrompt;
      
      const fullBodyPrompt = `Full body shot, ${basePrompt}`;
      const closeUpPrompt = `Extreme close-up portrait, detailed face, ${basePrompt}`;
      
      const [fullImg, closeImg] = await Promise.all([
        generateThumbnailImage(fullBodyPrompt, lastInputs.characterImage, aistudioApiKey),
        generateThumbnailImage(closeUpPrompt, lastInputs.characterImage, aistudioApiKey)
      ]);
      
      setOutputs({ 
        ...outputs, 
        generatedImageFull: fullImg, 
        generatedImageClose: closeImg,
        characterDescription: newCharDesc || outputs.characterDescription,
        basePrompt: basePrompt
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal regenerate gambar dasar.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  React.useEffect(() => {
    // Apply theme class to document body to ensure Portals (like fixed bottom footers) inherit the CSS variables
    const themes = ['theme-emerald', 'theme-blue', 'theme-violet', 'theme-rose'];
    document.body.classList.remove(...themes);
    document.body.classList.add(`theme-${appTheme}`);
  }, [appTheme]);
  
  React.useEffect(() => {
    // Toggle dark mode classes
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLoadHistory = (entry: HistoryEntry) => {
    setLastInputs(entry.inputs);
    setOutputs(entry.outputs);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => {
      const next = prev.filter(entry => entry.id !== id);
      try { localStorage.setItem('suno_studio_history', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const handleUpdateHistory = (id: string, newTitle: string) => {
    setHistory(prev => {
      const next = prev.map(entry => 
        entry.id === id 
          ? { ...entry, inputs: { ...entry.inputs, songTitle: newTitle } } 
          : entry
      );
      try { localStorage.setItem('suno_studio_history', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  return (
    <div className="min-h-screen studio-grid relative overflow-x-hidden">
      
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-50 dark:bg-[#0A0A0A] border border-slate-300 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-300 dark:border-white/10 bg-slate-200/50 dark:bg-white/5 shrink-0">
                <h2 className="text-lg font-serif italic text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings size={18} className="text-primary-500" /> Pengaturan App
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-primary-500/50">Warna Tema (Accent Color)</label>
                  <div className="grid grid-cols-4 gap-2">
                     {['emerald', 'blue', 'violet', 'rose'].map(theme => (
                       <button
                         key={theme}
                         onClick={() => setAppTheme(theme as any)}
                         className={`h-12 rounded-xl flex items-center justify-center border-2 transition-all capitalize text-xs font-bold ${
                           appTheme === theme 
                            ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-[0_0_15px_var(--color-primary-500,rgba(0,0,0,0))]' 
                            : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-white/40 hover:border-slate-400 dark:hover:border-white/30 bg-slate-200/50 dark:bg-white/5'
                         }`}
                       >
                         {theme}
                       </button>
                     ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-primary-500/50">Tampilan (Theme Mode)</label>
                  <p className="text-xs text-slate-600 dark:text-white/60 mb-2">Pilih mode tampilan terang atau gelap.</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsDarkMode(false)}
                      className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl border-2 transition-all text-xs font-bold ${!isDarkMode ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-[0_0_15px_var(--color-primary-500,rgba(0,0,0,0))]' : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-white/40 hover:border-slate-400 dark:hover:border-white/30 bg-slate-200/50 dark:bg-white/5'}`}
                    >
                      <Sun size={16} /> Light Mode
                    </button>
                    <button 
                      onClick={() => setIsDarkMode(true)}
                      className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl border-2 transition-all text-xs font-bold ${isDarkMode ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-[0_0_15px_var(--color-primary-500,rgba(0,0,0,0))]' : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-white/40 hover:border-slate-400 dark:hover:border-white/30 bg-slate-200/50 dark:bg-white/5'}`}
                    >
                      <Moon size={16} /> Dark Mode
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-primary-500/50">Tukar API Key Manual (Kie.ai Text)</label>
                  <p className="text-xs text-slate-600 dark:text-white/60 mb-2">Opsional: Masukkan API Key pribadi Anda (akan disimpan di browser). Jika dikosongkan, akan memakai setting default.</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <textarea
                        value={manualApiKey}
                        onChange={(e) => {
                          const val = e.target.value;
                          setManualApiKey(val);
                          if (val) localStorage.setItem('gemini_api_key', val);
                          else localStorage.removeItem('gemini_api_key');
                        }}
                        placeholder="API Key (mis. sk-... atau AIzaSy...)&#10;Bisa masukkan lebih dari satu, pisahkan dengan enter/koma"
                        className={`flex-1 bg-slate-200/50 dark:bg-white/5 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 outline-none transition-colors min-h-[60px] resize-y custom-scrollbar ${keyValidationStatus === 'invalid' ? 'border-red-500 focus:border-red-500' : keyValidationStatus === 'valid' ? 'border-emerald-500 focus:border-emerald-500' : 'border-slate-300 dark:border-white/10 focus:border-primary-500'}`}
                      />
                      <button
                        onClick={handleValidateKey}
                        disabled={!manualApiKey || isKeyValidating}
                        className="px-4 py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap self-start"
                      >
                        {isKeyValidating ? 'Validating...' : 'Validate'}
                      </button>
                    </div>
                  </div>
                  {(isKeyValidating || keyValidationStatus !== 'idle') && (
                    <div className="flex items-start gap-2 mt-2">
                      {isKeyValidating ? (
                        <>
                          <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-500 dark:text-white/60">Memvalidasi API Key...</span>
                        </>
                      ) : keyValidationStatus === 'valid' ? (
                        <>
                          <div className="w-3 h-3 bg-emerald-500 rounded-full mt-0.5 shrink-0" />
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">API Key valid dan aktif</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 bg-red-500 rounded-full mt-0.5 shrink-0" />
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-red-600 dark:text-red-400 font-bold">Validasi gagal</span>
                            <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 p-2 rounded max-w-full break-words">
                              {validationError || 'API Key tidak valid atau tidak memiliki akses'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-primary-500/50">API Key AI Studio (Gemini Image)</label>
                  <p className="text-xs text-slate-600 dark:text-white/60 mb-2">Opsional: Masukkan API Key Google AI Studio Anda untuk generate gambar.</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <textarea
                        value={aistudioApiKey}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAistudioApiKey(val);
                          if (val) localStorage.setItem('aistudio_api_key', val);
                          else localStorage.removeItem('aistudio_api_key');
                        }}
                        placeholder="AIzaSy..."
                        className={`flex-1 bg-slate-200/50 dark:bg-white/5 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 outline-none transition-colors min-h-[60px] resize-y custom-scrollbar ${aistudioKeyValidationStatus === 'invalid' ? 'border-red-500 focus:border-red-500' : aistudioKeyValidationStatus === 'valid' ? 'border-emerald-500 focus:border-emerald-500' : 'border-slate-300 dark:border-white/10 focus:border-primary-500'}`}
                      />
                      <button
                        onClick={handleValidateAistudioKey}
                        disabled={!aistudioApiKey || isAistudioKeyValidating}
                        className="px-4 py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap self-start"
                      >
                        {isAistudioKeyValidating ? 'Validating...' : 'Validate'}
                      </button>
                    </div>
                  </div>
                  {(isAistudioKeyValidating || aistudioKeyValidationStatus !== 'idle') && (
                    <div className="flex items-start gap-2 mt-2">
                      {isAistudioKeyValidating ? (
                        <>
                          <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-500 dark:text-white/60">Memvalidasi API Key...</span>
                        </>
                      ) : aistudioKeyValidationStatus === 'valid' ? (
                        <>
                          <div className="w-3 h-3 bg-emerald-500 rounded-full mt-0.5 shrink-0" />
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">API Key valid</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 bg-red-500 rounded-full mt-0.5 shrink-0" />
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-red-600 dark:text-red-400 font-bold">Validasi gagal</span>
                            <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 p-2 rounded max-w-full break-words">
                              {aistudioValidationError || 'API Key tidak valid'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-5 mt-4 space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Model & Endpoint</h3>
                    <p className="text-xs text-slate-500 dark:text-white/50 leading-relaxed mt-1">
                      Semua lewat api.kie.ai: GPT / Gemini di /.../v1/chat/completions (bukan OpenAI/Google langsung). Jika muncul «Failed to fetch», biasanya jaringan/pemblokir — bukan saldo.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/50">Mesin (KIE.AI)</label>
                    <div className="relative">
                      <select
                        value={kieModel}
                        onChange={(e) => {
                          setKieModel(e.target.value);
                          localStorage.setItem('kie_model', e.target.value);
                        }}
                        className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 appearance-none"
                      >
                        <option value="gpt-4o-mini">GPT-4o Mini — .../gpt-4o-mini/v1/chat/completions</option>
                        <option value="gpt-4o">GPT-4o — .../gpt-4o/v1/chat/completions</option>
                        <option value="gpt-5.2">GPT-5.2 — .../gpt-5-2/v1/chat/completions</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro — .../gemini-1.5-pro/v1/chat/completions</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash — .../gemini-1.5-flash/v1/chat/completions</option>
                        <option value="claude-3-opus">Claude 3 Opus — .../claude-3-opus/v1/chat/completions</option>
                        <option value="claude-3-5-sonnet">Claude 3.5 Sonnet — .../claude-3-5-sonnet/v1/chat/completions</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-white/50">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/50">Max Completion Tokens</label>
                    <input
                      type="number"
                      value={kieMaxTokens}
                      onChange={(e) => {
                        setKieMaxTokens(e.target.value);
                        localStorage.setItem('kie_max_tokens', e.target.value);
                      }}
                      className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/50">Top P ({kieTopP})</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={kieTopP}
                      onChange={(e) => {
                        setKieTopP(e.target.value);
                        localStorage.setItem('kie_top_p', e.target.value);
                      }}
                      className="w-full accent-primary-500 h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/50">Host Chat KIE (Base URL)</label>
                    <input
                      type="text"
                      value={manualBaseUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setManualBaseUrl(val);
                        if (val) localStorage.setItem('gemini_base_url', val);
                        else localStorage.removeItem('gemini_base_url');
                      }}
                      placeholder="https://api.kie.ai"
                      className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/50">Temperature ({kieTemperature})</label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={kieTemperature}
                      onChange={(e) => {
                        setKieTemperature(e.target.value);
                        localStorage.setItem('kie_temperature', e.target.value);
                      }}
                      className="w-full accent-primary-500 h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md p-6"
          >
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Radio size={32} className="text-primary-500 animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-2xl font-serif italic text-slate-900 dark:text-white mb-2">Generating Magic...</h2>
            <p className="text-slate-600 dark:text-white/40 font-mono text-xs uppercase tracking-widest mb-8">Producing your studio assets</p>
            
            <button
              onClick={handleCancel}
              className="px-8 py-3 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-white/10 transition-all text-xs font-mono uppercase tracking-widest flex items-center gap-2"
            >
              <X size={14} /> Cancel Generate
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-6 sm:pt-12">
        {/* Top Actions Bar */}
        <div className="flex justify-end items-center gap-3 w-full mb-8">
          {keyValidationStatus === 'valid' && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-500 dark:text-white/60 text-xs font-mono font-medium tracking-wide whitespace-nowrap shadow-sm backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <span>{manualApiKey.split(/[\n, ]+/).filter(k => k.trim().length > 0).length} TOKEN AKTIF</span>
            </div>
          )}
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-500 dark:text-white/40 hover:text-primary-500 hover:border-primary-500/30 hover:bg-primary-500/10 transition-all font-medium shadow-sm backdrop-blur-sm"
            title="App Settings"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Header */}
        <header className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 text-xs font-mono uppercase tracking-widest mb-6"
          >
            <Radio size={14} className="animate-pulse" /> Production Suite 2026
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-serif font-bold text-slate-900 dark:text-white mb-4 tracking-tight"
          >
            MUSICAL <span className="italic text-primary-500">STUDIO</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-white/50 max-w-xl mx-auto text-lg"
          >
            AI Production Assistant for your music production. 
            Generate Suno lyrics, style prompts, and YouTube SEO in seconds.
          </motion.p>
        </header>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {view === 'input' ? (
            <motion.section 
              key="input-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mb-12"
            >
              <InputForm onGenerate={handleGenerate} isLoading={isLoading} initialData={lastInputs || undefined} onOpenHistory={() => setView('history')} />
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-center text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          ) : view === 'history' ? (
            <motion.section
              key="history-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mb-12 space-y-6"
            >
              <HistoryList 
                history={history}
                onLoadHistory={(entry) => {
                  handleLoadHistory(entry);
                  setView('output');
                }}
                onDeleteHistory={handleDeleteHistory}
                onUpdateHistory={handleUpdateHistory}
                onBack={() => {
                  if (outputs) setView('output');
                  else setView('input');
                }}
              />
            </motion.section>
          ) : (
            <motion.div
              key="output-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-start">
                <button
                  onClick={handleBackToInput}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-white/60 hover:text-primary-500 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all text-xs font-mono uppercase tracking-widest group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Kembali ke Menu Input
                </button>
              </div>

              {outputs && (
                <OutputSection 
                  outputs={outputs} 
                  initialCharacterImage={lastInputs?.characterImage}
                  onRegenerateBaseImages={handleRegenerateBaseImages}
                  onGenerateFinalThumbnail={handleGenerateFinalThumbnail}
                  onGenerateSceneImage={handleGenerateSceneImage}
                  isGeneratingImage={isGeneratingImage}
                  channelName={lastInputs?.channelName}
                  history={history}
                  onLoadHistory={handleLoadHistory}
                  onDeleteHistory={handleDeleteHistory}
                  onUpdateHistory={handleUpdateHistory}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="py-12 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-white/20 text-xs font-mono uppercase tracking-widest">
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="flex items-center gap-2"><Mic2 size={14} /> Audio Engine</div>
            <div className="flex items-center gap-2"><Music2 size={14} /> Suno Optimised</div>
            <div className="flex items-center gap-2"><Youtube size={14} /> SEO 2026</div>
          </div>
          &copy; 2026 MUSICAL STUDIO • All Rights Reserved
        </footer>
      </main>
    </div>
  );
}
