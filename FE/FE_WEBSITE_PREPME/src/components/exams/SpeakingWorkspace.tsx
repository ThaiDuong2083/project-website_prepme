import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Square } from 'lucide-react';

interface SpeakingWorkspaceProps {
  isRecording: boolean;
  recordingDuration: number;
  speakingLocalUrls: Record<number, string>;
  activeSectionIdx: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  formatTime: (seconds: number) => string;
}

export const SpeakingWorkspace: React.FC<SpeakingWorkspaceProps> = ({
  isRecording,
  recordingDuration,
  speakingLocalUrls,
  activeSectionIdx,
  startRecording,
  stopRecording,
  formatTime,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
      <div className="rounded-full bg-blue-50 p-6 border border-blue-100">
        {isRecording ? (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="rounded-full bg-red-500 p-6 text-white cursor-pointer"
            onClick={stopRecording}
          >
            <Square size={32} fill="white" />
          </motion.div>
        ) : (
          <button
            onClick={startRecording}
            className="rounded-full bg-blue-500 p-6 text-white hover:bg-blue-600 transition active:scale-95 cursor-pointer"
          >
            <Mic size={32} fill="white" />
          </button>
        )}
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-800 ">
          {isRecording ? 'Đang ghi âm...' : 'Sẵn sàng ghi âm'}
        </h4>
        <p className="text-xs text-slate-400 mt-1">
          {isRecording
            ? `Độ dài: ${formatTime(recordingDuration)}`
            : 'Nhấn vào mic để bắt đầu trả lời bằng giọng nói'}
        </p>
      </div>

      {/* Wave Equalizer Animation (simulated) */}
      {isRecording && (
        <div className="flex items-center gap-1 h-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: [8, Math.random() * 24 + 8, 8] }}
              transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5 }}
              className="w-1 bg-red-400 rounded-full"
            />
          ))}
        </div>
      )}

      {/* Playback preview */}
      {speakingLocalUrls[activeSectionIdx] && !isRecording && (
        <div className="w-full border border-blue-100 bg-blue-50/20 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 block mb-2">
            PREVIEW BẢN THU ÂM (PHẦN {activeSectionIdx + 1})
          </span>
          <audio
            src={speakingLocalUrls[activeSectionIdx]}
            controls
            className="mx-auto w-full"
          />
        </div>
      )}
    </div>
  );
};
