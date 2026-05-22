import React from 'react';
import { Copy, Check, Music, Palette, Image as ImageIcon, Search, RefreshCw, Download, Loader2, Radio, Languages, User, Clapperboard, Video, Sparkles, Wand2, X, History, Edit2, Play } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { describeImage, remixLyricSnippet, enhanceLyricsWithTags } from '../services/gemini';
import { AppInputs, HistoryEntry } from '../types';

import { AudioVisualizer } from './AudioVisualizer';
import { StoryboardModal } from './StoryboardModal';
import { HistoryList } from './HistoryList';

interface OutputCardProps {
  title: string;
  content: string;
  icon: React.ReactNode;
  isCode?: boolean;
  extra?: React.ReactNode;
}

const OutputCard: React.FC<OutputCardProps> = ({ title, content, icon, isCode, extra }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-panel overflow-hidden neon-border"
    >
      <div className="px-6 py-4 border-b border-slate-300 dark:border-white/10 flex items-center justify-between bg-slate-200/50 dark:bg-white/5">
        <div className="flex items-center gap-3">
          <div className="text-primary-500">{icon}</div>
          <h3 className="font-mono text-xs uppercase tracking-widest font-bold">{title}</h3>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-xs font-mono text-primary-500/70 hover:text-primary-500"
        >
          {copied ? <Check size={14} className="text-primary-500" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Content'}
        </button>
      </div>
      <div className="p-6 min-h-[300px]">
        {extra && <div className="mb-6">{extra}</div>}
        {content ? (
          isCode ? (
            <pre className="bg-white/80 dark:bg-black/40 p-4 rounded-xl border border-slate-200 dark:border-white/5 font-mono text-sm text-primary-400 whitespace-pre-wrap break-words">
              {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
            </pre>
          ) : (
            <div className="markdown-body text-sm leading-relaxed whitespace-pre-wrap">
              <Markdown>{typeof content === 'string' ? content : ''}</Markdown>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full min-h-[200px] text-white/20 italic text-sm font-mono">
            Belum ada data yang dihasilkan untuk bagian ini.
          </div>
        )}
      </div>
    </motion.div>
  );
};

const YouTubePreview = ({ thumbnail, title, channelName }: { thumbnail?: string, title: string, channelName: string }) => {
  return (
    <div className="w-[340px] rounded-xl overflow-hidden bg-[#0F0F0F] text-white font-sans border border-slate-300 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] mx-auto">
      <div className="relative aspect-video bg-zinc-800">
        {thumbnail ? (
          <img src={thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
            <ImageIcon size={32} className="mb-2 opacity-50"/>
            No Image
          </div>
        )}
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[12px] font-medium px-1.5 py-0.5 rounded">
          4:20
        </div>
      </div>
      <div className="p-3 flex gap-3 text-left">
        <div className="w-9 h-9 rounded-full bg-zinc-700 flex-shrink-0 flex items-center justify-center text-slate-600 dark:text-white/50">
          <User size={18} />
        </div>
        <div className="flex flex-col pr-4">
          <h4 className="text-[14px] font-semibold leading-tight line-clamp-2 text-[#f1f1f1] mb-1">{title}</h4>
          <span className="text-[12px] text-[#aaaaaa]">{channelName}</span>
          <span className="text-[12px] text-[#aaaaaa]">241K views • 5 hours ago</span>
        </div>
      </div>
    </div>
  );
};

interface SceneCardProps {
  scene: {
    id: string;
    lyricsSnippet: string;
    imagePrompt: string;
    videoPrompts: string[];
    generatedImage?: string;
  };
  idx: number;
  onGenerate: () => void;
  isGenerating: boolean;
  onDownload: () => void;
  onUpdatePrompt: (prompt: string) => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, idx, onGenerate, isGenerating, onDownload, onUpdatePrompt }) => {
  const [localPrompt, setLocalPrompt] = React.useState(scene.imagePrompt);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="glass-panel overflow-hidden neon-border"
    >
      <div className="px-6 py-4 border-b border-slate-300 dark:border-white/10 flex items-center justify-between bg-slate-200/50 dark:bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-mono text-[10px] font-bold">
            {idx + 1}
          </div>
          <h3 className="font-mono text-xs uppercase tracking-widest font-bold">Scene {idx + 1}</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-white/30 italic truncate max-w-[200px]">
            "{scene.lyricsSnippet}"
          </span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Image Generation */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-primary-500/50 flex items-center gap-2">
              <ImageIcon size={12} /> Text-to-Image Prompt
            </label>
            <textarea
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              className="w-full bg-white/80 dark:bg-black/40 p-4 rounded-xl border border-slate-200 dark:border-white/5 font-mono text-xs text-primary-400 h-32 focus:outline-none focus:border-primary-500/50 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 py-3 rounded-xl text-xs font-bold transition-all"
            >
              {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {scene.generatedImage ? 'Regenerate Image' : 'Generate Image'}
            </button>
            {scene.generatedImage && (
              <button
                onClick={onDownload}
                className="px-4 bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Download size={16} />
              </button>
            )}
          </div>

          {scene.generatedImage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video rounded-xl overflow-hidden border border-primary-500/20"
            >
              <img src={scene.generatedImage} alt={`Scene ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
          )}
        </div>

        {/* Right Side: Video Prompts */}
        <div className="space-y-4">
          <label className="text-[10px] font-mono uppercase tracking-widest text-blue-400/50 flex items-center gap-2">
            <Video size={12} /> Image-to-Video Prompts (Motion)
          </label>
          
          <div className="space-y-3">
            {scene.videoPrompts.map((vPrompt, vIdx) => (
              <div key={vIdx} className="group relative bg-white/80 dark:bg-black/40 p-4 rounded-xl border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-blue-500/50">Option {vIdx + 1}</span>
                  <button
                    onClick={() => handleCopy(vPrompt, vIdx)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-blue-500/70 hover:text-blue-500"
                  >
                    {copiedIndex === vIdx ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
                <p className="font-mono text-[11px] text-blue-100/70 leading-relaxed">
                  {vPrompt}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <p className="text-[10px] text-blue-200/40 italic leading-relaxed">
              Tip: Gunakan prompt di atas pada tools seperti Luma Dream Machine, Kling AI, atau Runway Gen-2 dengan mengunggah gambar hasil generate di sebelah kiri.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface OutputSectionProps {
  outputs: {
    lyrics: string;
    translation: string;
    stylePrompts: string[];
    basePrompt: string;
    imagePrompt: string;
    seoMetadata: {
      titles: string[];
      description: string;
      tags: string;
      pinnedComment: string;
      shorts: {
        title: string;
        description: string;
        tags: string;
      };
    };
    generatedImageFull?: string;
    generatedImageClose?: string;
    generatedThumbnail?: string;
    textOverlayInstructions: string;
    characterDescription?: string;
    visualAssets: {
      scenes: {
        id: string;
        lyricsSnippet: string;
        imagePrompt: string;
        videoPrompts: string[];
        generatedImage?: string;
      }[];
    };
  };
  initialCharacterImage?: string;
  onRegenerateBaseImages: (newCharDesc?: string) => void;
  onGenerateFinalThumbnail: (prompt: string, type: 'full' | 'close', customImage?: string) => void;
  onGenerateSceneImage: (sceneId: string, prompt: string) => void;
  isGeneratingImage: boolean;
  channelName?: string;
  history: HistoryEntry[];
  onLoadHistory: (entry: HistoryEntry) => void;
  onDeleteHistory: (id: string) => void;
  onUpdateHistory: (id: string, newTitle: string) => void;
}

type TabId = 'lyrics' | 'style' | 'image' | 'visuals' | 'seo' | 'history';

export const OutputSection: React.FC<OutputSectionProps> = ({ 
  outputs, 
  initialCharacterImage,
  onRegenerateBaseImages, 
  onGenerateFinalThumbnail,
  onGenerateSceneImage,
  isGeneratingImage,
  channelName,
  history,
  onLoadHistory,
  onDeleteHistory,
  onUpdateHistory
}) => {
  const [activeTab, setActiveTab] = React.useState<TabId>('lyrics');
  const [editedLyrics, setEditedLyrics] = React.useState(outputs.lyrics);
  const [editedPrompt, setEditedPrompt] = React.useState(outputs.imagePrompt);
  const [editedCharDesc, setEditedCharDesc] = React.useState(outputs.characterDescription || '');
  const [selectedType, setSelectedType] = React.useState<'full' | 'close'>('full');
  const [customImage, setCustomImage] = React.useState<string | null>(initialCharacterImage || null);
  const [isDescribing, setIsDescribing] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isStoryboardOpen, setIsStoryboardOpen] = React.useState(false);

  // Audio Player State
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Interactive Lyrics State
  const lyricsTextAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const [showRemixModal, setShowRemixModal] = React.useState(false);
  const [remixSelection, setRemixSelection] = React.useState({start: 0, end: 0, text: ''});
  const [remixInstruction, setRemixInstruction] = React.useState('');
  const [isRemixing, setIsRemixing] = React.useState(false);
  
  const [lyricMode, setLyricMode] = React.useState<'edit' | 'select'>('edit');
  const [selectedLines, setSelectedLines] = React.useState<number[]>([]);

  const handleCheckSelection = () => {
    if (lyricMode === 'select') {
      if (selectedLines.length === 0) {
        alert("Pilih baris lirik terlebih dahulu dengan menyentuhnya.");
        return;
      }
      const lines = editedLyrics.split('\n');
      const startLine = Math.min(...selectedLines);
      const endLine = Math.max(...selectedLines);
      
      let startIndex = 0;
      for (let i = 0; i < startLine; i++) {
        startIndex += lines[i].length + 1;
      }
      
      let endIndex = startIndex;
      for (let i = startLine; i <= endLine; i++) {
        endIndex += lines[i].length + (i === endLine ? 0 : 1);
      }
      
      setRemixSelection({
        start: startIndex,
        end: endIndex,
        text: editedLyrics.substring(startIndex, endIndex)
      });
      setShowRemixModal(true);
    } else {
      const textarea = lyricsTextAreaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        if (start !== end && textarea.value) {
          setRemixSelection({
            start,
            end,
            text: textarea.value.substring(start, end)
          });
          setShowRemixModal(true);
        } else {
          alert("Pilih/highlight potongan lirik, atau ganti ke mode 'Pilih Baris' jika di HP.");
        }
      }
    }
  };

  const handleRemixLyrics = async () => {
    if (!remixInstruction) return;
    setIsRemixing(true);
    try {
      const newSnippet = await remixLyricSnippet(remixSelection.text, remixInstruction);
      const val = editedLyrics;
      const newVal = val.substring(0, remixSelection.start) + newSnippet + val.substring(remixSelection.end);
      setEditedLyrics(newVal);
      setRemixSelection({...remixSelection, text: newSnippet, end: remixSelection.start + newSnippet.length});
      setShowRemixModal(false);
      setRemixInstruction('');
      setSelectedLines([]);
    } catch (e) {
      console.error(e);
      alert("Gagal meremix potongan lirik. Coba lagi.");
    } finally {
      setIsRemixing(false);
    }
  };

  const [isEnhancing, setIsEnhancing] = React.useState(false);

  const handleEnhanceLyrics = async () => {
    setIsEnhancing(true);
    try {
      const style = outputs.stylePrompts[0] || 'Standard';
      const newLyrics = await enhanceLyricsWithTags(editedLyrics, style);
      setEditedLyrics(newLyrics);
    } catch (e) {
      console.error(e);
      alert("Gagal menambahkan meta-tag Suno. Coba lagi.");
    } finally {
      setIsEnhancing(false);
    }
  };

  React.useEffect(() => {
    setEditedPrompt(outputs.imagePrompt);
  }, [outputs.imagePrompt]);

  React.useEffect(() => {
    setEditedCharDesc(outputs.characterDescription || '');
  }, [outputs.characterDescription]);

  React.useEffect(() => {
    setEditedLyrics(outputs.lyrics);
  }, [outputs.lyrics]);

  const handleCopyStyle = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setCustomImage(base64);
        setSelectedType('full'); 
        
        // Describe the image and update prompt
        setIsDescribing(true);
        try {
          const description = await describeImage(base64);
          const newPrompt = `${description} ${outputs.textOverlayInstructions}`;
          setEditedPrompt(newPrompt);
        } catch (err) {
          console.error("Failed to describe image:", err);
        } finally {
          setIsDescribing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'lyrics' as TabId, label: 'Lyrics', icon: <Music size={16} />, title: 'Output 1: Lirik Lagu Suno' },
    { id: 'style' as TabId, label: 'Style', icon: <Palette size={16} />, title: 'Output 2: Style Prompt Suno' },
    { id: 'image' as TabId, label: 'Thumbnail', icon: <ImageIcon size={16} />, title: 'Output 3: Prompt AI Image' },
    { id: 'visuals' as TabId, label: 'Visuals', icon: <Clapperboard size={16} />, title: 'Output 5: Visual Assets' },
    { id: 'seo' as TabId, label: 'SEO', icon: <Search size={16} />, title: 'Output 4: Metadata SEO YouTube' },
    { id: 'history' as TabId, label: 'History', icon: <History size={16} />, title: 'History & Pilihan Sebelumnya' },
  ];

  const handleDownloadImage = (url?: string, filename: string = 'image.png') => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${Date.now()}.png`;
    link.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    } else {
      alert('Mohon drop file audio (MP3/WAV).');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'lyrics':
        return (
          <div className="space-y-6">
            {/* Editable Lyrics Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel overflow-hidden neon-border"
            >
              <div className="px-6 py-4 border-b border-slate-300 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-200/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="text-primary-500"><Music size={16} /></div>
                  <h3 className="font-mono text-xs uppercase tracking-widest font-bold">Output 1: Lirik Lagu Suno (Editable)</h3>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center p-1 bg-black/10 dark:bg-black/40 rounded-lg border border-slate-300/50 dark:border-white/10 shrink-0">
                    <button
                      onClick={() => setLyricMode('edit')}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-colors ${lyricMode === 'edit' ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70'}`}
                    >
                      EDIT TEXT
                    </button>
                    <button
                      onClick={() => setLyricMode('select')}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-colors ${lyricMode === 'select' ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70'}`}
                    >
                      PILIH BARIS
                    </button>
                  </div>
                  <button
                    onClick={handleEnhanceLyrics}
                    disabled={isEnhancing}
                    className="p-2 bg-primary-500/10 border border-primary-500/20 hover:bg-primary-500/20 rounded-lg transition-colors flex items-center gap-2 text-xs font-mono text-primary-500 disabled:opacity-50"
                  >
                    {isEnhancing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span className="hidden lg:inline">Enhance Lirik (Suno Tags)</span>
                  </button>
                  <button
                    onClick={handleCheckSelection}
                    className="p-2 bg-primary-500 border border-primary-500 hover:bg-primary-600 rounded-lg transition-colors flex items-center gap-2 text-xs font-mono text-white shadow-sm shadow-primary-500/20"
                  >
                    <Wand2 size={14} />
                    <span>Remix</span>
                  </button>
                  <button
                    onClick={() => handleCopyStyle(editedLyrics, 0)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-xs font-mono text-primary-500/70 hover:text-primary-500"
                  >
                    {copiedIndex === 0 ? <Check size={14} className="text-primary-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="p-6 relative">
                <AnimatePresence>
                  {showRemixModal && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute z-10 top-4 left-6 right-6 bg-white/90 dark:bg-black/90 p-4 border border-primary-500/50 shadow-2xl shadow-primary-500/20 rounded-xl mb-4 space-y-4 backdrop-blur-md"
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-600 dark:text-white/50 uppercase font-mono tracking-widest border-b border-slate-300 dark:border-white/10 pb-2">
                        <span className="flex items-center gap-2"><Wand2 size={12}/> Remix Lirik Terpilih</span>
                        <button onClick={() => { setShowRemixModal(false); setSelectedLines([]); }} className="hover:text-white"><X size={14}/></button>
                      </div>
                      <p className="text-primary-300 font-mono text-sm italic py-2 border-l-2 border-primary-500/50 pl-3 line-clamp-3">
                        {remixSelection.text}
                      </p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={remixInstruction}
                          onChange={(e) => setRemixInstruction(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRemixLyrics()}
                          placeholder="Pilih arah perubahan. Contoh: Buat lirik lebih sedih, Ganti bahasa santai..."
                          className="flex-1 bg-slate-100 dark:bg-black/60 border border-primary-500/30 rounded-lg px-4 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                        />
                        <button 
                          onClick={handleRemixLyrics}
                          disabled={isRemixing || !remixInstruction}
                          className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-lg px-6 py-2 text-xs font-bold transition-colors flex items-center gap-2 uppercase tracking-widest"
                        >
                          {isRemixing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} 
                          Remix
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {lyricMode === 'edit' ? (
                  <textarea
                    ref={lyricsTextAreaRef}
                    value={editedLyrics}
                    onChange={(e) => setEditedLyrics(e.target.value)}
                    className="w-full bg-white/80 dark:bg-black/40 p-6 rounded-xl border border-slate-200 dark:border-white/5 font-mono text-base text-primary-50/90 leading-loose whitespace-pre-wrap focus:outline-none focus:border-primary-500/50 transition-colors min-h-[400px] resize-y custom-scrollbar"
                    placeholder="Edit lirik di sini..."
                    style={{ letterSpacing: '0.02em' }}
                  />
                ) : (
                  <div className="w-full bg-white/80 dark:bg-black/40 p-6 rounded-xl border border-slate-200 dark:border-white/5 font-mono text-base leading-loose whitespace-pre-wrap transition-colors min-h-[400px] select-none shadow-inner">
                    <p className="text-xs text-primary-500 mb-6 bg-primary-500/10 p-3 rounded-lg border border-primary-500/20 italic">
                      Mode Pilih Baris: Sentuh/klik satu atau lebih baris untuk memilihnya, lalu tekan "Remix" di atas.
                    </p>
                    <div className="flex flex-col gap-1">
                      {editedLyrics.split('\n').map((line, i) => {
                        const isSelected = selectedLines.includes(i);
                        return (
                          <div 
                            key={i}
                            onClick={() => {
                              if (selectedLines.length === 0) {
                                setSelectedLines([i]);
                              } else if (selectedLines.length === 1) {
                                const start = Math.min(selectedLines[0], i);
                                const end = Math.max(selectedLines[0], i);
                                const next = [];
                                for (let j = start; j <= end; j++) next.push(j);
                                setSelectedLines(next);
                              } else {
                                setSelectedLines([i]);
                              }
                            }}
                            className={`cursor-pointer px-4 rounded-lg min-h-[2rem] border transition-colors ${
                              isSelected 
                                ? 'bg-primary-500/20 border-primary-500/50 text-primary-700 dark:text-primary-300' 
                                : 'hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-800 dark:text-white/80 border-transparent'
                            }`}
                          >
                            {line || '\u00A0'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Translation Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel overflow-hidden border-slate-200 dark:border-white/5"
            >
              <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-200/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="text-primary-500/50"><Languages size={16} /></div>
                  <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-slate-500 dark:text-white/40">Terjemahan Bahasa Indonesia</h3>
                </div>
                <button
                  onClick={() => handleCopyStyle(outputs.translation, 1)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-xs font-mono text-white/30 hover:text-white/60"
                >
                  {copiedIndex === 1 ? <Check size={14} /> : <Copy size={14} />}
                  {copiedIndex === 1 ? 'Copied!' : 'Copy Translation'}
                </button>
              </div>
              <div className="p-6 bg-black/20">
                <div className="text-sm text-slate-600 dark:text-white/50 leading-loose whitespace-pre-wrap font-mono italic">
                  {outputs.translation}
                </div>
              </div>
            </motion.div>
          </div>
        );
      case 'style':
        return (
          <div className="space-y-6">
            <div className="glass-panel p-6 neon-border bg-slate-200/50 dark:bg-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-primary-500"><Palette size={20} /></div>
                <h3 className="font-mono text-xs uppercase tracking-widest font-bold">Pilih Variasi Style Suno</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {outputs.stylePrompts.map((style, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative bg-white/80 dark:bg-black/40 p-4 rounded-xl border border-slate-200 dark:border-white/5 hover:border-primary-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-primary-500/50">
                        Variasi {idx + 1}: {idx === 0 ? 'Standard' : idx === 1 ? 'Experimental' : 'Intense'}
                      </span>
                      <button
                        onClick={() => handleCopyStyle(style, idx)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-[10px] font-mono text-primary-500/70 hover:text-primary-500"
                      >
                        {copiedIndex === idx ? <Check size={12} className="text-primary-500" /> : <Copy size={12} />}
                        {copiedIndex === idx ? 'Copied!' : 'Copy Style'}
                      </button>
                    </div>
                    <p className="font-mono text-sm text-primary-400 break-words pr-12">
                      {style}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="space-y-6">
            {/* Base Images Section */}
            <div className="glass-panel p-6 neon-border space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-primary-500">1. Refine Karakter & Pilih Gambar Dasar</h3>
                  <p className="text-[10px] text-slate-500 dark:text-white/40">Edit deskripsi karakter di bawah ini, lalu klik Regenerate untuk melihat versi baru.</p>
                </div>
              </div>

              {/* Character Description Input */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-white/40">
                  <User size={12} /> Deskripsi Karakter (Prompt Visual)
                </label>
                <div className="flex gap-3">
                  <textarea
                    value={editedCharDesc}
                    onChange={(e) => setEditedCharDesc(e.target.value)}
                    className="flex-1 bg-white/80 dark:bg-black/40 p-3 rounded-xl border border-slate-300 dark:border-white/10 font-mono text-xs text-primary-400 h-20 focus:outline-none focus:border-primary-500/50 transition-colors resize-none"
                    placeholder="Contoh: Wanita berhijab biru, senyum tipis, latar pantai"
                  />
                  <button
                    onClick={() => onRegenerateBaseImages(editedCharDesc)}
                    disabled={isGeneratingImage}
                    className="px-6 bg-primary-500/10 border border-primary-500/30 text-primary-500 rounded-xl hover:bg-primary-500/20 transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={isGeneratingImage ? 'animate-spin' : ''} />
                    <span className="text-[9px] font-mono uppercase tracking-widest">Regenerate</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Full Body Version */}
                <div className="space-y-3">
                  <div 
                    onClick={() => { setSelectedType('full'); setCustomImage(null); }}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                      selectedType === 'full' && !customImage ? 'border-primary-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-slate-300 dark:border-white/10 hover:border-white/30'
                    }`}
                  >
                    {outputs.generatedImageFull ? (
                      <>
                        <img src={outputs.generatedImageFull} alt="Full Body" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className={`absolute top-2 right-2 p-1.5 rounded-full ${selectedType === 'full' && !customImage ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-black/60 text-slate-500 dark:text-white/40'}`}>
                          <Check size={12} />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-white/10 italic text-xs">Generating...</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-white/60">Full Body Shot</span>
                    {outputs.generatedImageFull && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownloadImage(outputs.generatedImageFull, 'base-full'); }}
                        className="text-slate-500 dark:text-white/40 hover:text-primary-500 transition-colors"
                      >
                        <Download size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Close Up Version */}
                <div className="space-y-3">
                  <div 
                    onClick={() => { setSelectedType('close'); setCustomImage(null); }}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                      selectedType === 'close' && !customImage ? 'border-primary-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-slate-300 dark:border-white/10 hover:border-white/30'
                    }`}
                  >
                    {outputs.generatedImageClose ? (
                      <>
                        <img src={outputs.generatedImageClose} alt="Close Up" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className={`absolute top-2 right-2 p-1.5 rounded-full ${selectedType === 'close' && !customImage ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-black/60 text-slate-500 dark:text-white/40'}`}>
                          <Check size={12} />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-white/10 italic text-xs">Generating...</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-white/60">Close Up Portrait</span>
                    {outputs.generatedImageClose && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownloadImage(outputs.generatedImageClose, 'base-close'); }}
                        className="text-slate-500 dark:text-white/40 hover:text-primary-500 transition-colors"
                      >
                        <Download size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Custom Upload Version */}
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center gap-2 ${
                      customImage ? 'border-primary-500 border-solid shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-slate-300 dark:border-white/10 hover:border-white/30 bg-slate-200/50 dark:bg-white/5'
                    }`}
                  >
                    {customImage ? (
                      <>
                        <img src={customImage} alt="Custom Upload" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-white/80 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-900 dark:text-white">Ganti Gambar</span>
                        </div>
                        <div className={`absolute top-2 right-2 p-1.5 rounded-full ${isDescribing ? 'bg-blue-500' : 'bg-primary-500'} text-white`}>
                          {isDescribing ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 rounded-full bg-slate-200/50 dark:bg-white/5 text-slate-500 dark:text-white/40 group-hover:text-primary-500 transition-colors">
                          <Download size={20} className="rotate-180" />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-white/40 group-hover:text-white/60">Upload Custom</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-white/60">Custom Reference</span>
                    {customImage && (
                      <button 
                        onClick={() => setCustomImage(null)}
                        className="text-slate-500 dark:text-white/40 hover:text-red-500 transition-colors"
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Editor Section */}
            <OutputCard 
              key="image-prompt" 
              title="2. Edit Image Prompt (With Text Instructions)" 
              content={editedPrompt} 
              icon={<Palette size={16} />} 
              extra={
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <textarea
                      value={editedPrompt}
                      onChange={(e) => setEditedPrompt(e.target.value)}
                      className="w-full bg-white/80 dark:bg-black/40 p-4 rounded-xl border border-slate-300 dark:border-white/10 font-mono text-sm text-primary-400 h-48 focus:outline-none focus:border-primary-500/50 transition-colors resize-none"
                      placeholder="Edit your image prompt here..."
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => { setEditedPrompt(outputs.imagePrompt); setCustomImage(null); setSelectedType('full'); }}
                      className="px-6 py-4 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-mono uppercase tracking-widest hover:bg-white/5 transition-colors"
                    >
                      Reset AI Prompt
                    </button>
                    <button
                      onClick={() => onGenerateFinalThumbnail(editedPrompt, selectedType, customImage || undefined)}
                      disabled={isGeneratingImage || isDescribing}
                      className="flex-1 flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all group"
                    >
                      {isGeneratingImage ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : (
                        <>
                          {customImage ? 'Generate Final (Using Custom Image)' : `Generate Final Thumbnail (${selectedType === 'full' ? 'Full Body' : 'Close Up'})`}
                          <ImageIcon size={18} className="group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              }
            />

            {/* Final Thumbnail Result */}
            <AnimatePresence>
              {outputs.generatedThumbnail && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel p-6 neon-border space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-primary-500">3. Hasil Thumbnail Final & Preview CTR</h3>
                      <p className="text-[10px] text-slate-500 dark:text-white/40 mt-1">Mockup tampilan YouTube (desktop) untuk menilai Click-Through Rate.</p>
                    </div>
                    <button
                      onClick={() => handleDownloadImage(outputs.generatedThumbnail, 'final-thumbnail')}
                      className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-primary-500/50 hover:text-primary-500 transition-colors"
                    >
                      <Download size={12} />
                      Download Final
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* The Full Size Image */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-primary-500/30 bg-white/80 dark:bg-black/40 shadow-2xl shadow-primary-500/10">
                      <img 
                        src={outputs.generatedThumbnail} 
                        alt="Final Thumbnail" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    {/* The YouTube Mockup */}
                    <div className="flex items-center justify-center bg-white/80 dark:bg-black/40 rounded-2xl p-6 border border-slate-200 dark:border-white/5">
                      <YouTubePreview 
                        thumbnail={outputs.generatedThumbnail} 
                        title={outputs.seoMetadata.titles[0] || 'Official Music Video'} 
                        channelName={channelName || 'Music Label'} 
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      case 'visuals':
        return (
          <div className="space-y-8">
            <div className="glass-panel p-6 neon-border bg-slate-200/50 dark:bg-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-primary-500 flex items-center gap-2">
                    <Clapperboard size={14} /> Visual Assets ({outputs.visualAssets.scenes.length} Scenes)
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-white/40">Prompt gambar dan video berdasarkan alur lirik lagu untuk produksi MV.</p>
                </div>
                <button
                  onClick={() => setIsStoryboardOpen(true)}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] shadow-primary-500/30"
                >
                  <Play size={14} />
                  Storyboard Mode
                </button>
              </div>
              
              <div className="p-4 bg-white/80 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-primary-500/50">
                  <User size={10} /> Consistency Reference
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono uppercase text-white/20">Character</span>
                    <p className="text-[10px] text-slate-600 dark:text-white/60 line-clamp-2 italic">"{outputs.characterDescription || 'Sesuai target audience'}"</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono uppercase text-white/20">Main Location</span>
                    <p className="text-[10px] text-slate-600 dark:text-white/60 line-clamp-2 italic">"{outputs.imagePrompt.split('mimicking a')[0].split('features')[1]?.trim() || 'Sesuai input awal'}"</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {outputs.visualAssets.scenes.map((scene, idx) => (
                <SceneCard 
                  key={scene.id} 
                  scene={scene} 
                  idx={idx} 
                  onGenerate={() => onGenerateSceneImage(scene.id, scene.imagePrompt)}
                  isGenerating={isGeneratingImage}
                  onDownload={() => handleDownloadImage(scene.generatedImage, `scene-${idx + 1}`)}
                  onUpdatePrompt={(newPrompt) => {
                    // Local update for the prompt if needed, but App state is better
                    // For now we just use the current prompt
                  }}
                />
              ))}
            </div>
          </div>
        );
      case 'seo':
        const seo = outputs.seoMetadata;
        return (
          <div className="space-y-6">
            <div className="glass-panel p-6 neon-border bg-slate-200/50 dark:bg-white/5 space-y-8">
              {/* Titles Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-primary-500"><Search size={18} /></div>
                  <h3 className="font-mono text-xs uppercase tracking-widest font-bold">Pilihan Judul Video</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {seo.titles.map((title, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white/80 dark:bg-black/40 p-3 rounded-xl border border-slate-200 dark:border-white/5 group">
                      <span className="flex-1 text-sm text-white/80">{title}</span>
                      <button
                        onClick={() => handleCopyStyle(title, 100 + idx)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-primary-500/70 hover:text-primary-500"
                      >
                        {copiedIndex === 100 + idx ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-primary-500"><Search size={18} /></div>
                    <h3 className="font-mono text-xs uppercase tracking-widest font-bold">Deskripsi Video</h3>
                  </div>
                  <button
                    onClick={() => handleCopyStyle(seo.description, 200)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-lg text-[10px] font-mono uppercase tracking-widest text-primary-500 hover:bg-primary-500/20 transition-all"
                  >
                    {copiedIndex === 200 ? <Check size={12} /> : <Copy size={12} />}
                    {copiedIndex === 200 ? 'Copied!' : 'Copy Description'}
                  </button>
                </div>
                <div className="bg-white/80 dark:bg-black/40 p-4 rounded-xl border border-slate-200 dark:border-white/5 max-h-60 overflow-y-auto custom-scrollbar">
                  <p className="text-xs text-slate-600 dark:text-white/60 whitespace-pre-wrap leading-relaxed">{seo.description}</p>
                </div>
              </div>

              {/* Tags & Pinned Comment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-white/40">Tags (Keywords)</h3>
                    <button onClick={() => handleCopyStyle(seo.tags, 300)} className="text-primary-500/50 hover:text-primary-500 transition-colors">
                      {copiedIndex === 300 ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="bg-white/80 dark:bg-black/40 p-3 rounded-xl border border-slate-200 dark:border-white/5 text-[10px] text-primary-500/70 font-mono break-words">
                    {seo.tags}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-white/40">Pin Komen</h3>
                    <button onClick={() => handleCopyStyle(seo.pinnedComment, 400)} className="text-primary-500/50 hover:text-primary-500 transition-colors">
                      {copiedIndex === 400 ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="bg-white/80 dark:bg-black/40 p-3 rounded-xl border border-slate-200 dark:border-white/5 text-[10px] text-slate-600 dark:text-white/60 italic">
                    "{seo.pinnedComment}"
                  </div>
                </div>
              </div>

              {/* Shorts Section */}
              <div className="pt-6 border-t border-slate-200 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-red-500"><Radio size={18} /></div>
                  <h3 className="font-mono text-xs uppercase tracking-widest font-bold">YouTube Shorts Metadata</h3>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <span className="text-[9px] font-mono uppercase text-red-500/50 block mb-1">Shorts Title</span>
                      <p className="text-xs text-white/80">{seo.shorts.title}</p>
                    </div>
                    <button onClick={() => handleCopyStyle(seo.shorts.title, 500)} className="text-red-500/50 hover:text-red-500 transition-colors">
                      {copiedIndex === 500 ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <span className="text-[9px] font-mono uppercase text-red-500/50 block mb-1">Shorts Description</span>
                      <p className="text-[10px] text-slate-500 dark:text-white/40 line-clamp-2">{seo.shorts.description}</p>
                    </div>
                    <button onClick={() => handleCopyStyle(seo.shorts.description, 600)} className="text-red-500/50 hover:text-red-500 transition-colors">
                      {copiedIndex === 600 ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'history': {
        return (
          <HistoryList 
            history={history}
            onLoadHistory={onLoadHistory}
            onDeleteHistory={onDeleteHistory}
            onUpdateHistory={onUpdateHistory}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="mt-12 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-slate-300/50 dark:bg-white/10"></div>
        <h2 className="font-serif italic text-2xl text-slate-600 dark:text-white/50">Production Assets</h2>
        <div className="h-px flex-1 bg-slate-300/50 dark:bg-white/10"></div>
      </div>

      {/* Audio Dropzone & Player */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full mb-8 rounded-2xl border-2 transition-all flex flex-col p-6 ${isDragging ? 'border-primary-500 border-solid bg-primary-500/10 scale-[1.02]' : 'border-dashed border-slate-300 dark:border-white/10 bg-slate-200/50 dark:bg-white/5 hover:border-primary-500/30'}`}
      >
        {audioUrl ? (
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0 md:w-1/4">
                 <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 flex-shrink-0 animate-pulse">
                    <Music size={20}/>
                 </div>
                 <div className="min-w-0 flex-1">
                   <h4 className="text-primary-400 font-mono text-sm uppercase tracking-widest truncate">Suno Track Loaded</h4>
                   <p className="text-slate-500 dark:text-white/40 text-xs truncate">Audio sinkron aktif</p>
                 </div>
              </div>
              <AudioVisualizer audioRef={audioRef} />
              <div className="flex-1 w-full max-w-xl mx-auto flex items-center gap-4 md:w-auto">
                <audio ref={audioRef} controls src={audioUrl} className="w-full outline-none" />
                <button 
                  onClick={() => {
                    if (audioUrl) URL.revokeObjectURL(audioUrl);
                    setAudioUrl(null);
                  }} 
                  className="w-10 h-10 rounded-full bg-slate-200/50 dark:bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 dark:text-white/40 hover:text-white transition-colors flex-shrink-0"
                  title="Remove Audio"
                >
                  <X size={16}/>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center pointer-events-none py-2">
            <div className="text-primary-500/50 mb-3 flex justify-center"><Download size={28} /></div>
            <p className="text-white/80 font-sans text-sm mb-1 font-medium">Drag & Drop file lagu Suno (MP3) ke sini</p>
            <p className="text-slate-500 dark:text-white/40 font-mono text-xs uppercase tracking-widest">Dengarkan lagu sambil mengedit lirik & gambar adegan</p>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>

      {/* Mobile-Friendly Android-Style Bottom Navigation using Portal to escape transforms */}
      {typeof document !== 'undefined' && createPortal(
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-50/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-t border-slate-300 dark:border-white/10 pb-safe">
          <div className="flex items-center justify-around w-full max-w-2xl mx-auto h-16">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center h-full gap-1 transition-all ${
                  activeTab === tab.id
                    ? 'text-primary-500'
                    : 'text-slate-500 dark:text-white/40 hover:text-white/70'
                }`}
              >
                <div className={`p-1 rounded-full transition-all duration-300 ${activeTab === tab.id ? 'bg-primary-500/20' : 'bg-transparent'}`}>
                  {React.cloneElement(tab.icon as React.ReactElement<any>, { size: 20 })}
                </div>
                <span className="text-[10px] font-sans font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      <StoryboardModal 
        isOpen={isStoryboardOpen}
        onClose={() => setIsStoryboardOpen(false)}
        scenes={outputs.visualAssets.scenes}
        audioRef={audioRef}
        onGenerateSceneImage={onGenerateSceneImage}
        isGeneratingImage={isGeneratingImage}
      />
    </div>
  );
};
