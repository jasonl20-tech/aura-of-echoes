
import React, { useState, useRef } from 'react';
import { Mic, MicOff, Send, X } from 'lucide-react';

interface AudioRecorderProps {
  onSendAudio: (audioBlob: Blob) => void;
  disabled?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onSendAudio, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        console.log('Audio recorded, blob size:', blob.size);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Fehler beim Zugriff auf das Mikrofon. Bitte erlauben Sie den Mikrofonzugriff.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      console.log('Recording stopped');
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setRecordingDuration(0);
  };

  const sendAudio = () => {
    if (audioBlob) {
      console.log('Sending audio blob:', audioBlob);
      onSendAudio(audioBlob);
      setAudioBlob(null);
      setRecordingDuration(0);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioBlob) {
    return (
      <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
        <div className="flex items-center space-x-2 flex-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white text-sm">Audio aufgenommen ({formatDuration(recordingDuration)})</span>
        </div>
        <button
          onClick={cancelRecording}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>
        <button
          onClick={sendAudio}
          disabled={disabled}
          className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center space-x-2 bg-red-500/20 rounded-full px-4 py-2">
        <div className="flex items-center space-x-2 flex-1">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          <span className="text-white text-sm">Aufnahme... {formatDuration(recordingDuration)}</span>
        </div>
        <button
          onClick={stopRecording}
          className="bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors"
        >
          <MicOff className="w-4 h-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startRecording}
      disabled={disabled}
      className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
    >
      <Mic className="w-5 h-5 text-white" />
    </button>
  );
};

export default AudioRecorder;
