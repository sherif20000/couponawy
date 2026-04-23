import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة | كوبوناوي",
  description:
    "إجابات على أكثر الأسئلة شيوعاً حول كوبوناوي وكيفية استخدام الكوبونات.",
};

const FAQS = [
  {
    q: "هل الكوبونات مجانية؟",
    a: "نعم، جميع الكوبونات على كوبوناوي مجانية تماماً. لا يلزمك أي اشتراك أو تسجيل.",
  },
  {
    q: "كيف أعرف إذا كان الكوبون لا يزال صالحاً؟",
    a: "كل كوبون يعرض تاريخ انتهاء الصلاحية. نحرص على تحديث الكوبونات وإزالة المنتهية أولاً بأول.",
  },
  {
    q: "ماذا أفعل إذا لم يعمل الكوبون معي؟",
    a: 'إذا لم يعمل كوبون معك، يرجى الإبلاغ عنه عبر صفحة "الإبلاغ عن كوبون" حتى نتحقق منه ونصلحه في أقرب وقت.',
  },
  {
    q: "هل يمكنني استخدام أكثر من كوبون في نفس الطلب؟",
    a: "هذا يعتمد على سياسة كل متجر — بعض المتاجر تتيح دمج الكوبونات، وبعضها لا.",
  },
  {
    q: "هل كوبوناوي متاح خارج المملكة العربية السعودية؟",
    a: "نعم، نغطّي متاجر من السعودية والإمارات والكويت وعدد من دول الخليج. يمكنك تصفية الكوبونات حسب الدولة.",
  },
  {
    q: "كيف يكسب كوبوناوي أموالاً إذا كانت الخدمة مجانية؟",
    a: "بعض الروابط على الموقع روابط تابعة — نحصل على عمولة صغيرة عند إتمام عملية شراء عبرها، دون أي تكلفة عليك. هذا ما يتيح لنا إبقاء الخدمة مجانية.",
  },
];

export default function FAQPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="from-cream-dark/60 to-cream border-brand-gold/20 border-b bg-gradient-to-b">
        <Container size="md" className="py-10 md:py-14">
          <nav
            aria-label="مسار التنقّل"
            className="text-warm-brown-light font-accent mb-4 flex items-center gap-2 text-xs"
          >
            <Link href="/" className="hover:text-brand-red transition-colors">
              الرئيسية
            </Link>
            <span>›</span>
            <span className="text-charcoal">الأسئلة الشائعة</span>
          </nav>
          <h1 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
            الأسئلة الشائعة
          </h1>
          <p className="font-body text-warm-brown mt-2 text-base">
            إجابات سريعة على أكثر ما يسألنا المتسوّقون
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="md">
          <div className="flex flex-col gap-4">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="bg-cream border-brand-gold/25 rounded-2xl border p-6"
              >
                <h2 className="font-display text-charcoal mb-2 text-base font-bold">
                  {faq.q}
                </h2>
                <p className="text-warm-brown font-body text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="font-body text-warm-brown text-sm">
              لم تجد إجابتك؟{" "}
              <Link
                href="/contact"
                className="text-brand-red hover:text-brand-red-dark font-semibold transition-colors"
              >
                تواصل معنا
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
