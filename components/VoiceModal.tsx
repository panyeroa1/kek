
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { MODELS, SYSTEM_INSTRUCTION } from '../constants';
import { decode, encode, decodeAudioData } from '../services/geminiService';

interface VoiceModalProps {
  onClose: () => void;
}

const VoiceModal: React.FC<VoiceModalProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [transcription, setTranscription] = useState('');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    startSession();
    return () => {
      stopSession();
    };
  }, []);

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: MODELS.LIVE,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: SYSTEM_INSTRUCTION + "\nRespond concisely. This is a voice conversation.",
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('Listening...');
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + " " + message.serverContent?.outputTranscription?.text);
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Error", e);
            setStatus('Error occurred');
          },
          onclose: () => {
            setStatus('Connection closed');
            setIsActive(false);
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Failed to start voice session');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    if (audioContextRef.current) audioContextRef.current.close();
    if (outAudioContextRef.current) outAudioContextRef.current.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl border border-white/10">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.5)] scale-110' : 'bg-slate-800'}`}>
          <div className={`w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center ${isActive ? 'animate-pulse' : ''}`}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">KEK Live</h2>
          <p className="text-slate-400 font-medium">{status}</p>
        </div>

        <div className="w-full bg-slate-800/50 rounded-2xl p-4 min-h-[100px] max-h-[200px] overflow-y-auto hide-scrollbar text-slate-300 italic text-center">
          {transcription || "Talk to KEK about viral products..."}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl transition-colors border border-white/5"
        >
          Exit Conversation
        </button>
      </div>
    </div>
  );
};

export default VoiceModal;
