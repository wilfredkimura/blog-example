import Image from "next/image";
import Link from "next/link";

export interface PostCardProps {
  title: string;
  href: string;
  date: string;
  imageUrl?: string;
  excerpt?: string;
}

export default function PostCard({ title, href, date, imageUrl, excerpt }: PostCardProps) {
  return (
    <Link href={href} className="block">
      <article className="card card-hover overflow-hidden">
        {imageUrl && (
          <div className="border rounded-lg overflow-hidden">
            <div className="relative aspect-[16/9]">
              <Image src={imageUrl} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
          </div>
        )}
        <div className="p-5">
          <time className="text-xs muted">{new Date(date).toLocaleDateString()}</time>
          <h3 className="mt-2 font-semibold text-xl tracking-tight">{title}</h3>
          {excerpt && <p className="mt-3 text-sm text-foreground/80 line-clamp-3">{excerpt}</p>}
        </div>
      </article>
    </Link>
  );
}
