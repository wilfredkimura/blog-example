import Image from "next/image";
import Link from "next/link";

export interface PostCardProps {
  title: string;
  href: string;
  date: string;
  imageUrl?: string;
  excerpt?: string;
  categories?: string[];
  tags?: string[];
}

export default function PostCard({ title, href, date, imageUrl, excerpt, categories = [], tags = [] }: PostCardProps) {
  return (
    <Link href={href} className="block group">
      <article className="card card-hover overflow-hidden">
        {imageUrl && (
          <div className="rounded-b-none overflow-hidden">
            <div className="relative aspect-[16/9]">
              <Image src={imageUrl} alt={title} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
            </div>
          </div>
        )}
        <div className="p-5">
          <time className="text-[11px] uppercase tracking-wide text-foreground/60">{new Date(date).toLocaleDateString()}</time>
          <h3 className="mt-1 font-semibold text-lg md:text-xl tracking-tight">
            {title}
          </h3>
          {(categories.length > 0 || tags.length > 0) && (
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              {categories.map((c) => (
                <span key={c} className="text-[10px] px-2 py-0.5 rounded-full border">{c}</span>
              ))}
              {tags.map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border">#{t}</span>
              ))}
            </div>
          )}
          {excerpt && <p className="mt-2 text-sm text-foreground/80 line-clamp-3">{excerpt}</p>}
        </div>
      </article>
    </Link>
  );
}
