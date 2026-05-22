import React from 'react';
import { Music, MapPin, Sparkles, User, Send, Camera, X, Radio, Loader2 } from 'lucide-react';
import { AppInputs, VIBE_OPTIONS, RANDOM_THEMES, LYRICS_LANGUAGES, BASE_LANGUAGES, RANDOM_LOCATIONS } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Languages, Check, History } from 'lucide-react';
import { createPortal } from 'react-dom';
import { describeImage } from '../services/gemini';

interface InputFormProps {
  onGenerate: (inputs: AppInputs) => void;
  isLoading: boolean;
  initialData?: AppInputs;
  onOpenHistory?: () => void;
}

export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading, initialData, onOpenHistory }) => {
  const [inputs, setInputs] = React.useState<AppInputs>({
    channelName: initialData?.channelName || '',
    songTitle: initialData?.songTitle || '',
    storyTheme: initialData?.storyTheme || '',
    vibe: initialData?.vibe || 'Ailee (K-Pop Diva)',
    thumbnailLocation: initialData?.thumbnailLocation || '',
    targetAudience: initialData?.targetAudience || 'Indonesia',
    lyricsLanguage: initialData?.lyricsLanguage || 'Mix Languages',
    bpm: initialData?.bpm || 120,
    characterDescription: initialData?.characterDescription || '',
    characterImage: initialData?.characterImage || ''
  });
  const [customVibe, setCustomVibe] = React.useState('');
  const [customLang, setCustomLang] = React.useState('');
  const [selectedMixLangs, setSelectedMixLangs] = React.useState<string[]>(['Indonesia', 'Inggris']);
  const [isDescribing, setIsDescribing] = React.useState(false);

  React.useEffect(() => {
    if (initialData) {
      setInputs(initialData);
      
      const isCustomLang = initialData.lyricsLanguage && !LYRICS_LANGUAGES.includes(initialData.lyricsLanguage) && initialData.lyricsLanguage !== 'Custom Language' && !initialData.lyricsLanguage.includes(',');
      if (isCustomLang) setCustomLang(initialData.lyricsLanguage || '');

      const isCustomVibe = initialData.vibe && !VIBE_OPTIONS.includes(initialData.vibe as any) && initialData.vibe !== 'Custom Vibe' && initialData.vibe !== 'Random Vibe';
      if (isCustomVibe) setCustomVibe(initialData.vibe || '');
      
      if (initialData.lyricsLanguage && initialData.lyricsLanguage.includes(',')) {
        setSelectedMixLangs(initialData.lyricsLanguage.split(',').map(s => s.trim()));
      }
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalVibe = inputs.vibe === 'Custom Vibe' ? customVibe : inputs.vibe;
    let finalLang = inputs.lyricsLanguage;
    if (inputs.lyricsLanguage === 'Custom Language') {
      finalLang = customLang;
    } else if (inputs.lyricsLanguage === 'Mix Languages') {
      finalLang = `Mix (${selectedMixLangs.join(', ')})`;
    }
    onGenerate({ ...inputs, vibe: finalVibe, lyricsLanguage: finalLang });
  };

  const toggleMixLang = (lang: string) => {
    setSelectedMixLangs(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleRandomVibe = () => {
    const options = VIBE_OPTIONS.filter(v => v !== 'Random Vibe' && v !== 'Custom Vibe');
    const random = options[Math.floor(Math.random() * options.length)];
    setInputs({ ...inputs, vibe: random });
  };

  const handleRandomTheme = () => {
    const random = RANDOM_THEMES[Math.floor(Math.random() * RANDOM_THEMES.length)];
    setInputs({ ...inputs, storyTheme: random });
  };

  const handleRandomLocation = () => {
    const random = RANDOM_LOCATIONS[Math.floor(Math.random() * RANDOM_LOCATIONS.length)];
    setInputs({ ...inputs, thumbnailLocation: random });
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit} 
      className="glass-panel p-6 sm:p-8 space-y-6 pb-32 sm:pb-32"
    >
      {/* Target Audience Selection */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl">
        <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary-500 md:w-32">
          <Sparkles size={14} /> Target
        </label>
        <div className="flex gap-2 flex-1">
          <button
            type="button"
            onClick={() => setInputs({ ...inputs, targetAudience: 'Indonesia' })}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-mono uppercase tracking-widest transition-all border ${
              inputs.targetAudience === 'Indonesia' 
                ? 'bg-primary-500 text-white border-primary-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'bg-black/20 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/5 hover:border-white/20'
            }`}
          >
            🇮🇩 Indonesia
          </button>
          <button
            type="button"
            onClick={() => setInputs({ ...inputs, targetAudience: 'Global' })}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-mono uppercase tracking-widest transition-all border ${
              inputs.targetAudience === 'Global' 
                ? 'bg-blue-600 text-white border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                : 'bg-black/20 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/5 hover:border-white/20'
            }`}
          >
            🌎 Global
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary-500 mb-2">
                <User size={14} /> Nama Channel
              </label>
              <input
                required
                type="text"
                value={inputs.channelName}
                onChange={(e) => setInputs({ ...inputs, channelName: e.target.value })}
                placeholder="Contoh: TIRA NA STUDIO"
                className="w-full bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary-500 mb-2">
                <Music size={14} /> Judul Lagu
              </label>
              <input
                required
                type="text"
                value={inputs.songTitle}
                onChange={(e) => setInputs({ ...inputs, songTitle: e.target.value })}
                placeholder="Contoh: Bintang di Langit Tirana"
                className="w-full bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary-500">
                  <Sparkles size={14} /> Tema Cerita
                </label>
                <button
                  type="button"
                  onClick={handleRandomTheme}
                  className="text-[10px] font-mono uppercase tracking-widest text-primary-500/50 hover:text-primary-500 transition-colors flex items-center gap-1"
                >
                  🎲 Random Theme
                </button>
              </div>
              <textarea
                required
                value={inputs.storyTheme}
                onChange={(e) => setInputs({ ...inputs, storyTheme: e.target.value })}
                placeholder="Contoh: Patah hati karena restu orang tua"
                className="w-full bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 transition-colors h-24 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary-500 mb-2">
              <User size={14} /> Vibe Penyanyi
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={inputs.vibe}
                  onChange={(e) => setInputs({ ...inputs, vibe: e.target.value })}
                  className="flex-1 bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 transition-colors appearance-none"
                >
                  {VIBE_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-[#1A1A1A]">
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleRandomVibe}
                  className="px-4 bg-primary-500/10 border border-primary-500/30 text-primary-500 rounded-xl hover:bg-primary-500/20 transition-colors"
                >
                  🎲
                </button>
              </div>
              
              <AnimatePresence>
                {inputs.vibe === 'Custom Vibe' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <input
                      required
                      type="text"
                      value={customVibe}
                      onChange={(e) => setCustomVibe(e.target.value)}
                      placeholder="Tulis vibe penyanyi sendiri (misal: Ariel NOAH)"
                      className="w-full bg-primary-500/5 border border-primary-500/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 transition-colors text-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary-500 mb-2">
              <Languages size={14} /> Bahasa Lirik
            </label>
            <div className="space-y-3">
              <select
                value={inputs.lyricsLanguage}
                onChange={(e) => setInputs({ ...inputs, lyricsLanguage: e.target.value })}
                className="w-full bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 transition-colors appearance-none"
              >
                {LYRICS_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang} className="bg-[#1A1A1A]">
                    {lang}
                  </option>
                ))}
              </select>
              
              <AnimatePresence>
                {inputs.lyricsLanguage === 'Mix Languages' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-primary-500/5 border border-primary-500/20 rounded-xl">
                      {BASE_LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleMixLang(lang)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all border ${
                            selectedMixLangs.includes(lang)
                              ? 'bg-primary-500 text-white border-primary-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                              : 'bg-black/20 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/5 hover:border-white/10'
                          }`}
                        >
                          {selectedMixLangs.includes(lang) && <Check size={10} />}
                          {lang}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {inputs.lyricsLanguage === 'Custom Language' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <input
                      required
                      type="text"
                      value={customLang}
                      onChange={(e) => setCustomLang(e.target.value)}
                      placeholder="Tulis bahasa lirik sendiri"
                      className="w-full bg-primary-500/5 border border-primary-500/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 transition-colors text-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary-500">
                <MapPin size={14} /> Latar Thumbnail
              </label>
              <button
                type="button"
                onClick={handleRandomLocation}
                className="text-[10px] font-mono uppercase tracking-widest text-primary-500/50 hover:text-primary-500 transition-colors flex items-center gap-1"
              >
                🎲 Random Location
              </button>
            </div>
            <input
              required
              type="text"
              value={inputs.thumbnailLocation}
              onChange={(e) => setInputs({ ...inputs, thumbnailLocation: e.target.value })}
              placeholder="Contoh: Pantai saat sunset"
              className="w-full bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary-500 mb-2">
              <User size={14} /> Deskripsi Karakter (Opsional) {isDescribing && <Loader2 size={12} className="animate-spin inline ml-2" />}
            </label>
            <input
              type="text"
              value={inputs.characterDescription || ''}
              onChange={(e) => setInputs({ ...inputs, characterDescription: e.target.value })}
              placeholder={isDescribing ? "Menganalisis gambar..." : "Contoh: Wanita berhijab biru, senyum tipis"}
              className="w-full bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 transition-colors"
              disabled={isDescribing}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary-500 mb-2">
              <Camera size={14} /> Upload Karakter (Opsional)
            </label>
            <div className="relative group flex flex-col gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      const base64 = reader.result as string;
                      setInputs({ ...inputs, characterImage: base64 });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="character-upload"
              />
              <label
                htmlFor="character-upload"
                className={`flex items-center justify-center gap-3 w-full h-14 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                  inputs.characterImage 
                    ? 'border-primary-500 bg-primary-500/10 text-primary-500' 
                    : 'border-slate-300 dark:border-white/10 bg-white dark:bg-black/30 text-slate-500 dark:text-white/40 hover:border-white/30 hover:bg-black/40'
                }`}
              >
                {inputs.characterImage ? (
                  <>
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-primary-500/30">
                      <img src={inputs.characterImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-mono uppercase tracking-widest leading-none">Karakter Terpasang</span>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setInputs({ ...inputs, characterImage: undefined });
                      }}
                      className="ml-auto mr-4 p-1 hover:bg-primary-500/20 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <Camera size={18} />
                    <span className="text-xs font-mono uppercase tracking-widest">Klik untuk Upload Foto</span>
                  </>
                )}
              </label>
              
              {/* Auto Describe Button (Separate) */}
              {inputs.characterImage && (
                <button
                  type="button"
                  disabled={isDescribing}
                  onClick={async (e) => {
                    e.preventDefault();
                    setIsDescribing(true);
                    try {
                      const description = await describeImage(inputs.characterImage!);
                      setInputs(prev => ({ ...prev, characterDescription: description }));
                    } catch (err) {
                      console.error("Failed to describe image:", err);
                    } finally {
                      setIsDescribing(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 border border-primary-600 text-white rounded-xl transition-colors font-mono text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-primary-600 shadow-sm"
                >
                  {isDescribing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isDescribing ? 'Menganalisis Karakter...' : 'Auto-Describe (AI)'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BPM Tuner Section */}
        <div className="p-6 bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary-500">
              <Radio size={14} /> Tempo Control (BPM)
            </label>
            <div className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-lg">
              <span className="text-xl font-mono font-bold text-primary-500 leading-none">{inputs.bpm}</span>
              <span className="text-[10px] font-mono text-primary-500/50 ml-1">BPM</span>
            </div>
          </div>
          
          <div className="relative h-12 flex items-center group">
            {/* Tuner Marks */}
            <div className="absolute inset-0 flex justify-between items-center px-1 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
              {[...Array(21)].map((_, i) => (
                <div key={i} className={`w-px ${i % 5 === 0 ? 'h-4 bg-primary-500' : 'h-2 bg-white'}`} />
              ))}
            </div>
            
            <input
              type="range"
              min="60"
              max="200"
              step="1"
              value={inputs.bpm}
              onChange={(e) => setInputs({ ...inputs, bpm: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-300/50 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500 relative z-10"
            />
          </div>
          
          <div className="flex justify-between text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <span>Slow (60)</span>
            <span>Moderate (120)</span>
            <span>Fast (200)</span>
          </div>
        </div>
      </div>

      {/* Fixed bottom footer for submit button using Portal to escape transforms */}
      {typeof document !== 'undefined' && createPortal(
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-50/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-t border-slate-300 dark:border-white/10 p-4 pb-safe flex justify-center">
          <div className="w-full max-w-2xl mx-auto flex items-center gap-3">
            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="bg-slate-200/50 dark:bg-white/5 hover:bg-slate-300/50 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-white/80 p-4 rounded-2xl transition-all flex items-center justify-center shrink-0"
                title="View History"
              >
                <History size={20} />
              </button>
            )}
            
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || isDescribing}
              className="flex-1 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-slate-400 dark:border-white/30 border-t-white rounded-full animate-spin" />
              ) : isDescribing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span className="uppercase tracking-widest text-sm text-[10px] sm:text-sm">Menganalisis Karakter...</span>
                </>
              ) : (
                <>
                  <span className="uppercase tracking-widest text-[10px] sm:text-sm">Generate Aset Studio</span>
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>,
        document.body
      )}
    </motion.form>
  );
};
