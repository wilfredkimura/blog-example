export default function FollowBar() {
  return (
    <div className="w-full border-y bg-[var(--secondary)]/50">
      <div className="container py-3 flex flex-wrap items-center justify-center gap-3 text-sm">
        <span className="text-foreground/70">Follow us</span>
        <a
          href="https://twitter.com/"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border hover:bg-foreground/5"
          aria-label="Follow on X"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2H21l-6.51 7.44L22 22h-6.656l-4.36-5.64L5.77 22H3l7.02-8.03L2 2h6.77l3.94 5.18L18.244 2Zm-1.164 18h1.824L8.99 4h-1.86l9.95 16Z"/></svg>
          <span>X</span>
        </a>
        <a
          href="https://youtube.com/"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border hover:bg-foreground/5"
          aria-label="Subscribe on YouTube"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a4 4 0 0 0-2.8-2.9C18.8 2.6 12 2.6 12 2.6s-6.8 0-8.7.7A4 4 0 0 0 .5 6.2 41 41 0 0 0 0 12a41 41 0 0 0 .5 5.8 4 4 0 0 0 2.8 2.9c1.9.7 8.7.7 8.7.7s6.8 0 8.7-.7a4 4 0 0 0 2.8-2.9A41 41 0 0 0 24 12a41 41 0 0 0-.5-5.8ZM9.6 15.5v-7l6.3 3.5-6.3 3.5Z"/></svg>
          <span>YouTube</span>
        </a>
        <a
          href="https://t.me/"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border hover:bg-foreground/5"
          aria-label="Join on Telegram"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.036 15.186 8.88 19.17c.355 0 .51-.152.694-.333l1.664-1.6 3.454 2.533c.634.35 1.087.167 1.26-.586l2.283-10.72c.203-.945-.342-1.315-.965-1.086L4.6 10.357c-.924.36-.91.877-.157 1.11l3.754 1.17 8.72-5.508c.41-.268.783-.12.476.147l-7.356 6.91Z"/></svg>
          <span>Telegram</span>
        </a>
      </div>
    </div>
  );
}
