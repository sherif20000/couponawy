import Link from "next/link";
import type { Metadata } from "next";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";
import { StoreFaq, buildFaqJsonLd } from "@/components/seo/store-faq";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description:
    "إجابات على أكثر الأسئلة شيوعاً حول كوبوناوي وكيفية استخدام الكوبونات.",
};

// Page-level FAQs — broader and more brand-focused than the per-store FAQs.
// These map to FAQPage rich-results in Google search.
const FAQS = [
  {
    question: "هل الكوبونات على كوبوناوي مجانية؟",
    answer:
      "نعم، جميع الكوبونات على كوبوناوي مجانية تماماً. لا يلزمك أي اشتراك أو تسجيل لاستخدامها.",
  },
  {
    question: "كيف أعرف إذا كان الكوبون لا يزال صالحاً؟",
    answer:
      "كل كوبون يعرض تاريخ انتهاء الصلاحية في صفحته، ونحرص على تحديث الكوبونات وإزالة المنتهية يومياً.",
  },
  {
    question: "ماذا أفعل إذا لم يعمل الكوبون معي؟",
    answer:
      'إذا لم يعمل كوبون معك، يرجى الإبلاغ عنه عبر صفحة "الإبلاغ عن كوبون" حتى نتحقق منه ونصلحه في أقرب وقت.',
  },
  {
    question: "هل يمكنني استخدام أكثر من كوبون في نفس الطلب؟",
    answer:
      "يعتمد ذلك على سياسة كل متجر — بعض المتاجر تتيح دمج الكوبونات، وبعضها يحدّد كوبوناً واحداً لكل طلب. تحقّق من شروط الكوبون قبل الاستخدام.",
  },
  {
    question: "هل كوبوناوي متاح خارج المملكة العربية السعودية؟",
    answer:
      "نعم، نغطّي متاجر من السعودية والإمارات والكويت وعدد من دول الخليج. يمكنك تصفية الكوبونات حسب الدولة من شريط الإعدادات.",
  },
  {
    question: "كيف يكسب كوبوناوي أموالاً إذا كانت الخدمة مجانية؟",
    answer:
      "بعض الروابط على الموقع روابط تابعة — نحصل على عمولة صغيرة من المتجر عند إتمام عملية شراء عبرها، دون أي تكلفة عليك. هذا ما يتيح لنا إبقاء الخدمة مجانية وموثوقة.",
  },
  {
    question: "هل الموقع آمن؟ هل تجمعون بيانات شخصية؟",
    answer:
      "كوبوناوي لا يطلب منك أي بيانات شخصية لاستخدام الكوبونات. نستخدم ملفات تعريف ارتباط أساسية فقط لتذكّر تفضيلاتك (مثل البلد).",
  },
  {
    question: "كم مرة تُحدَّث كوبونات الموقع؟",
    answer:
      "نضيف كوبونات جديدة كل يوم، ونزيل أي كود ينتهي مفعوله مباشرة. تابعنا للحصول على أحدث العروض الحصرية.",
  },
];

export default function FAQPage() {
  const faqJsonLd = buildFaqJsonLd(FAQS);

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PageHero
        variant="subtle"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { label: "الأسئلة الشائعة" },
        ]}
        title="الأسئلة الشائعة"
        subtitle="إجابات سريعة على أكثر ما يسألنا المتسوّقون"
      />

      <StoreFaq items={FAQS} tone="default" />

      <Section size="md" spacing="md">
        <div className="text-center">
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
      </Section>
    </main>
  );
}
