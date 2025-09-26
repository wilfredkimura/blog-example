export default function Footer() {
  return (
    <footer className="mt-20 border-t">
      <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground/70">
        <p>© {new Date().getFullYear()} Unveiling Truth</p>
        <nav className="flex items-center gap-6">
          <a className="hover:opacity-80" href="/privacy">Privacy Policy</a>
          <a className="hover:opacity-80" href="/terms">Terms</a>
          <a className="hover:opacity-80" href="https://twitter.com/search?q=%23KenyaPolitics" target="_blank" rel="noopener">#KenyaPolitics</a>
        </nav>
      </div>
    </footer>
  );
}
