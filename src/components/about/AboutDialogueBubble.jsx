import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  "Welcome to the About section.",
  "Here's where you'll learn a little more about Kavya.",
  "Mechanical engineer by education...",
  "...AI engineer by passion.",
  "He spends an unreasonable amount of time building things like me.",
  "I suppose that's a good thing."
];

export default function AboutDialogueBubble({ trigger }) {
  const [currentMsg, setCurrentMsg] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isFadingText, setIsFadingText] = useState(false);
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  // Sync starting the dialogue when the trigger prop becomes true
  useEffect(() => {
    if (trigger) {
      setMsgIndex(0);
      setCurrentMsg(MESSAGES[0]);
      setCharIndex(0);
      setIsTyping(true);
      setIsFadingText(false);
      setIsBubbleVisible(true);
    }
  }, [trigger]);

  // Dialogue progression (typewriter and message queue advance)
  useEffect(() => {
    if (!isBubbleVisible || !trigger) return;

    if (isTyping && !isFadingText) {
      if (charIndex < currentMsg.length) {
        const charTimer = setTimeout(() => {
          setCharIndex((prev) => prev + 1);
        }, 20); // Typewriter speed (20ms/char)
        return () => clearTimeout(charTimer);
      } else {
        setIsTyping(false);
      }
    }

    if (!isTyping && !isFadingText) {
      if (msgIndex < MESSAGES.length - 1) {
        const pauseTimer = setTimeout(() => {
          setIsFadingText(true);
        }, 800); // Wait 800ms before starting fade
        return () => clearTimeout(pauseTimer);
      } else {
        // Last message complete - wait and then hide bubble permanently
        const finalTimer = setTimeout(() => {
          setIsBubbleVisible(false);
        }, 2500); // Display final message for 2.5s
        return () => clearTimeout(finalTimer);
      }
    }

    if (isFadingText) {
      const fadeTimer = setTimeout(() => {
        const nextIdx = msgIndex + 1;
        setMsgIndex(nextIdx);
        setCurrentMsg(MESSAGES[nextIdx]);
        setCharIndex(0);
        setIsFadingText(false);
        setIsTyping(true);
      }, 200);
      return () => clearTimeout(fadeTimer);
    }
  }, [
    trigger,
    isBubbleVisible,
    msgIndex,
    currentMsg,
    charIndex,
    isTyping,
    isFadingText
  ]);

  const portalTarget = document.getElementById('aikav-placeholder-dock');
  if (!portalTarget) return null;

  return createPortal(
    <AnimatePresence>
      {isBubbleVisible && (
        <div
          className="absolute z-[1000] select-none"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 12px)',
            right: 0,
            transform: 'translateX(0)',
            width: 'max-content',
            maxWidth: '320px',
            height: 'auto',
            overflow: 'visible',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative rounded-[16px]"
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 'fit-content',
              height: 'auto',
              overflow: 'visible',
              background: 'rgba(8, 12, 18, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.15)',
              padding: '10px 14px',
              boxSizing: 'border-box',
              borderRadius: '16px',
            }}
          >
            {/* Typewriter text */}
            <p
              className={`text-white font-medium text-[13.5px] leading-[1.4] tracking-wide m-0 transition-opacity duration-200 ${
                isFadingText ? 'opacity-0' : 'opacity-100'
              }`}
              style={{
                margin: 0,
                padding: 0,
                height: 'auto',
                whiteSpace: 'normal',
                overflow: 'visible',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                textOverflow: 'clip',
              }}
            >
              {currentMsg.slice(0, charIndex)}
              {isTyping && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '14px',
                    background: '#38BDF8',
                    marginLeft: '2px',
                    verticalAlign: 'middle',
                    animation: 'aikav-about-cursor-blink 1s step-end infinite',
                  }}
                />
              )}
            </p>
          </motion.div>

          <style>{`
            @keyframes aikav-about-cursor-blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>,
    portalTarget
  );
}
