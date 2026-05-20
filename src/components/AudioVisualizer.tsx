import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rqRef = useRef<number>();

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth * window.devicePixelRatio;
        canvasRef.current.height = containerRef.current.clientHeight * window.devicePixelRatio;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const handlePlay = () => {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioContextClass();
          const analyzer = audioContext.createAnalyser();
          analyzer.fftSize = 128;
          analyzer.smoothingTimeConstant = 0.8;
          
          const source = audioContext.createMediaElementSource(audioEl);
          source.connect(analyzer);
          analyzer.connect(audioContext.destination);
          
          analyzerRef.current = analyzer;
          audioCtxRef.current = audioContext;
          sourceRef.current = source;
        }

        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }

        const canvas = canvasRef.current;
        if (!canvas || !analyzerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyzerRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const renderFrame = () => {
          if (!analyzerRef.current || !canvasRef.current) return;
          rqRef.current = requestAnimationFrame(renderFrame);
          
          analyzerRef.current.getByteFrequencyData(dataArray);

          const canvasNode = canvasRef.current;
          const context = canvasNode.getContext('2d');
          if (!context) return;
          
          const width = canvasNode.width;
          const height = canvasNode.height;
          
          context.clearRect(0, 0, width, height);

          // We'll draw symmetrically
          const barWidth = (width / bufferLength) * 1.5;
          let x = 0;

          // Draw the waveform
          const gradient = context.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, '#10b981'); // emerald-500
          gradient.addColorStop(1, '#059669'); // emerald-600

          for (let i = 0; i < bufferLength; i++) {
            // scale heights
            const scale = dataArray[i] / 255;
            const barHeight = scale * height;
            
            context.fillStyle = gradient;
            
            // Draw centered vertically
            const y = height - barHeight;
            
            // Draw with rounded top
            context.beginPath();
            context.roundRect(x, y, barWidth - 1, barHeight, [4, 4, 0, 0]);
            context.fill();

            x += barWidth;
          }
        };

        if (rqRef.current) cancelAnimationFrame(rqRef.current);
        renderFrame();
      } catch (err) {
        console.error("Failed to initialize Web Audio API:", err);
      }
    };

    const handlePause = () => {
      if (rqRef.current) {
        cancelAnimationFrame(rqRef.current);
      }
    };

    audioEl.addEventListener('play', handlePlay);
    audioEl.addEventListener('pause', handlePause);

    return () => {
      window.removeEventListener('resize', handleResize);
      audioEl.removeEventListener('play', handlePlay);
      audioEl.removeEventListener('pause', handlePause);
      if (rqRef.current) cancelAnimationFrame(rqRef.current);
    };
  }, [audioRef]);

  return (
    <div ref={containerRef} className="w-full h-16 md:h-12 flex-1 min-w-0 pointer-events-none opacity-80 mix-blend-screen overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" style={{ filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))' }} />
    </div>
  );
};
