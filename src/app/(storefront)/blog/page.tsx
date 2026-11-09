import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { getAllPosts, formatPublishedDate, readingTime } from "@/lib/blog";
import { BLOG_CATEGORIES } from "@/data/blog-posts";
import { PageHero } from "@/components/content/ContentPage";

export const metadata: Metadata = {
  title: "Herb & Wellness Blog",
  description:
    "Evidence-based guides on Nigerian herbs, traditional medicine, and natural wellness — bitter leaf, moringa, zobo, dongoyaro and more.",
  openGraph: {
    title: "Wendy Herbals Blog — Nigerian Herb Guides & Wellness Tips",
    description:
      "Learn about bitter leaf, moringa, zobo, neem and other Nigerian herbs. Guides written for Nigerians, backed by research.",
  },
  alternates: { canonical: "/blog" },
};

const bodyFont = { fontFamily: "var(--font-body)" };
const headFont = { fontFamily: "var(--font-heading)" };

export default function BlogListingPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        eyebrow="Herb & Wellness Guide"
        title="Learn About Nigerian Herbs"
        intro="Practical guides on the herbs, spices and natural remedies Nigerians use every day — written with both traditional knowledge and current research in mind."
      />

      <div className="bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

          {/* Category filter — visual only, all posts shown */}
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="px-3.5 py-1.5 rounded-full bg-[#123D2B] text-white text-[12px] font-medium"
              style={bodyFont}>
              All
            </span>
            {BLOG_CATEGORIES.map((cat) => (
              <span key={cat}
                className="px-3.5 py-1.5 rounded-full border border-[#E7E0CF] text-[#4a5247] text-[12px] font-medium hover:border-[#A8B99C] transition-colors cursor-default"
                style={bodyFont}>
                {cat}
              </span>
            ))}
          </div>

          {/* Featured post */}
          {featured && (
            <Link href={`/blog/${featured.slug}`}
              className="group block mb-10 rounded-2xl overflow-hidden border border-[#E7E0CF] hover:border-[#A8B99C] transition-colors bg-[#F7F4E9]">
              <div className="sm:flex">
                <div className="relative sm:w-[46%] aspect-[16/9] sm:aspect-auto shrink-0">
                  <Image
                    src={featured.coverSrc}
                    alt={featured.coverAlt}
                    fill
                    sizes="(max-width:640px) 100vw, 46vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-center">
                  <span className="text-[10.5px] font-semibold tracking-[0.2em] uppercase text-[#175C3D] mb-3"
                    style={bodyFont}>
                    Featured · {featured.category}
                  </span>
                  <h2 className="text-[1.5rem] lg:text-[1.9rem] leading-[1.1] text-[#123D2B] mb-3 group-hover:text-[#175C3D] transition-colors"
                    style={headFont}>
                    {featured.title}
                  </h2>
                  <p className="text-[14px] text-[#4a5247] leading-relaxed mb-4 line-clamp-3"
                    style={bodyFont}>
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-[12.5px] text-[#6b7265]"
                    style={bodyFont}>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {formatPublishedDate(featured.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} />
                      {readingTime(featured)} min read
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden border border-[#E7E0CF] hover:border-[#A8B99C] transition-colors bg-[#F7F4E9]">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={post.coverSrc}
                    alt={post.coverAlt}
                    fill
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#123D2B]/80 backdrop-blur-sm text-white text-[10.5px] font-medium"
                    style={bodyFont}>
                    {post.category}
                  </span>
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-[1.05rem] lg:text-[1.1rem] leading-snug text-[#123D2B] mb-2 group-hover:text-[#175C3D] transition-colors"
                    style={headFont}>
                    {post.title}
                  </h3>
                  <p className="text-[13px] text-[#4a5247] leading-relaxed line-clamp-2 mb-4 flex-1"
                    style={bodyFont}>
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-[12px] text-[#6b7265] mt-auto"
                    style={bodyFont}>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatPublishedDate(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {readingTime(post)} min
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="mt-10 text-[12.5px] text-[#6b7265] border-t border-[#E7E0CF] pt-6"
            style={bodyFont}>
            All articles on this blog are for general educational purposes only and do not constitute medical advice.
            Please read our{" "}
            <Link href="/disclaimer" className="underline underline-offset-4 text-[#175C3D]">
              Medical Disclaimer
            </Link>{" "}
            before acting on any information.
          </p>
        </div>
      </div>
    </>
  );
}
