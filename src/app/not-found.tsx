import Link from "next/link";
import { AmbientWaves } from "@/components/AmbientWaves";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden bg-navy-950 text-paper">
      <AmbientWaves />
      <div className="container-x relative py-40">
        <p className="eyebrow text-sky">Fehler 404</p>
        <h1 className="mt-6 text-[clamp(2.5rem,7vw,6rem)] font-medium leading-none tracking-tight">
          Diese Seite <span className="display italic">gibt es nicht.</span>
        </h1>
        <Link href="/" className="btn btn-light mt-12">Zur Startseite</Link>
      </div>
    </section>
  );
}
