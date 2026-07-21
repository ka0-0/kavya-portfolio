import React, { useState, useEffect, useRef } from 'react';

const CODE_SNIPPETS = [
  `$ kavai-hack --target kavya-portfolio --override-security\n[+] Initiating neural handshake...\n[+] Bypassing firewall subnets [255.255.255.0]\n[+] Injecting PyTorch AI model payload...\n[+] SUCCESS: Hacking Done! Access Granted to Kavya's Portfolio.\n\nimport torch\nimport torch.nn as nn\n\nclass KAVYAAICore(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.transformer = nn.TransformerEncoder()\n    def forward(self, x):\n        return self.transformer(x)\n\n# Loading neural weights...\nmodel = KAVYAAICore().cuda()\nprint("KAVYA AI CORE ONLINE")`,

  `$ docker run -d --gpus all --name kavai_node \\\n  -p 8080:8080 -v /models:/models \\\n  kavai/neural-core:v4.2-latest\n[OK] Container 4f89a1c initialized.\n[LOG] Tensor Cores locked @ 100% load.\n[SEC] Quantum tunnel established for Kavya Makhan.`,

  `$ git log -n 4 --oneline\na8f92c1 feat: optimize neural inference pipeline\n3e10b42 perf: sub-millisecond tensor latency\n992a01f security: enable AES-256 quantum encryption\n7c12f04 core: deploy classified hacker command center`,

  `$ systemctl status kavai-agent.service\n● kavai-agent.service - Classified AI Command Center\n   Loaded: loaded (/etc/systemd/system/kavai.service)\n   Active: active (running) since Tue 2026-07-21 01:55\n   Memory: 4.8G / 64G | CPU: 14% | Status: OPTIMAL`
];

export default function LiveTerminalPanel({ className = '', isScanning = false, isComplete = false, style = {} }) {
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const terminalRef = useRef(null);

  useEffect(() => {
    const currentSnippet = CODE_SNIPPETS[snippetIndex];

    if (charIndex < currentSnippet.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + currentSnippet[charIndex]);
        setCharIndex((prev) => prev + 1);

        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, Math.random() * 20 + 12);
      return () => clearTimeout(timeout);
    } else {
      const nextTimeout = setTimeout(() => {
        setSnippetIndex((prev) => (prev + 1) % CODE_SNIPPETS.length);
        setCharIndex(0);
        setDisplayedText('');
      }, 2200);
      return () => clearTimeout(nextTimeout);
    }
  }, [charIndex, snippetIndex]);

  return (
    <div 
      className={`cyber-holo-panel ${className} ${
        isScanning 
          ? 'ring-2 ring-[var(--accent-color)] shadow-[0_0_30px_rgba(var(--accent-rgb),0.6)] opacity-100 scale-105' 
          : isComplete 
          ? 'opacity-90 border-[var(--accent-color)]/50' 
          : 'opacity-40 filter grayscale-[40%]'
      }`} 
      style={{ width: '320px', height: '220px', transition: 'all 0.4s ease', ...style }}
    >
      {/* Corner Brackets */}
      <div className="cyber-corner cyber-corner-tl" />
      <div className="cyber-corner cyber-corner-tr" />
      <div className="cyber-corner cyber-corner-bl" />
      <div className="cyber-corner cyber-corner-br" />
      <div className="cyber-scanline-overlay" />

      {/* Header */}
      <div className="cyber-panel-header">
        <div className="title-badge">
          <div className={`status-dot ${isScanning ? 'animate-ping' : ''}`} />
          <span>LIVE CODE & HACK FEED</span>
        </div>
        <span className="text-[9px] text-[var(--accent-color)]/70">CLI://KAV.AI</span>
      </div>

      {/* Code Terminal View */}
      <div 
        ref={terminalRef}
        className="w-full h-[170px] overflow-y-auto font-mono text-[10.5px] text-[var(--accent-color)] leading-relaxed whitespace-pre-wrap cyber-scrollbar pr-1"
      >
        <span>{displayedText}</span>
        <span className="cyber-cursor-blink" />
      </div>
    </div>
  );
}
