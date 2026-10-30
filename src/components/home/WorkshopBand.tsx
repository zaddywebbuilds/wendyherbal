import Image from "next/image";
import { BRAND_IMAGES, BRAND_CLIPS } from "@/lib/media";

/**
 * Photographs and short silent loops of the preparation work, captioned with
 * what they show.
 *
 * Deliberately not a testimonial wall: the client's library has those, and the
 * Medical Disclaimer commits the site to publishing none of them.
 */
export function WorkshopBand() {
  const still = BRAND_IMAGES.productionDrums;

  return (
    <section className="bg-[#F7F4E9] py-14 lg:py-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-9">
          <p className="text-[10.5px] font-semibold tracking-[0.22em] uppercase text-[#175C3D] mb-2.5"
            style={{ fontFamily: "var(--font-body)" }}>
            How it is made
          </p>
          <h2 className="text-[2rem] lg:text-[2.6rem] text-[#123D2B] font-medium"
            style={{ fontFamily: "var(--font-heading)" }}>
            From the bench to your door.
          </h2>
          <p className="mt-1.5 text-[13px] text-[#6b7265] max-w-xl mx-auto" style={{ fontFamily: "var(--font-body)" }}>
            Botanicals are weighed, blended and filled by hand, then packed against the order that
            comes through on WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {BRAND_CLIPS.map((clip) => (
            <figure key={clip.src}
              className="group relative rounded-lg overflow-hidden aspect-[4/5] bg-[#EFE9DD]">
              {/* muted + playsInline so it loops quietly on mobile too */}
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
              <div aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[#09231a]/80 via-[#09231a]/10 to-transparent" />
              <figcaption
                className="absolute bottom-0 left-0 right-0 p-3.5 text-[11.5px] leading-snug text-white/90"
                style={{ fontFamily: "var(--font-body)" }}>
                {clip.caption}
              </figcaption>
            </figure>
          ))}

          <figure className="group relative rounded-lg overflow-hidden aspect-[4/5] bg-[#EFE9DD]">
            <Image src={still.src} alt={still.alt} fill sizes="(max-width:1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#09231a]/80 via-[#09231a]/10 to-transparent" />
            <figcaption
              className="absolute bottom-0 left-0 right-0 p-3.5 text-[11.5px] leading-snug text-white/90"
              style={{ fontFamily: "var(--font-body)" }}>
              {still.caption}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
