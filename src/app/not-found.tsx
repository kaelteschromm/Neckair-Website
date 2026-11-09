import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center bg-graphite text-on-dark">
      <div className="container-x py-40">
        <p className="text-sm text-on-dark-muted">Fehler 404</p>
        <h1 className="mt-4 text-[clamp(2.5rem,7vw,6rem)]">Diese Seite gibt es nicht.</h1>
        <p className="measure mt-6 text-lg text-on-dark-muted">Vielleicht wurde sie verschoben. Auf der Startseite finden Sie alle Leistungen von NECKAIR.</p>
        <Link href="/" className="btn btn-light mt-10">Zur Startseite</Link>
      </div>
    </section>
  );
}
