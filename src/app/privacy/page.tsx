import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "سياسة الخصوصية لمنصة كوبوناوي — كيف نجمع بياناتك ونحميها.",
};

const LAST_UPDATED = "٢٣ أبريل ٢٠٢٥";

export default function PrivacyPage() {
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
            <span className="text-charcoal">سياسة الخصوصية</span>
          </nav>
          <h1 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
            سياسة الخصوصية
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
              نحن في كوبوناوي نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.
              توضّح هذه السياسة ما نجمعه وكيف نستخدمه وكيف نحميه.
            </p>

            <section>
              <h2 className="font-display text-charcoal text-base font-bold mb-2">
                ١. ما البيانات التي نجمعها؟
              </h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  <strong className="text-charcoal">بيانات الاستخدام:</strong>{" "}
                  الصفحات التي تزورها، الكوبونات التي تكشف عنها، التوقيت
                  والمتصفح ونظام التشغيل — بشكل مجمّع وغير مرتبط بهويتك.
                </li>
                <li>
                  <strong className="text-charcoal">نماذج الاتصال والإبلاغ:</strong>{" "}
                  إذا أرسلت رسالة أو أبلغت عن كوبون، نحتفظ بالبيانات التي
                  أدخلتها (الاسم اختياري، الموضوع، الرسالة) لمعالجة استفسارك.
                </li>
                <li>
                  <strong className="text-charcoal">ملفات تعريف الارتباط (Cookies):</strong>{" "}
                  نستخدم كوكيز وظيفية لتحسين تجربتك (مثل تذكّر تفضيلاتك)
                  وكوكيز تحليلية مجهولة الهوية لفهم كيفية استخدام الموقع.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-charcoal text-base font-bold mb-2">
                ٢. كيف نستخدم بياناتك؟
              </h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>تحسين المنصة وتطوير محتواها.</li>
                <li>الرد على استفساراتك وطلبات الدعم.</li>
                <li>
                  التحقق من تقارير الكوبونات المعطوبة وإصلاحها بسرعة.
                </li>
                <li>
                  تحليل الاستخدام بصورة مجمّعة لفهم العروض الأكثر نفعاً
                  للمستخدمين.
                </li>
              </ul>
              <p className="mt-3">
                <strong className="text-charcoal">لا نبيع بياناتك</strong> ولا
                نشاركها مع أطراف ثالثة لأغراض تسويقية.
              </p>
            </section>

            <section>
              <h2 className="font-display text-charcoal text-base font-bold mb-2">
                ٣. الروابط التابعة (Affiliate Links)
              </h2>
              <p>
                بعض الروابط على كوبوناوي هي روابط تابعة — أي أننا قد نحصل على
                عمولة صغيرة عند إتمامك عملية شراء عبرها، دون أي تكلفة إضافية
                عليك. هذه العمولات تساعدنا على إبقاء المنصة مجانية للجميع.
              </p>
            </section>

            <section>
              <h2 className="font-display text-charcoal text-base font-bold mb-2">
                ٤. مشاركة البيانات مع أطراف ثالثة
              </h2>
              <p>
                قد نشارك بيانات مجهولة الهوية مع مزوّدي خدمات تحليل البيانات
                (مثل أدوات قياس حركة الموقع). لا نشارك أي بيانات تعريفية
                شخصية مع أي طرف ثالث دون موافقتك الصريحة، إلا إذا اقتضى ذلك
                التزام قانوني.
              </p>
            </section>

            <section>
              <h2 className="font-display text-charcoal text-base font-bold mb-2">
                ٥. حماية البيانات
              </h2>
              <p>
                نستخدم بنية تحتية آمنة مع تشفير البيانات أثناء النقل
                (HTTPS). بيانات النماذج المُدخَلة محمية بسياسات وصول
                صارمة ولا يمكن الوصول إليها إلا من فريق الإدارة.
              </p>
            </section>

            <section>
              <h2 className="font-display text-charcoal text-base font-bold mb-2">
                ٦. حقوقك
              </h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>طلب الاطلاع على البيانات التي نحتفظ بها عنك.</li>
                <li>طلب تصحيح أو حذف بياناتك.</li>
                <li>الاعتراض على معالجة بياناتك في أي وقت.</li>
              </ul>
              <p className="mt-3">
                لممارسة أي من هذه الحقوق، راسلنا على{" "}
                <a
                  href="mailto:privacy@couponawy.com"
                  className="text-brand-red hover:text-brand-red-dark font-semibold transition-colors"
                >
                  privacy@couponawy.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="font-display text-charcoal text-base font-bold mb-2">
                ٧. التغييرات على هذه السياسة
              </h2>
              <p>
                قد نحدّث هذه السياسة من وقت لآخر. سنعلمك بأي تغييرات جوهرية
                عبر إشعار على الموقع. استمرارك في استخدام كوبوناوي بعد نشر
                التحديثات يعني موافقتك على السياسة الجديدة.
              </p>
            </section>

            <div className="border-t border-brand-gold/20 pt-6">
              <p>
                لأي استفسار يتعلق بهذه السياسة:{" "}
                <a
                  href="mailto:privacy@couponawy.com"
                  className="text-brand-red hover:text-brand-red-dark font-semibold transition-colors"
                >
                  privacy@couponawy.com
                </a>
              </p>
            </div>

          </div>
        </Container>
      </section>
    </main>
  );
}
