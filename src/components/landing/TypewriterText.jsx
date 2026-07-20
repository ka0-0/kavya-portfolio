import React, { useEffect, useState, useRef } from 'react';

export default function TypewriterText({ text, state, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const textRef = useRef(text);
  const onCompleteRef = useRef(onComplete);

  // Update refs to avoid effect re-runs
  useEffect(() => {
    textRef.current = text;
    onCompleteRef.current = onComplete;
  }, [text, onComplete]);

  // Reset typewriter index when dialogue changes or when starting to type
  useEffect(() => {
    if (state === 'typing' || state === 'idle' || state === 'eye-moving' || state === 'charging') {
      setCurrentIndex(0);
    }
  }, [text, state]);

  useEffect(() => {
    if (state !== 'typing') return;

    let timerId = null;

    const typeNextCharacter = (index) => {
      const currentText = textRef.current;
      if (index < currentText.length) {
        setCurrentIndex(index + 1);
        
        // Randomize character typing delay between 40ms and 60ms
        const delay = Math.floor(Math.random() * 21) + 40;
        timerId = setTimeout(() => typeNextCharacter(index + 1), delay);
      } else {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    };

    // Stagger start slightly (50ms) before typing begins
    timerId = setTimeout(() => typeNextCharacter(0), 50);

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [state]);

  const displayedCharacters = text.slice(0, currentIndex).split('');

  return (
    <p className="hologram-text-content" style={{ whiteSpace: 'pre-wrap' }}>
      {displayedCharacters.map((char, index) => {
        const isNewest = index === displayedCharacters.length - 1;
        return (
          <span
            key={index}
            className={isNewest ? 'char-newest' : 'char-normal'}
          >
            {char}
          </span>
        );
      })}
      <span className="hologram-cursor" />
    </p>
  );
}
