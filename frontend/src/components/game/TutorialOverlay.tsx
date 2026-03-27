"use client";

import { useState, useEffect } from "react";
import { Dices, Landmark, Trophy, type LucideIcon } from "lucide-react";

const STEPS: { icon: LucideIcon; title: string; description: string; color: string }[] = [
  {
    icon: Dices,
    title: "Roll the Dice",
    description: "Roll two dice to move around the board. Pass Genesis Block to collect 500 OCT.",
    color: "var(--coral)",
  },
  {
    icon: Landmark,
    title: "Buy DeFi Protocols",
    description: "Land on a protocol? Buy it to charge rent. Own a full category set to unlock upgrades.",
    color: "var(--teal)",
  },
  {
    icon: Trophy,
    title: "Bankrupt the AIs",
    description: "Outsmart the Degen, Whale, and MEV Bot. Last player standing wins and mints a Victory NFT.",
    color: "var(--amber)",
  },
];

const STORAGE_KEY = "oneboard-tutorial-seen";

export function TutorialOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else dismiss();
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
      <div
        className="relative max-w-sm w-full mx-4 bg-[var(--card)] border border-[var(--border)] rounded-[8px] overflow-hidden shadow-[0_16px_64px_rgba(0,0,0,0.5)]"
        style={{ animation: "fadeIn 0.3s var(--ease-out)" }}
      >
        {/* Top accent */}
        <div className="h-1" style={{ background: current.color }} />

        <div className="p-8 flex flex-col items-center text-center gap-5">
          {/* Step indicator dots */}
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: i === step ? current.color : "var(--border)",
                  transform: i === step ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>

          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: `color-mix(in srgb, ${current.color} 15%, var(--surface))`,
              border: `2px solid color-mix(in srgb, ${current.color} 30%, transparent)`,
            }}
          >
            <current.icon size={36} style={{ color: current.color }} />
          </div>

          {/* Text */}
          <div>
            <h3
              className="font-bold mb-2"
              style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-lg)", color: current.color }}
            >
              {current.title}
            </h3>
            <p className="text-[var(--text-dim)] leading-relaxed" style={{ fontSize: "var(--text-sm)" }}>
              {current.description}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={dismiss}
              className="btn flex-1 px-4 py-2.5 border border-[var(--border)] text-[var(--text-dim)] rounded-[var(--r-sharp)] hover:text-[var(--text)] hover:border-[var(--border-hover)]"
              style={{ fontSize: "var(--text-sm)" }}
            >
              Skip
            </button>
            <button
              onClick={next}
              className="btn flex-1 px-4 py-2.5 rounded-[var(--r-sharp)] font-semibold text-[var(--navy)] hover:brightness-110"
              style={{ fontSize: "var(--text-sm)", background: current.color }}
            >
              {step < STEPS.length - 1 ? "Next" : "Let's Play!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
