import { Logo } from "@/components/brand/logo";
import { Mascot } from "@/components/brand/mascot";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="bg-cream-dark/40 border border-brand-gold/30 shadow-brand w-full max-w-2xl rounded-3xl p-10 text-center md:p-14">
        <div className="mb-8 flex flex-col items-center gap-6">
          <Mascot size="lg" />
          <Logo className="text-4xl" />
        </div>

        <h1 className="font-display text-charcoal mb-4 text-3xl font-extrabold leading-tight md:text-4xl">
          أهلاً بك في بيتك الثاني
        </h1>

        <p className="font-body text-warm-brown mx-auto mb-8 max-w-lg text-lg leading-loose">
          كوبونات خصم وعروض مختارة بعناية للمتاجر الموثوقة في السعودية والخليج.
          جربها قبلك الأستاذ أبو عبدالله.
        </p>

        <div className="border-brand-gold/40 text-warm-brown-light font-accent inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm">
          <span
            aria-hidden
            className="bg-brand-green inline-block h-2 w-2 rounded-full"
          />
          المرحلة الأولى — جاري البناء
        </div>
      </div>
    </main>
  );
}
