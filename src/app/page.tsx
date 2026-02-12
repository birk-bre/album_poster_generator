import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col justify-end overflow-hidden p-6 sm:p-10 md:p-16">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-accent/[0.03] blur-3xl" />
        <div className="absolute -bottom-48 -left-48 h-[600px] w-[600px] rounded-full bg-accent/[0.02] blur-3xl" />
      </div>

      {/* Top label */}
      <div className="absolute left-6 top-6 sm:left-10 sm:top-10 md:left-16 md:top-16 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-accent/40" />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-warm-300">
            Album Poster Generator
          </span>
        </div>
      </div>

      {/* Hero content — left-aligned, editorial */}
      <div className="relative z-10 max-w-3xl animate-fade-in" style={{ animationDelay: "100ms" }}>
        <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
          Turn albums
          <br />
          into{" "}
          <span className="relative inline-block text-accent">
            art
            <svg
              className="absolute -bottom-1 left-0 w-full"
              viewBox="0 0 120 8"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M2 6C30 2 90 2 118 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.4"
              />
            </svg>
          </span>
        </h1>

        <p className="mt-6 max-w-md text-base leading-relaxed text-warm-300 sm:text-lg md:mt-8">
          Search any album on Spotify. Get a beautifully designed printable
          poster with track listing and extracted color palette.
        </p>

        <div className="mt-8 flex items-center gap-6 md:mt-12" style={{ animationDelay: "200ms" }}>
          <Link
            href="/create"
            className="group inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-warm-950 transition-all hover:bg-accent-light hover:shadow-[0_0_30px_rgba(200,169,110,0.2)] active:scale-[0.98]"
          >
            Start Creating
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Bottom decorative bar */}
      <div className="gold-rule mt-16 w-full" />
      <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-warm-500">
        <span>Powered by Spotify</span>
        <span>Print-ready A4 posters</span>
      </div>
    </main>
  );
}
