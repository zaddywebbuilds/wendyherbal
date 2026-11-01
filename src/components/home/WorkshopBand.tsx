import Image from "next/image";
import { BRAND_IMAGES, BRAND_CLIPS } from "@/lib/media";
import { WorkshopTile } from "./WorkshopTile";

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
    <section className="bg-[#F7F4E9] py-8 lg:py-12">
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

        {/* First frame runs wide on desktop so this band does not read as
            another four-across row after the collections. */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {BRAND_CLIPS.map((clip, i) => (
            <WorkshopTile key={clip.src} clip={clip} priority={i === 0}
              className={i === 0 ? "lg:col-span-2 lg:row-span-2" : undefined} />
          ))}

          <figure className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-[#EFE9DD]">
            <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden bg-[#EFE9DD]">
              <Image src={still.src} alt={still.alt} fill sizes="(max-width:1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <figcaption
              className="p-3.5 text-[12px] leading-snug text-[#4a5245]"
              style={{ fontFamily: "var(--font-body)" }}>
              {still.caption}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
