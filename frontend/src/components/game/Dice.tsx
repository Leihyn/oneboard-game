"use client";

import { useState, useEffect } from "react";

// Dot positions for each dice face (row, col on a 3x3 grid)
const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

function DiceFace({ value, size = "normal" }: { value: number; size?: "normal" | "large" }) {
  const dots = DOT_POSITIONS[value] || [];
  const dotSize = size === "large" ? "w-3 h-3" : "w-2.5 h-2.5";

  return (
    <div className="dice-face">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex justify-between">
          {[0, 1, 2].map((col) => {
            const hasDot = dots.some(([r, c]) => r === row && c === col);
            return (
              <div
                key={col}
                className={`${dotSize} rounded-full transition-all duration-150 ${hasDot ? "bg-[var(--navy)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]" : "bg-transparent"}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function AnimatedDice({ values, rolling }: { values: [number, number]; rolling: boolean }) {
  const [displayValues, setDisplayValues] = useState<[number, number]>(values);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (rolling) {
      setIsAnimating(true);
      setShowResult(false);
      let frame = 0;
      const maxFrames = 12;
      const interval = setInterval(() => {
        setDisplayValues([
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ]);
        frame++;
        if (frame >= maxFrames) {
          clearInterval(interval);
          setDisplayValues(values);
          setTimeout(() => {
            setIsAnimating(false);
            setShowResult(true);
          }, 250);
        }
      }, 55);
      return () => clearInterval(interval);
    } else {
      setDisplayValues(values);
      setShowResult(true);
    }
  }, [values, rolling]);

  const total = values[0] + values[1];
  const isDoubles = values[0] === values[1];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        {/* Die 1 */}
        <div className={`dice-cube ${isAnimating ? "dice-spin" : "dice-land"}`}>
          <div
            className="w-12 h-12 rounded-[6px] p-1.5 flex flex-col justify-between"
            style={{
              background: "linear-gradient(145deg, #f8f8f8 0%, #e8e8e8 100%)",
              boxShadow: isAnimating
                ? "0 4px 20px rgba(0,0,0,0.4)"
                : "0 3px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <DiceFace value={displayValues[0]} size="large" />
          </div>
        </div>

        {/* Die 2 */}
        <div className={`dice-cube ${isAnimating ? "dice-spin" : "dice-land"}`} style={{ animationDelay: "60ms" }}>
          <div
            className="w-12 h-12 rounded-[6px] p-1.5 flex flex-col justify-between"
            style={{
              background: "linear-gradient(145deg, #f8f8f8 0%, #e8e8e8 100%)",
              boxShadow: isAnimating
                ? "0 4px 20px rgba(0,0,0,0.4)"
                : "0 3px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <DiceFace value={displayValues[1]} size="large" />
          </div>
        </div>
      </div>

      {/* Result display */}
      {showResult && !isAnimating && (
        <div className="flex items-center gap-3" style={{ animation: "fadeIn 0.3s var(--ease-out)" }}>
          <div
            className="px-4 py-1.5 rounded-[var(--r-pill)] font-bold tabular-nums"
            style={{
              fontSize: "var(--text-sm)",
              background: isDoubles ? "rgba(255,184,0,0.15)" : "rgba(0,212,170,0.12)",
              color: isDoubles ? "var(--amber)" : "var(--teal)",
              border: `1px solid ${isDoubles ? "rgba(255,184,0,0.25)" : "rgba(0,212,170,0.2)"}`,
            }}
          >
            {values[0]} + {values[1]} = {total}
          </div>
          {isDoubles && (
            <span
              className="font-bold uppercase tracking-[2px] text-[var(--amber)]"
              style={{ fontSize: "var(--text-xs)", animation: "fadeIn 0.3s var(--ease-out)" }}
            >
              Doubles!
            </span>
          )}
        </div>
      )}
    </div>
  );
}
