"use client";

import { useState } from "react";

export function HowToPlayButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn px-3 py-1.5 border border-[var(--border)] rounded-[var(--r-sharp)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--border-hover)]"
        style={{ fontSize: "var(--text-xs)" }}
      >
        Rules
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto" onClick={() => setOpen(false)}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--r-sharp)] max-w-lg w-full shadow-[var(--shadow-elevated)] my-4" onClick={(e) => e.stopPropagation()}>
            <div className="geo-border" />
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-lg)" }}>
                  <span className="text-[var(--white)]">One</span>
                  <span className="text-[var(--teal)]">Board</span>
                  <span className="text-[var(--text-dim)] font-normal ml-2" style={{ fontSize: "var(--text-base)" }}>Rules</span>
                </h2>
                <button onClick={() => setOpen(false)} className="btn text-[var(--text-dim)] hover:text-[var(--text)] text-xl px-1">&times;</button>
              </div>

              <div className="space-y-5 text-[var(--text)] leading-relaxed" style={{ fontSize: "var(--text-sm)" }}>
                <section>
                  <h3 className="font-bold text-[var(--teal)] mb-1 uppercase tracking-[1px]" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-xs)" }}>Goal</h3>
                  <p className="text-[var(--text-dim)]">Be the last player with money. Everyone else goes bankrupt, you win.</p>
                </section>

                <section>
                  <h3 className="font-bold text-[var(--teal)] mb-1 uppercase tracking-[1px]" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-xs)" }}>Your Turn</h3>
                  <ol className="list-decimal list-inside space-y-1 text-[var(--text-dim)]">
                    <li><span className="text-[var(--text)]">Roll the dice</span> — move that many spaces</li>
                    <li><span className="text-[var(--text)]">Take action</span> — buy, auction, upgrade, or skip</li>
                    <li><span className="text-[var(--text)]">End turn</span> — AI opponents play automatically</li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-bold text-[var(--teal)] mb-1 uppercase tracking-[1px]" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-xs)" }}>Spaces</h3>
                  <div className="space-y-1.5 text-[var(--text-dim)]" style={{ fontSize: "var(--text-sm)" }}>
                    <div className="flex gap-2"><span className="text-[var(--teal)] w-20 shrink-0 font-semibold">Property</span><span>Buy it, charge rent when others land</span></div>
                    <div className="flex gap-2"><span className="text-[var(--amber)] w-20 shrink-0 font-semibold">Flash Loan</span><span>+300 OCT bonus</span></div>
                    <div className="flex gap-2"><span className="text-[var(--sky)] w-20 shrink-0 font-semibold">Airdrop</span><span>+400 OCT bonus</span></div>
                    <div className="flex gap-2"><span className="text-[var(--red)] w-20 shrink-0 font-semibold">Gas Tax</span><span>-200 OCT</span></div>
                    <div className="flex gap-2"><span className="text-[var(--red)] w-20 shrink-0 font-semibold">Rug Pull</span><span>Lose 50% of balance</span></div>
                    <div className="flex gap-2"><span className="text-[var(--red)] w-20 shrink-0 font-semibold">MEV Jail</span><span>Skip 2 turns</span></div>
                    <div className="flex gap-2"><span className="text-[var(--indigo)] w-20 shrink-0 font-semibold">DAO Vote</span><span>+250 OCT</span></div>
                    <div className="flex gap-2"><span className="text-[var(--green)] w-20 shrink-0 font-semibold">Genesis</span><span>+500 OCT each time you pass</span></div>
                  </div>
                </section>

                <section>
                  <h3 className="font-bold text-[var(--teal)] mb-1 uppercase tracking-[1px]" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-xs)" }}>Properties & NFTs</h3>
                  <p className="text-[var(--text-dim)] mb-2">Buy properties to charge rent. Each property is a Dynamic NFT that evolves on upgrade.</p>
                  <div className="bg-[var(--surface)] rounded-[var(--r-sharp)] p-3 space-y-1" style={{ fontSize: "var(--text-xs)" }}>
                    <div className="flex justify-between"><span className="text-[var(--text-dim)]">Level 0 (base)</span><span className="tabular-nums">1x rent</span></div>
                    <div className="flex justify-between"><span className="text-[var(--amber)]">Level 1 (upgrade)</span><span className="tabular-nums">2.5x rent</span></div>
                    <div className="flex justify-between"><span className="text-[var(--coral)]">Level 2 (max)</span><span className="tabular-nums">6x rent</span></div>
                  </div>
                </section>

                <section>
                  <h3 className="font-bold text-[var(--teal)] mb-1 uppercase tracking-[1px]" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-xs)" }}>Auctions</h3>
                  <p className="text-[var(--text-dim)]">Skip buying a property and it goes to auction. AI bots bid against each other. Highest bidder wins.</p>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
