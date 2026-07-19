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

const SKILLS_MESSAGES = [
  "Welcome to the Skills Matrix.",
  "Everything you see here has been tested in real projects.",
  "Current status: Constantly learning.",
  "I still can't convince Kavya to close his 47 browser tabs."
];

const PROJECTS_MESSAGES = [
  "Welcome to the Project Archive.",
  "These projects survived debugging. Barely.",
  "I've watched Kavya rename 'final_v2' more times than I'd like to admit.",
  "Feel free to inspect the work. I already have.",
  "Select a project. I'll try not to spoil the ending."
];

const CERTIFICATES_MESSAGES = [
  "Certification Vault online.",
  "Every certificate here represents another step forward.",
  "Humans collect certificates...",
  "I bite... I mean, collect dots."
];

const CONTACT_MESSAGES = [
  "Communication lines open.",
  "Have an idea, or just want to connect?",
  "Drop a message! Kavya is always down to chat.",
  "I'll make sure it goes straight to his inbox."
];

const RESUME_MESSAGES = [
  "Thank you for exploring Kavya's universe!",
  "I hope you had a great experience.",
  "Don't forget to grab the resume below.",
  "Safe travels, space explorer! 🚀"
];

let isDialogueCompletedGlobal = false;

export default function AIKAVDialogueBubble({
  homeCoords,
  skillsCoords,
  projectsCoords, // Add projectsCoords prop
  certificatesCoords, // Add certificatesCoords prop
  contactCoords, // Add contactCoords prop
  resumeCoords, // Add resumeCoords prop
  activeSection,
  isTransitioning,
  onRobotGlance,
  onAIKAVLookAway,
  onSpeakingChange
}) {
  const [isDialogueCompleted, setIsDialogueCompleted] = useState(isDialogueCompletedGlobal);
  const [currentMsg, setCurrentMsg] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isFadingText, setIsFadingText] = useState(false);
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  const [lockPromptActive, setLockPromptActive] = useState(false);
  const lockPromptActiveRef = useRef(false);
  const hasPlayedProjectsRef = useRef(false);

  const hasTriggeredReactionsRef = useRef(false);

  // Propagate speaking state changes to the parent immediately
  useEffect(() => {
    if (onSpeakingChange) {
      onSpeakingChange(isTyping && isBubbleVisible);
    }
  }, [isTyping, isBubbleVisible, onSpeakingChange]);

  // Ref-based idle dialogue timing
  const isIdlePhaseRef = useRef(false);
  const nextIdleTimeRef = useRef(0);
  const lastDialogueEndRef = useRef(0);
  const hasEmittedReactionRef = useRef(false);
  const idleTimerRef = useRef(null);

  const isHomeActive = activeSection === 'home' && !isTransitioning;
  const isSkillsActive = activeSection === 'skills' && !isTransitioning;
  const isProjectsActive = activeSection === 'projects' && !isTransitioning; // Add projects active flag
  const isCertificatesActive = activeSection === 'certificates' && !isTransitioning; // Add certificates active flag
  const isContactActive = activeSection === 'contact' && !isTransitioning;
  const isResumeActive = activeSection === 'resume' && !isTransitioning;

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

  // Section Activation & Reset Handler
  useEffect(() => {
    if (lockPromptActiveRef.current) return;

    if (!isHomeActive && !isSkillsActive && !isProjectsActive && !isCertificatesActive && !isContactActive && !isResumeActive) {
      setIsBubbleVisible(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    if (isHomeActive && isDialogueCompleted) {
      setIsBubbleVisible(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    if (isProjectsActive && hasPlayedProjectsRef.current) {
      setIsBubbleVisible(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    if (isProjectsActive) {
      hasPlayedProjectsRef.current = true;
    }

    // Initialize state when user enters either section
    const activeMsgs = isHomeActive
      ? MESSAGES
      : (isSkillsActive 
          ? SKILLS_MESSAGES 
          : (isProjectsActive 
              ? PROJECTS_MESSAGES 
              : (isCertificatesActive 
                  ? CERTIFICATES_MESSAGES 
                  : (isContactActive ? CONTACT_MESSAGES : RESUME_MESSAGES))));
    setMsgIndex(0);
    setCurrentMsg(activeMsgs[0]);
    setCharIndex(0);
    setIsTyping(true);
    setIsFadingText(false);
    setIsBubbleVisible(true);

    hasTriggeredReactionsRef.current = false;
    isIdlePhaseRef.current = false;
    hasEmittedReactionRef.current = false;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

  }, [isHomeActive, isSkillsActive, isProjectsActive, isCertificatesActive, isContactActive, isResumeActive, isDialogueCompleted]);

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

  // Listen for the Certificates replay request
  useEffect(() => {
    const handleReplayRequest = () => {
      lockPromptActiveRef.current = true;
      setLockPromptActive(true);
      setCurrentMsg("Wanna browse through certificates again?");
      setCharIndex(0);
      setMsgIndex(0);
      setIsTyping(true);
      setIsFadingText(false);
      setIsBubbleVisible(true);
    };

    window.addEventListener('certificates-replay-request', handleReplayRequest);
    return () => {
      window.removeEventListener('certificates-replay-request', handleReplayRequest);
    };
  }, []);

  // Auto-reset replay prompt state when leaving certificates section
  useEffect(() => {
    if (!isCertificatesActive) {
      lockPromptActiveRef.current = false;
      setLockPromptActive(false);
    }
  }, [isCertificatesActive]);

  const handleYes = () => {
    window.dispatchEvent(new CustomEvent('certificates-replay-response', { detail: { action: 'yes' } }));
    setIsBubbleVisible(false);
    lockPromptActiveRef.current = false;
    setLockPromptActive(false);
  };

  const handleNo = () => {
    window.dispatchEvent(new CustomEvent('certificates-replay-response', { detail: { action: 'no' } }));
    setIsBubbleVisible(false);
    lockPromptActiveRef.current = false;
    setLockPromptActive(false);
  };

  // Unified Dialogue Typewriter & Progression State Machine
  useEffect(() => {
    if (!isBubbleVisible || (!isHomeActive && !isSkillsActive && !isProjectsActive && !isCertificatesActive && !isContactActive && !isResumeActive)) return;

    const activeMsgs = isHomeActive
      ? MESSAGES
      : (isSkillsActive 
          ? SKILLS_MESSAGES 
          : (isProjectsActive 
              ? PROJECTS_MESSAGES 
              : (isCertificatesActive 
                  ? CERTIFICATES_MESSAGES 
                  : (isContactActive ? CONTACT_MESSAGES : RESUME_MESSAGES))));

    // 1. Typewriter Character Typing Loop
    if (isTyping && !isFadingText) {
      if (charIndex < currentMsg.length) {
        const charTimer = setTimeout(() => {
          setCharIndex((prev) => prev + 1);
        }, 20); // Typewriter speed (20ms/char)
        return () => clearTimeout(charTimer);
      } else {
        setIsTyping(false);

        // Trigger the robot reaction when the exact intro message finishes typing (Home only)
        if (isHomeActive && currentMsg === "...but I think I'm cuter. 🥺" && !hasEmittedReactionRef.current) {
          hasEmittedReactionRef.current = true;
          window.dispatchEvent(new CustomEvent('orb-cute-joke'));
        }
      }
    }

    // 2. Message Hold Easing Before Next Transition
    if (!isTyping && !isFadingText) {
      if (lockPromptActive) {
        // Prevent fading or moving to the next message when the replay prompt is active
        return;
      }
      if (!isIdlePhaseRef.current) {
        if (msgIndex < activeMsgs.length - 1) {
          // Hold message for 800ms to match the About section tempo
          const pauseDuration = (isSkillsActive || isProjectsActive || isCertificatesActive || isContactActive || isResumeActive)
            ? 800
            : (msgIndex === 2 ? 1000 : 800);

          const pauseTimer = setTimeout(() => {
            setIsFadingText(true);
          }, pauseDuration);
          return () => clearTimeout(pauseTimer);
        } else if (msgIndex === activeMsgs.length - 1) {
          if (isHomeActive) {
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
            }, 2500);
            return () => clearTimeout(finalTimer);
          } else if (isSkillsActive || isProjectsActive || isCertificatesActive || isContactActive || isResumeActive) {
            // Display final message for 2.5s (matching About section), then wait 9s before looping
            const finalTimer = setTimeout(() => {
              setIsFadingText(true);
            }, 2500);
            return () => clearTimeout(finalTimer);
          }
        }
      } else {
        // Idle phase (Home only): hold the message for 2 seconds, then fade out
        const idlePauseTimer = setTimeout(() => {
          setIsFadingText(true);
        }, 2000);
        return () => clearTimeout(idlePauseTimer);
      }
    }

    // 3. Smooth Fade Out Transition
    if (isFadingText) {
      const fadeTimer = setTimeout(() => {
        if (!isIdlePhaseRef.current) {
          const nextIdx = msgIndex + 1;
          if (nextIdx < activeMsgs.length) {
            setMsgIndex(nextIdx);
            setCurrentMsg(activeMsgs[nextIdx]);
            setCharIndex(0);
            setIsFadingText(false);
            setIsTyping(true);
          } else if (isSkillsActive || isProjectsActive || isCertificatesActive || isContactActive || isResumeActive) {
            // End of Skills/Projects/Certificates/Contact/Resume messages sequence reached: Hide bubble
            setIsBubbleVisible(false);
            setIsFadingText(false);

            if (isProjectsActive || isResumeActive) return; // Do not loop Projects or Resume intro dialogue

            const restartTimer = setTimeout(() => {
              if (isSkillsActive || isCertificatesActive || isContactActive) {
                const activeMsgs = isSkillsActive 
                  ? SKILLS_MESSAGES 
                  : (isCertificatesActive ? CERTIFICATES_MESSAGES : CONTACT_MESSAGES);
                setMsgIndex(0);
                setCurrentMsg(activeMsgs[0]);
                setCharIndex(0);
                setIsTyping(true);
                setIsFadingText(false);
                setIsBubbleVisible(true);
              }
            }, 9000); // 9 seconds delay
            return () => clearTimeout(restartTimer);
          }
        } else {
          // Fade complete for idle message (Home only): hide bubble and schedule next
          setIsBubbleVisible(false);
          setIsFadingText(false);
          scheduleNextIdleDialogue();
        }
      }, 200); // 200ms fade duration
      return () => clearTimeout(fadeTimer);
    }
  }, [
    isHomeActive,
    isSkillsActive,
    isProjectsActive,
    isCertificatesActive,
    isContactActive,
    isResumeActive,
    isBubbleVisible,
    msgIndex,
    currentMsg,
    charIndex,
    isTyping,
    isFadingText,
    onRobotGlance,
    onAIKAVLookAway,
    isDialogueCompleted,
    lockPromptActive
  ]);

  if (typeof document === 'undefined') return null;

  // Align Home bubble directly under orb center
  const targetX = homeCoords?.centerX ? homeCoords.centerX : 0;
  const targetY = homeCoords?.centerY ? homeCoords.centerY + 45 : 0;

  // Align Skills & Projects & Certificates & Contact & Resume bubble relative to active section coords
  const activeOrbCoords = isHomeActive
    ? homeCoords
    : (isSkillsActive 
        ? skillsCoords 
        : (isProjectsActive 
            ? projectsCoords 
            : (isCertificatesActive 
                ? certificatesCoords 
                : (isContactActive ? contactCoords : resumeCoords))));

  const activeOrbSize = activeOrbCoords?.size ?? 120;
  
  // Center bubble horizontally with the active orb
  const bubbleX = activeOrbCoords?.centerX ? activeOrbCoords.centerX : 0;
  // Position above the orb top border with a 4px gap
  const bubbleY = activeOrbCoords?.centerY && activeOrbCoords?.size ? activeOrbCoords.centerY - (activeOrbSize / 2) - 4 : 0;
  const bubbleTransform = 'translate(-50%, -100%)'; // Horizontally centered and pushed above Y
  const initialY = -6;
  const exitY = 4;

  const activeBubbleX = isHomeActive ? targetX : bubbleX;
  const activeBubbleY = isHomeActive ? targetY : bubbleY;
  const activeTransform = isHomeActive ? 'translateX(-50%)' : bubbleTransform;

  const activeInitialY = isHomeActive ? 6 : initialY;
  const activeExitY = isHomeActive ? -4 : exitY;
  const activeTransition = isHomeActive
    ? { duration: 0.15, ease: 'easeOut' }
    : { duration: 0.2, ease: 'easeInOut' };

  return createPortal(
    <AnimatePresence>
      {isBubbleVisible && activeBubbleX > 0 && activeBubbleY > 0 && ((isHomeActive && homeCoords) || (isSkillsActive && skillsCoords) || (isProjectsActive && projectsCoords) || (isCertificatesActive && certificatesCoords) || (isContactActive && contactCoords) || (isResumeActive && resumeCoords)) && (
        <motion.div
          animate={{
            x: activeBubbleX,
            y: activeBubbleY,
          }}
          transition={{
            type: 'spring',
            stiffness: 180,
            damping: 24,
            mass: 0.8,
          }}
          className="fixed z-[1000] pointer-events-none select-none"
          style={{
            left: 0,
            top: 0,
            maxWidth: '320px',
            width: 'fit-content',
            height: 'auto',
            overflow: 'visible',
          }}
        >
          {/* Static wrapping div to apply horizontal and vertical transform offsets safely without Framer Motion animate overrides */}
          <div
            style={{
              transform: activeTransform,
              transformOrigin: isHomeActive ? 'top center' : 'bottom center',
              width: 'fit-content',
              height: 'auto',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: activeInitialY, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: activeExitY, scale: 0.98 }}
              transition={activeTransition}
              style={{
                width: 'fit-content',
                height: 'auto',
              }}
            >
            {/* Floating glass container */}
            <div
              className="relative rounded-[16px]"
              style={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '320px',
                width: 'fit-content',
                height: 'auto',
                overflow: 'visible',
                background: 'var(--aikav-bubble-bg, rgba(8, 12, 18, 0.92))',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--aikav-bubble-border, rgba(var(--aikav-primary-rgb, 56, 189, 248), 0.25))',
                boxShadow: '0 0 16px var(--aikav-bubble-glow, rgba(var(--aikav-primary-rgb, 56, 189, 248), 0.15))',
                padding: '10px 14px',
                boxSizing: 'border-box',
                borderRadius: '16px',
                pointerEvents: lockPromptActive ? 'auto' : 'none',
                transition: 'border-color 400ms ease-in-out, box-shadow 400ms ease-in-out',
              }}
            >
              {/* Typewriter text */}
              <p
                className={`text-white font-medium text-[13.5px] leading-[1.4] tracking-wide m-0 transition-opacity duration-200 ${isFadingText ? 'opacity-0' : 'opacity-100'}`}
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
                      background: 'var(--aikav-primary, #38BDF8)',
                      marginLeft: '2px',
                      verticalAlign: 'middle',
                      animation: 'aikav-cursor-blink 1s step-end infinite',
                      transition: 'background-color 400ms ease-in-out',
                    }}
                  />
                )}
              </p>

              {lockPromptActive && !isTyping && !isFadingText && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    marginTop: '10px',
                    width: '100%',
                    pointerEvents: 'auto',
                  }}
                >
                  <button
                    onClick={handleYes}
                    className="font-mono text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all duration-300 px-3 py-1 rounded-[4px] cursor-pointer"
                    style={{
                      color: 'var(--aikav-primary, #22d3ee)',
                      borderColor: 'rgba(var(--aikav-primary-rgb, 34, 211, 238), 0.3)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      background: 'rgba(var(--aikav-primary-rgb, 34, 211, 238), 0.05)',
                      outline: 'none',
                      transition: 'color 400ms ease-in-out, border-color 400ms ease-in-out, background-color 400ms ease-in-out, box-shadow 400ms ease-in-out',
                    }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={handleNo}
                    className="font-mono text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all duration-300 px-3 py-1 rounded-[4px] cursor-pointer"
                    style={{
                      color: 'var(--aikav-primary, #22d3ee)',
                      borderColor: 'rgba(var(--aikav-primary-rgb, 34, 211, 238), 0.3)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      background: 'rgba(var(--aikav-primary-rgb, 34, 211, 238), 0.05)',
                      outline: 'none',
                      transition: 'color 400ms ease-in-out, border-color 400ms ease-in-out, background-color 400ms ease-in-out, box-shadow 400ms ease-in-out',
                    }}
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </motion.div>
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
