import React, { useState, useEffect, useRef } from 'react';
import './VoiceRecording.css';

interface VoiceRecordingProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  className?: string;
}

export const VoiceRecording: React.FC<VoiceRecordingProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  className = ''
}) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isRecording) {
      startAudioAnalysis();
    } else {
      stopAudioAnalysis();
    }

    return () => stopAudioAnalysis();
  }, [isRecording]);

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const analyze = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average / 255);
        }
        animationRef.current = requestAnimationFrame(analyze);
      };
      
      analyze();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopAudioAnalysis = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  return (
    <div className={`voice-recording ${className}`}>
      <button
        className={`voice-button ${isRecording ? 'recording' : ''}`}
        onClick={handleToggleRecording}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <div className="voice-button-inner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2ZM19 10V12C19 15.3 16.3 18 13 18V20H18V22H6V20H11V18C7.7 18 5 15.3 5 12V10H7V12C7 14.2 8.8 16 11 16H13C15.2 16 17 14.2 17 12V10H19Z"/>
          </svg>
        </div>
        
        {/* Waveform rings */}
        {isRecording && (
          <>
            <div 
              className="waveform-ring ring-1" 
              style={{ transform: `scale(${1 + audioLevel * 0.3})` }}
            />
            <div 
              className="waveform-ring ring-2" 
              style={{ transform: `scale(${1 + audioLevel * 0.5})` }}
            />
            <div 
              className="waveform-ring ring-3" 
              style={{ transform: `scale(${1 + audioLevel * 0.7})` }}
            />
          </>
        )}
      </button>
      
      {isRecording && (
        <div className="recording-indicator">
          <span className="recording-dot" />
          Recording...
        </div>
      )}
    </div>
  );
};
