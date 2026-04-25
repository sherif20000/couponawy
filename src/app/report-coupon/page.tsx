import { Flag } from "lucide-react";
import type { Metadata } from "next";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";
import { ReportForm } from "./report-form";

export const metadata: Metadata = {
  title: "الإبلاغ عن كوبون",
  description:
    "لاحظت كوبوناً منتهياً أو لا يعمل؟ أبلغنا وسنتحقق منه ونصلحه في أقرب وقت.",
};

type PageProps = { searchParams: Promise<{ url?: string }> };

export default async function ReportCouponPage({ searchParams }: PageProps) {
  const { url } = await searchParams;
  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        variant="subtle"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { label: "الإبلاغ عن كوبون" },
        ]}
        eyebrow={
          <>
            <Flag className="h-3.5 w-3.5 text-brand-gold" aria-hidden />
            ساعدنا في الحفاظ على جودة كوبوناوي
          </>
        }
        title="الإبلاغ عن كوبون"
        subtitle="مساهمتك تساعد آلاف المتسوّقين على تجنب الأكواد المنتهية"
      />

      <Section size="sm" spacing="lg">
        <p className="font-body text-warm-brown mb-8 text-sm leading-relaxed md:text-base">
          لاحظت كوبوناً منتهياً أو لا يعمل؟ أخبرنا وسنتحقق منه ونصلحه في
          أقرب وقت ممكن.
        </p>

        <ReportForm defaultUrl={url} />
      </Section>
    </main>
  );
}
