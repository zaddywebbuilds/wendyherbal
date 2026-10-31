"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { BrandClip } from "@/lib/media";

/**
 * A clip tile that does not cost a phone 2MB to look at.
 *
 * The poster image is all that loads by default. The video element is mounted
 * only on wider screens, or when someone taps play, so a mobile visitor on
 * metered data downloads three small JPEGs instead of three MP4s. Autoplay is
 * also skipped for anyone who has asked for reduced motion.
 */
export function WorkshopTile({ clip, priority, className }: {
  clip: BrandClip; priority?: boolean; className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => setAutoplay(wide.matches && !calm.matches);
    decide();
    wide.addEventListener("change", decide);
    calm.addEventListener("change", decide);
    return () => {
      wide.removeEventListener("change", decide);
      calm.removeEventListener("change", decide);
    };
  }, []);

  const showVideo = autoplay || playing;

  return (
    <figure className={`group flex flex-col rounded-2xl overflow-hidden bg-white border border-[#EFE9DD] ${className ?? ""}`}>
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
        <Image src={clip.poster} alt={clip.alt} fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover" priority={priority} />
      )}

        {!showVideo && (
          <button type="button" onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center md:hidden"
            aria-label={`Play clip: ${clip.alt}`}>
            <span className="w-12 h-12 rounded-full bg-[#123D2B]/75 backdrop-blur-sm flex items-center justify-center">
              <Play size={18} className="text-white fill-white ml-0.5" />
            </span>
          </button>
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
