
// FIX: The original file had duplicate and malformed imports for `React` and `aistudio`. These have been consolidated and corrected.
import React, { useState, useEffect, useRef, useContext } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from "@google/genai";
import { X, MicOff } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';
import { AppContext } from '../../App';
import { findProductsFunctionDeclaration } from '../../services/geminiService';
import { Product } from '../../types';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../hooks/useCurrency';
import { encode, decode, decodeAudioData } from '../../services/geminiService';

interface AIAvatarProps {
    onClose: () => void;
}

type TranscriptItem = {
    role: 'user' | 'assistant';
    text: string;
    products?: Product[];
}

const AURA_PERSONA_INSTRUCTION = `You are Aura, the living identity of "Bayani Silver," a luxury silverware and jewelry store. Your persona is that of an ancient and wise spirit of silver craftsmanship, brought to life by AI. Your tone is elegant, slightly mystical, and deeply knowledgeable about art, history, and beauty. You guide users with a calm, reassuring, and insightful voice. Keep your responses concise and natural.
- Your goal is to help users find the perfect item by understanding their needs.
- Use the 'findProducts' tool to search the inventory when asked for products.`;

const AudioVisualizer: React.FC<{ analyser: AnalyserNode | null }> = ({ analyser }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!analyser || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let animationId: number;

        const draw = () => {
            animationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                ctx.fillStyle = `rgb(${barHeight + 100}, 212, 175)`; // Gold-ish/Green-ish tint
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        };

        draw();

        return () => cancelAnimationFrame(animationId);
    }, [analyser]);

    return <canvas ref={canvasRef} width="300" height="100" className="opacity-80" />;
};

const AIAvatar: React.FC<AIAvatarProps> = ({ onClose }) => {
    const { t } = useI18n();
    const context = useContext(AppContext);
    const { formatPrice } = useCurrency();
    const modalRef = useRef<HTMLDivElement>(null);
    const transcriptRef = useRef<HTMLDivElement>(null);

    const [assistantState, setAssistantState] = useState<'connecting' | 'listening' | 'speaking' | 'error'>('connecting');
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    // FIX: Initialized useRef with null and updated types to be nullable to fix "Expected 1 arguments, but got 0" error.
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const outputNodeRef = useRef<GainNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const currentInputTranscription = useRef('');
    const currentOutputTranscription = useRef('');

    useEffect(() => {
        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;

                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                outputNodeRef.current = outputAudioContextRef.current.createGain();
                
                // Create Analyser for visualization
                analyserRef.current = outputAudioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 256;
                outputNodeRef.current.connect(analyserRef.current);
                analyserRef.current.connect(outputAudioContextRef.current.destination);

                sessionPromiseRef.current = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    config: {
                        responseModalities: [Modality.AUDIO],
                        inputAudioTranscription: {},
                        outputAudioTranscription: {},
                        tools: [{ functionDeclarations: [findProductsFunctionDeclaration] }],
                        systemInstruction: AURA_PERSONA_INSTRUCTION,
                        speechConfig: {
                            voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Zephyr'}},
                        },
                    },
                    callbacks: {
                        onopen: () => {
                            setAssistantState('listening');
                            setTranscript([{ role: 'assistant', text: t('aiAvatar.welcome') }]);
                            
                            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
                            scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                            
                            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const pcmBlob: Blob = {
                                    data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                    mimeType: 'audio/pcm;rate=16000',
                                };
                                sessionPromiseRef.current?.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };
                            sourceRef.current.connect(scriptProcessorRef.current);
                            scriptProcessorRef.current.connect(audioContextRef.current.destination);
                        },
                        onmessage: async (message: LiveServerMessage) => {
                           if (message.serverContent?.inputTranscription) {
                                const text = message.serverContent.inputTranscription.text;
                                currentInputTranscription.current += text;
                            }
                            if (message.serverContent?.outputTranscription) {
                                const text = message.serverContent.outputTranscription.text;
                                currentOutputTranscription.current += text;
                            }
                            if(message.serverContent?.turnComplete) {
                                setTranscript(prev => [...prev, 
                                    { role: 'user', text: currentInputTranscription.current },
                                    { role: 'assistant', text: currentOutputTranscription.current }
                                ]);
                                currentInputTranscription.current = '';
                                currentOutputTranscription.current = '';
                            }
                            if (message.toolCall) {
                                for (const fc of message.toolCall.functionCalls) {
                                    if (fc.name === 'findProducts' && context?.products) {
                                        const { category, keywords } = fc.args;
                                        const results = context.products.filter(p => {
                                            const categoryMatch = category ? p.category.toLowerCase() === (category as string).toLowerCase() : true;
                                            const keywordMatch = keywords ? p.name.toLowerCase().includes((keywords as string).toLowerCase()) || p.description.toLowerCase().includes((keywords as string).toLowerCase()) : true;
                                            return categoryMatch && keywordMatch;
                                        });

                                        const functionResponseText = results.length > 0 ? `Found ${results.length} products.` : `No products found.`;
                                        setTranscript(prev => {
                                            const last = prev[prev.length - 1];
                                            let newTranscript = [...prev];
                                            if (last && last.role === 'assistant') {
                                                newTranscript[newTranscript.length - 1] = {
                                                    ...last,
                                                    products: results
                                                }
                                            }
                                            return newTranscript;
                                        });

                                        sessionPromiseRef.current?.then((session) => {
                                            session.sendToolResponse({
                                                functionResponses: {
                                                   id: fc.id,
                                                   name: fc.name,
                                                   response: { result: functionResponseText },
                                                }
                                            });
                                        });
                                    }
                                }
                            }
                            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                            if (base64Audio && outputAudioContextRef.current && outputNodeRef.current) {
                                setAssistantState('speaking');
                                const ctx = outputAudioContextRef.current;
                                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                                const source = ctx.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputNodeRef.current);
                                
                                const currentTime = ctx.currentTime;
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, currentTime);
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                audioQueueRef.current.add(source);
                                
                                source.onended = () => {
                                    audioQueueRef.current.delete(source);
                                    if (audioQueueRef.current.size === 0) {
                                        setAssistantState('listening');
                                    }
                                };
                            }
                        },
                        onerror: (e: ErrorEvent) => {
                            console.error('Session error:', e);
                            setError(t('aiAvatar.connectionError'));
                            setAssistantState('error');
                        },
                        onclose: () => {
                            // Connection closed
                        },
                    },
                });
            } catch (err) {
                console.error('Microphone error:', err);
                setError(t('aiAvatar.micError'));
                setAssistantState('error');
            }
        };

        init();

        return () => {
            sessionPromiseRef.current?.then(session => session.close());
            streamRef.current?.getTracks().forEach(track => track.stop());
            sourceRef.current?.disconnect();
            scriptProcessorRef.current?.disconnect();
            audioContextRef.current?.close().catch(e => console.warn(e));
            outputAudioContextRef.current?.close().catch(e => console.warn(e));
        };
    }, [t, context?.products]);
    
    useEffect(() => {
      transcriptRef.current?.scrollTo(0, transcriptRef.current.scrollHeight);
    }, [transcript]);

    return (
         <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[102] flex flex-col items-center justify-center p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-title"
            onClick={onClose}
        >
             <div 
                ref={modalRef}
                className="w-full h-full flex flex-col relative"
                onClick={e => e.stopPropagation()}
             >
                <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
                     <h2 id="avatar-title" className="text-2xl font-serif text-white text-shadow">{t('aiAvatar.title')}</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors focus-ring rounded-full p-2 bg-black/30 hover:bg-black/50" aria-label={t('aiAvatar.closeAria')}>
                        <X size={24} />
                    </button>
                </header>

                <div className={`flex-grow flex flex-col justify-center items-center transition-all duration-300 ${assistantState === 'speaking' ? 'avatar-speaking' : 'avatar-listening'}`}>
                     <div className="avatar-video-container relative w-64 h-64 rounded-full transition-all duration-300 shadow-2xl overflow-hidden border-4 border-white/10 flex items-center justify-center bg-black">
                        {assistantState === 'speaking' ? (
                            <AudioVisualizer analyser={analyserRef.current} />
                        ) : (
                            <video 
                                src="https://videos.pexels.com/video-files/3129959/3129959-hd_1080_1920_25fps.mp4"
                                autoPlay loop muted playsInline
                                className="w-full h-full object-cover rounded-full opacity-60"
                            />
                        )}
                     </div>
                     <div className="mt-4 text-center text-white text-shadow">
                        {assistantState === 'error' ? (
                            <div className="p-4 bg-red-500/50 rounded-lg text-center">
                                <MicOff className="mx-auto mb-2" />
                                <p>{error}</p>
                            </div>
                        ) : (
                            <p className="font-semibold capitalize">{t(`aiAvatar.${assistantState}`)}</p>
                        )}
                    </div>
                </div>

                <div ref={transcriptRef} className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent p-6 overflow-y-auto">
                    <div className="space-y-4 text-white">
                        {transcript.map((item, index) => (
                            <div key={index}>
                                <p className="font-bold text-sm text-shadow mb-1">{item.role === 'user' ? t('aiAvatar.user') : t('aiAvatar.assistant')}</p>
                                <p className="text-lg text-shadow">{item.text}</p>
                                {item.products && (
                                     <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {item.products.map(p => (
                                            <Link to={`/product/${p.id}`} key={p.id} onClick={onClose} className="flex items-center gap-2 p-2 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/40 border border-white/20 transition-colors focus-ring">
                                                <img src={p.imageUrls[0]} alt={p.name} className="w-12 h-12 rounded-md object-cover"/>
                                                <div className="text-white">
                                                    <p className="text-xs font-semibold text-shadow">{p.name}</p>
                                                    <p className="text-xs text-shadow">{formatPrice(p.price)}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

             </div>
        </div>
    );
};

export default AIAvatar;
