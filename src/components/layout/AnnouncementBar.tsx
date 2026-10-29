"use client";
import { useEffect, useState } from "react";
import { ANNOUNCEMENT_MESSAGES } from "@/lib/constants";

export function AnnouncementBar() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % ANNOUNCEMENT_MESSAGES.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#123D2B] text-white text-center text-xs py-2 px-4 tracking-wide"
      style={{ fontFamily: "var(--font-body)" }}>
      <span
        className="transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {ANNOUNCEMENT_MESSAGES[idx]}
      </span>
    </div>
  );
}
