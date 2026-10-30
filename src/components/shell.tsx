import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path d="M5 23.5 16 7l11 16.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M10 23.5 16 14l6 9.5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    </span>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { href: "/#work", label: "Work", hash: "work" },
    { href: "/#practice", label: "Practice", hash: "practice" },
    { href: "/#contact", label: "Contact", hash: "contact" },
  ] as const;

  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="topbar glass">
        <Link to="/" className="brand" aria-label="Horizon Architecture Studio, home">
          <Mark />
          <span>
            <strong>Horizon</strong>
            <small>Architecture Studio</small>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.hash} to="/" hash={link.hash}>
              {link.label}
            </Link>
          ))}
          <Link to="/admin" aria-current={pathname.startsWith("/admin") ? "page" : undefined}>
            Desk
          </Link>
        </nav>
        <button className="menu-btn" type="button" aria-expanded={open} aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu size={20} />
        </button>
      </header>
      {open ? (
        <div className="menu-panel glass" role="dialog" aria-label="Menu">
          <button className="menu-close" type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
          {links.map((link) => (
            <Link key={link.hash} to="/" hash={link.hash} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link to="/admin" onClick={() => setOpen(false)}>
            Desk
          </Link>
        </div>
      ) : null}
      <main id="content">{children}</main>
      <footer className="footer">
        <p>Horizon Architecture Studio · Cape Meridian, Northwater, Highmere</p>
        <Link to="/admin">Studio desk</Link>
      </footer>
    </>
  );
}
