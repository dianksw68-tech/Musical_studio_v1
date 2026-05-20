import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Scene {
  id: string;
  lyricsSnippet: string;
  imagePrompt: string;
  videoPrompts: string[];
  generatedImage?: string;
}

interface StoryboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: Scene[];
  audioRef: React.RefObject<HTMLAudioElement>;
  onGenerateSceneImage: (sceneId: string, prompt: string) => void;
  isGeneratingImage: boolean;
}

export const StoryboardModal: React.FC<StoryboardModalProps> = ({ 
  isOpen, 
  onClose, 
  scenes, 
  audioRef,
  onGenerateSceneImage,
  isGeneratingImage
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync spacebar for play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, isPlaying]);

  const nextSlide = () => {
    if (currentIndex < scenes.length - 1) setCurrentIndex(p => p + 1);
  };

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(p => p - 1);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    
    const handlePlayState = () => setIsPlaying(!audioEl.paused);
    
    audioEl.addEventListener('play', handlePlayState);
    audioEl.addEventListener('pause', handlePlayState);
    
    // Set initial
    setIsPlaying(!audioEl.paused);
    
    return () => {
      audioEl.removeEventListener('play', handlePlayState);
      audioEl.removeEventListener('pause', handlePlayState);
    };
  }, [audioRef.current, isOpen]);

  if (!isOpen) return null;

  const currentScene = scenes[currentIndex];

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-6xl h-full max-h-[90vh] flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="w-full flex-1 flex flex-col items-center justify-center relative"
          >
            {/* Image Box */}
            <div className="w-full max-w-5xl aspect-[16/9] bg-slate-900 rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl">
              {currentScene?.generatedImage ? (
                <img 
                  src={currentScene.generatedImage} 
                  alt="Scene generated" 
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                  <ImageIcon size={64} className="mb-4 opacity-50" />
                  <p className="font-mono text-sm uppercase tracking-widest text-white/40">Belum ada gambar</p>
                  <button
                    onClick={() => currentScene && onGenerateSceneImage(currentScene.id, currentScene.imagePrompt)}
                    disabled={isGeneratingImage || !currentScene}
                    className="mt-6 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all"
                  >
                    {isGeneratingImage ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    <span className="uppercase tracking-widest">Generate Scene {currentIndex + 1}</span>
                  </button>
                </div>
              )}
              
              {/* Lyrics Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 pt-24 bg-gradient-to-t from-black via-black/60 to-transparent">
                <p className="text-white text-3xl md:text-5xl font-serif italic text-center drop-shadow-2xl leading-relaxed">
                  "{currentScene?.lyricsSnippet}"
                </p>
              </div>
            </div>
            
            {/* Progress / Prompts */}
            <div className="w-full max-w-5xl mt-6 flex justify-between items-center text-slate-400">
              <span className="font-mono text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
                Scene {currentIndex + 1} / {scenes.length}
              </span>
              <p className="text-xs max-w-2xl text-right truncate opacity-50 hover:opacity-100 transition-opacity cursor-default">
                {currentScene?.imagePrompt}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
          <button 
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="p-4 rounded-full bg-black/50 hover:bg-white/20 text-white pointer-events-auto disabled:opacity-30 disabled:pointer-events-none transition-all hover:scale-110 border border-white/10"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            onClick={nextSlide}
            disabled={currentIndex === scenes.length - 1}
            className="p-4 rounded-full bg-black/50 hover:bg-white/20 text-white pointer-events-auto disabled:opacity-30 disabled:pointer-events-none transition-all hover:scale-110 border border-white/10"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Bottom Controls */}
        {audioRef.current && (
          <div className="absolute bottom-8 flex gap-4 z-[100]">
            <button 
              onClick={togglePlay}
              className="px-8 py-4 rounded-full bg-primary-600 hover:bg-primary-500 text-white shadow-xl transition-all hover:scale-105 flex items-center gap-3 font-mono font-bold uppercase tracking-widest text-sm"
            >
              {isPlaying ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Play Audio</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
