import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NOTIFICATION_POOL = [
  { id: 1, type: 'SYS_OK', msg: 'MODEL WEIGHTS SYNCED (99.8%)' },
  { id: 2, type: 'SEC_GATE', msg: 'BIOMETRIC IDENT VERIFIED - LVL 7' },
  { id: 3, type: 'GPU_BOOST', msg: 'TENSOR CORES ACTIVE (100% LOAD)' },
  { id: 4, type: 'NET_PULSE', msg: 'QUANTUM TUNNEL ENCRYPTED' },
  { id: 5, type: 'AI_CORE', msg: 'REASONING ENGINE ONLINE' },
  { id: 6, type: 'PACKET', msg: 'PACKET RECEIVED: #8492 ENCRYPTED' },
  { id: 7, type: 'SYS_READY', msg: 'AUTONOMOUS SUBAGENTS READY' },
];

export default function TacticalNotifications() {
  const [currentNotif, setCurrentNotif] = useState(null);

  useEffect(() => {
    const triggerNotif = () => {
      const next = NOTIFICATION_POOL[Math.floor(Math.random() * NOTIFICATION_POOL.length)];
      setCurrentNotif(next);

      // Auto-hide after 3.5 seconds
      setTimeout(() => {
        setCurrentNotif(null);
      }, 3500);
    };

    // First notification after 2.5 seconds, then every 7 seconds
    const initialTimer = setTimeout(triggerNotif, 2500);
    const interval = setInterval(triggerNotif, 7500);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <AnimatePresence>
        {currentNotif && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="cyber-notification-toast"
          >
            <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)] animate-ping" />
            <div>
              <span className="text-white/50 mr-1.5">[{currentNotif.type}]</span>
              <span className="text-[var(--accent-color)] font-bold">{currentNotif.msg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
