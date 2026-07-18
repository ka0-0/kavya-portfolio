import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  "Hello! I'm AI.KAV.",
  "Welcome to Kavya's portfolio.",
  "Don't tell the big robot...",
  "...but I think I'm cuter. 🥺"
];

const IDLE_MESSAGES = [
  "Analyzing system parameters... all nominal.",
  "Kavya's models are performing at maximum efficiency.",
  "Just calibrating the local quantum node.",
  "Scanning portfolio structure... clean CSS detected.",
  "I wonder if the big robot is listening..."
];

let isDialogueCompletedGlobal = false;

export default function AIKAVDialogueBubble({
  homeCoords,
  activeSection,
  isTransitioning,
  onRobotGlance,
  onAIKAVLookAway
}) {
  const [isDialogueCompleted, setIsDialogueCompleted] = useState(isDialogueCompletedGlobal);
  const [currentMsg, setCurrentMsg] = useState(MESSAGES[0]);
  const [msgIndex, setMsgIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isFadingText, setIsFadingText] = useState(false);
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  const hasTriggeredReactionsRef = useRef(false);

  // Ref-based idle dialogue timing
  const isIdlePhaseRef = useRef(false);
  const nextIdleTimeRef = useRef(0);
  const lastDialogueEndRef = useRef(0);
  const hasEmittedReactionRef = useRef(false);
  const idleTimerRef = useRef(null);

  const isHomeActive = activeSection === 'home' && !isTransitioning;

  const scheduleNextIdleDialogue = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    
    const delay = 20000 + Math.random() * 15000; // 20-35 seconds
    lastDialogueEndRef.current = Date.now();
    nextIdleTimeRef.current = lastDialogueEndRef.current + delay;

    idleTimerRef.current = setTimeout(() => {
      if (!isHomeActive) return;

      const randomMsg = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
      setCurrentMsg(randomMsg);
      setCharIndex(0);
      setIsTyping(true);
      setIsFadingText(false);
      setIsBubbleVisible(true);
      hasEmittedReactionRef.current = false;
    }, delay);
  };

  useEffect(() => {
    if (isDialogueCompleted) {
      setIsBubbleVisible(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    if (isHomeActive) {
      setMsgIndex(0);
      setCurrentMsg(MESSAGES[0]);
      setCharIndex(0);
      setIsTyping(true);
      setIsFadingText(false);
      setIsBubbleVisible(true);
      hasTriggeredReactionsRef.current = false;
      isIdlePhaseRef.current = false;
      hasEmittedReactionRef.current = false;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    } else {
      setIsBubbleVisible(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    }
  }, [isHomeActive, isDialogueCompleted]);

  useEffect(() => {
    const handleReactionComplete = () => {
      isDialogueCompletedGlobal = true;
      setIsDialogueCompleted(true);
    };
    window.addEventListener('robot-reaction-complete', handleReactionComplete);
    return () => {
      window.removeEventListener('robot-reaction-complete', handleReactionComplete);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isDialogueCompleted || !isHomeActive || !isBubbleVisible) return;

    if (isTyping && !isFadingText) {
      if (charIndex < currentMsg.length) {
        const charTimer = setTimeout(() => {
          setCharIndex((prev) => prev + 1);
        }, 20); // 30ms -> 20ms (33% faster typewriter speed)
        return () => clearTimeout(charTimer);
      } else {
        setIsTyping(false);

        // Trigger the robot reaction when the exact intro message finishes typing
        if (currentMsg === "...but I think I'm cuter. 🥺" && !hasEmittedReactionRef.current) {
          hasEmittedReactionRef.current = true;
          window.dispatchEvent(new CustomEvent('orb-cute-joke'));
        }
      }
    }

    if (!isTyping && !isFadingText) {
      if (!isIdlePhaseRef.current) {
        // Intro phase progression
        if (msgIndex < MESSAGES.length - 1) {
          const pauseDuration = msgIndex === 2 ? 1000 : 800; // 1500/1200ms -> 1000/800ms (33% shorter pause)
          const pauseTimer = setTimeout(() => {
            setIsFadingText(true);
          }, pauseDuration);
          return () => clearTimeout(pauseTimer);
        } else if (msgIndex === MESSAGES.length - 1) {
          if (!hasTriggeredReactionsRef.current) {
            hasTriggeredReactionsRef.current = true;
            if (onRobotGlance && onAIKAVLookAway) {
              onRobotGlance(true);
              setTimeout(() => {
                onRobotGlance(false);
                onAIKAVLookAway(true);
                setTimeout(() => {
                  onAIKAVLookAway(false);
                }, 300);
              }, 800);
            }
          }

          const finalTimer = setTimeout(() => {
            setIsBubbleVisible(false);
            isIdlePhaseRef.current = true;
            scheduleNextIdleDialogue();
          }, 2500); // 4000ms -> 2500ms (37.5% shorter wait before fade)
          return () => clearTimeout(finalTimer);
        }
      } else {
        // Idle phase: hold the message for 2 seconds (was 3 seconds), then fade out
        const idlePauseTimer = setTimeout(() => {
          setIsFadingText(true);
        }, 2000); // 3000ms -> 2000ms (33% shorter hold)
        return () => clearTimeout(idlePauseTimer);
      }
    }

    if (isFadingText) {
      const fadeTimer = setTimeout(() => {
        if (!isIdlePhaseRef.current) {
          const nextIdx = msgIndex + 1;
          setMsgIndex(nextIdx);
          setCurrentMsg(MESSAGES[nextIdx]);
          setCharIndex(0);
          setIsFadingText(false);
          setIsTyping(true);
        } else {
          // Fade complete for idle message: hide bubble and schedule next
          setIsBubbleVisible(false);
          setIsFadingText(false);
          scheduleNextIdleDialogue();
        }
      }, 200);
      return () => clearTimeout(fadeTimer);
    }
  }, [
    isHomeActive,
    isBubbleVisible,
    msgIndex,
    currentMsg,
    charIndex,
    isTyping,
    isFadingText,
    onRobotGlance,
    onAIKAVLookAway,
    isDialogueCompleted
  ]);

  if (!homeCoords || !homeCoords.centerX || !homeCoords.centerY || typeof document === 'undefined') return null;

  // Align bubble directly under orb center
  const targetX = homeCoords.centerX - 25;
  const targetY = homeCoords.centerY + 45;

  return createPortal(
    <AnimatePresence>
      {isHomeActive && isBubbleVisible && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed z-[1000] pointer-events-none select-none"
          style={{
            left: `${targetX}px`,
            top: `${targetY}px`,
            transform: 'translateX(-50%)',
            maxWidth: '320px',
            width: 'fit-content',
            height: 'auto',
            overflow: 'visible',
          }}
        >
          {/* Floating glass notification container */}
          <div
            className="relative rounded-[16px]"
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '320px',
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
              className={`text-white font-medium text-[13.5px] leading-[1.4] tracking-wide m-0 transition-opacity duration-200 ${isFadingText ? 'opacity-0' : 'opacity-100'
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
                    animation: 'aikav-cursor-blink 1s step-end infinite',
                  }}
                />
              )}
            </p>
          </div>

          <style>{`
            @keyframes aikav-cursor-blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
