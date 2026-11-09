import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { getAllPosts, getPostBySlug, getRelatedPosts, formatPublishedDate, readingTime } from "@/lib/blog";
import { RenderSection } from "@/components/blog/BlogSection";
import { SITE_NAME } from "@/lib/constants";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: `${post.title} | ${SITE_NAME}`,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      images: [{ url: post.coverSrc, alt: post.coverAlt }],
    },
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

const bodyFont = { fontFamily: "var(--font-body)" };
const headFont = { fontFamily: "var(--font-heading)" };

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post, 3);
  const mins = readingTime(post);

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="relative w-full aspect-[21/9] max-h-[420px] overflow-hidden bg-[#EFE9DD]">
        <Image
          src={post.coverSrc}
          alt={post.coverAlt}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2b1c]/70 via-[#0d2b1c]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-[#C6A667] text-[#123D2B] text-[11px] font-semibold mb-3"
            style={bodyFont}>
            {post.category}
          </span>
          <h1 className="text-[1.6rem] sm:text-[2rem] lg:text-[2.4rem] leading-[1.1] text-white"
            style={headFont}>
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-[12.5px] text-white/80"
            style={bodyFont}>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formatPublishedDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {mins} min read
            </span>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-[12.5px] text-[#6b7265]" style={bodyFont}>
          <Link href="/" className="hover:text-[#175C3D] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#175C3D] transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-[#252B23] line-clamp-1">{post.title}</span>
        </nav>
      </div>

      {/* Article body */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <p className="text-[15.5px] lg:text-[16.5px] leading-relaxed text-[#4a5247] mb-8 font-medium"
          style={bodyFont}>
          {post.excerpt}
        </p>
        <span className="block w-14 h-px bg-[#C6A667] mb-8" />

        <div className="space-y-4">
          {post.sections.map((section, i) => (
            <RenderSection key={i} section={section} />
          ))}
        </div>
      </article>

      {/* Back to blog */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Link href="/blog"
          className="inline-flex items-center gap-2 text-[13.5px] text-[#175C3D] hover:text-[#123D2B] transition-colors"
          style={bodyFont}>
          <ArrowLeft size={14} />
          Back to all articles
        </Link>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="bg-[#F7F4E9] border-t border-[#E7E0CF]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="text-[1.3rem] text-[#123D2B] mb-6" style={headFont}>
              More from the blog
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`}
                  className="group flex flex-col rounded-xl overflow-hidden border border-[#E7E0CF] bg-white hover:border-[#A8B99C] transition-colors">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={p.coverSrc}
                      alt={p.coverAlt}
                      fill
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <span className="text-[11px] text-[#175C3D] font-semibold mb-1.5"
                      style={bodyFont}>
                      {p.category}
                    </span>
                    <h3 className="text-[0.95rem] leading-snug text-[#123D2B] group-hover:text-[#175C3D] transition-colors mb-2"
                      style={headFont}>
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#6b7265] mt-auto"
                      style={bodyFont}>
                      <Clock size={12} />
                      {readingTime(p)} min read
                      <ArrowRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
