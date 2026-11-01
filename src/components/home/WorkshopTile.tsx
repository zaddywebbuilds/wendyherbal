"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { BrandClip } from "@/lib/media";

/**
 * A clip tile that does not cost a phone 2MB to look at.
 *
 * On mobile: shows a JPEG poster + tap-to-play button. No video downloaded.
 * On desktop: waits until the tile enters the viewport (+ 200px margin) before
 * mounting the video element, so clips that are off-screen on first paint cost
 * nothing on slow connections.
 */
export function WorkshopTile({ clip, priority, className }: {
  clip: BrandClip; priority?: boolean; className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [canAutoplay, setCanAutoplay] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => setCanAutoplay(wide.matches && !calm.matches);
    decide();
    wide.addEventListener("change", decide);
    calm.addEventListener("change", decide);
    return () => {
      wide.removeEventListener("change", decide);
      calm.removeEventListener("change", decide);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !canAutoplay) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [canAutoplay]);

  const showVideo = (canAutoplay && inView) || playing;

  return (
    <figure ref={ref} className={`group flex flex-col rounded-2xl overflow-hidden bg-white border border-[#EFE9DD] ${className ?? ""}`}>
      <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden bg-[#EFE9DD]">
        {showVideo ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={clip.src}
            poster={clip.poster}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label={clip.alt}
          />
        ) : (
          <>
            <Image src={clip.poster} alt={clip.alt} fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover" priority={priority} />
            <button type="button" onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center md:hidden"
              aria-label={`Play clip: ${clip.alt}`}>
              <span className="w-12 h-12 rounded-full bg-[#123D2B]/75 backdrop-blur-sm flex items-center justify-center">
                <Play size={18} className="text-white fill-white ml-0.5" />
              </span>
            </button>
          </>
        )}
      </div>

      <figcaption
        className="p-3 sm:p-3.5 text-[11.5px] sm:text-[12px] leading-snug text-[#4a5245]"
        style={{ fontFamily: "var(--font-body)" }}>
        {clip.caption}
      </figcaption>
    </figure>
  );
}
