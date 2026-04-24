import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "الشروط والأحكام",
  description: "شروط وأحكام استخدام منصة كوبوناوي.",
};

const LAST_UPDATED = "٢٣ أبريل ٢٠٢٥";

export default function TermsPage() {
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
            <span className="text-charcoal">الشروط والأحكام</span>
          </nav>
          <h1 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
            الشروط والأحكام
          </h1>
          <p className="font-body text-warm-brown mt-2 text-sm">
            آخر تحديث: {LAST_UPDATED}
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="md">
          <div className="font-body text-warm-brown space-y-8 text-sm leading-relaxed max-w-2xl">

            <p>
              باستخدامك لمنصة كوبوناوي، فإنك توافق على الشروط والأحكام
              الواردة في هذه الصفحة. يُرجى قراءتها بعناية.
            </p>

            <section>
              <h2 className="font-display text-charcoal text-base font-bold mb-2">
                ١. طبيعة الخدمة
              </h2>
              <p>
                كوبوناوي منصة إعلامية تجمع كوبونات الخصم والعروض الترويجية من
                متاجر طرف ثالث وتعرضها للمستخدمين. نحن لسنا طرفاً في أي عملية
                شراء تتم بينك وبين المتجر، ولا نتحمل مسؤولية أي مشكلة تتعلق
                بالمنتجات أو الخدمات أو عمليات الدفع.
              </p>
            </section>

            <section>
              <h2 className="font-display text-charcoal text-base font-bold mb-2">
                ٢. صحة الكوبونات
              </h2>
              <p>
                نبذل جهداً مستمراً للتحقق من صحة الكوبونات وتحديثها، لكننا لا
                نضمن أن كل كوبون منشور يعمل في كل وقت. قد تنتهي صلاحية
                الكوبونات أو يُلغيها المتجر دون إشعار مسبق. استخدامك للكوبون
                على مسؤوليتك.
              </p>
            </section>

            <section>
              <h2 className="font-display text-charcoal text-base font-bold mb-2">
                ٣. الروابط التابعة
              </h2>
              <p>
                قد يحتوي الموقع على روابط تابعة (Affiliate Links). عند الشراء
                عبر هذه الروابط قد نحصل على عمولة دون أي تكلفة إضافية عليك.
                هذا يساعدنا على إبقاء كوبوناوي مجانياً ومتاحاً للجميع.
              </p>
            </section>

            <section>
              <h2 className="font-display text-charcoal text-base font-bold mb-2">
                ٤. الاستخدام المقبول
              </h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  يُحظر استخدام كوبوناوي لأي غرض غير مشروع أو مخالف
                  للأنظمة المعمول بها في المملكة العربية السعودية.
                </li>
                <li>
                  يُحظر محاولة اختراق الموقع أو التلاعب بمحتواه أو التشويش
                  على خدماته.
                </li>
                <li>
                  يُحظر نشر أو مشاركة كوبونات مزيفة أو غير صحيحة قصداً.
                </li>
                <li>
                  يُحظر استخدام أدوات آلية للزحف على الموقع أو استخراج
                  بياناته بشكل مكثف دون إذن مكتوب مسبق.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-charcoal text-base font-bold mb-2">
                ٥. الملكية الفكرية
              </h2>
              <p>
                جميع محتويات كوبوناوي من نصوص وصور وشعارات وتصميمات هي
                ملك لكوبوناوي أو لمُرخَّص لها باستخدامها. لا يُسمح بنسخها أو
                إعادة نشرها أو توزيعها دون إذن صريح.
              </p>
            </section>

            <section>
              <h2 className="font-display text-charcoal text-base font-bold mb-2">
                ٦. إخلاء المسؤولية
              </h2>
              <p>
                تُقدَّم خدمة كوبوناوي «كما هي» دون أي ضمانات صريحة أو ضمنية.
                لا نتحمل أي مسؤولية عن خسائر مباشرة أو غير مباشرة ناتجة عن
                استخدام المنصة أو الاعتماد على معلوماتها.
              </p>
            </section>

            <section>
              <h2 className="font-display text-charcoal text-base font-bold mb-2">
                ٧. تعديل الشروط
              </h2>
              <p>
                نحتفظ بحق تعديل هذه الشروط في أي وقت. سيُعلن عن التغييرات
                الجوهرية على الموقع. استمرارك في استخدام كوبوناوي بعد نشر
                التعديلات يعني قبولك لها.
              </p>
            </section>

            <section>
              <h2 className="font-display text-charcoal text-base font-bold mb-2">
                ٨. القانون المعمول به
              </h2>
              <p>
                تخضع هذه الشروط لأحكام نظام التجارة الإلكترونية وحماية
                البيانات في المملكة العربية السعودية، وأي نزاع يُحَل وفق
                الأنظمة السعودية المعمول بها.
              </p>
            </section>

            <div className="border-t border-brand-gold/20 pt-6">
              <p>
                للاستفسار عن هذه الشروط:{" "}
                <a
                  href="mailto:hello@couponawy.com"
                  className="text-brand-red hover:text-brand-red-dark font-semibold transition-colors"
                >
                  hello@couponawy.com
                </a>
              </p>
            </div>

          </div>
        </Container>
      </section>
    </main>
  );
}
