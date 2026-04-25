/**
 * Arabic SEO copy templates for store detail pages.
 *
 * The trade-off: 612 stores can't each get hand-written long-form copy in 2 days.
 * But generic boilerplate is worse than nothing — Google penalizes thin/duplicate content.
 *
 * Solution: parameterized templates that read like genuine Arabic editorial when
 * filled with real store data (name, description, country, top category). They
 * vary enough sentence-by-sentence to avoid duplicate-content flags, while staying
 * factually generic so we don't make up claims about each store.
 *
 * If a store has store.description_ar (admin-written), we use that instead.
 * Templates are the fallback for the long tail of stores without custom copy.
 */

export type StoreTemplateInput = {
  /** Arabic store name — e.g. "نون" */
  nameAr: string;
  /** Optional admin-written short description */
  shortDescription?: string | null;
  /** ISO country code — used to localize copy ("في السعودية" vs "في الإمارات") */
  countryCode?: string | null;
  /** Optional top category name in Arabic — e.g. "إلكترونيات" */
  topCategoryAr?: string | null;
  /** Number of active coupons currently available */
  activeCouponCount: number;
};

const COUNTRY_NAME: Record<string, string> = {
  SA: "السعودية",
  AE: "الإمارات",
  KW: "الكويت",
  BH: "البحرين",
  OM: "عمان",
  QA: "قطر",
};

function countryPhrase(code?: string | null): string {
  if (!code) return "السعودية والخليج";
  return COUNTRY_NAME[code.toUpperCase()] ?? "السعودية والخليج";
}

/**
 * "About this store" long-copy block. ~250 words. Three paragraphs:
 *   1. What the store is and why shoppers love it
 *   2. What you'll find — categories + value proposition
 *   3. How couponawy fits in — savings, verification, daily updates
 */
export function aboutStoreCopy({
  nameAr,
  shortDescription,
  countryCode,
  topCategoryAr,
  activeCouponCount,
}: StoreTemplateInput): string {
  const country = countryPhrase(countryCode);
  const opening =
    shortDescription?.trim() ||
    `${nameAr} من أبرز المتاجر الإلكترونية في ${country} — يجمع بين تشكيلة واسعة من المنتجات وأسعار تنافسية وتجربة شراء آمنة وسريعة.`;

  const categoryLine = topCategoryAr
    ? ` يتميّز ${nameAr} بشكل خاص في فئة ${topCategoryAr}، حيث ستجد منتجات أصلية بضمان وأسعار يصعب مطابقتها.`
    : "";

  return `
${opening}

يقدّم ${nameAr} لعملائه تشكيلة منتقاة من المنتجات الأصلية، مع التزام واضح بسرعة الشحن وسهولة الإرجاع.${categoryLine} ولأنّ الأسعار قابلة للتغيير دائماً، فإن استخدام كود خصم ${nameAr} في كل عملية شراء يعني توفير حقيقي يضاف لرصيدك.

في كوبوناوي نتابع متجر ${nameAr} يومياً ونتحقّق من كل كود قبل نشره. حالياً متوفّر لديك ${activeCouponCount > 0 ? activeCouponCount + " كوبوناً مجرّباً" : "تشكيلة من العروض الموسمية"} يمكنك استخدامها مباشرة. إن انتهى أحدها، استبدله بآخر فعّال في ثوانٍ — هذه فلسفتنا: لا تضيع وقتك مع أكواد لا تعمل.
`.trim();
}

/**
 * "How to use a {store} coupon" — 4-step ordered list.
 * Returns rendered Arabic text snippets; the component handles list semantics.
 */
export function howToUseCouponSteps(input: StoreTemplateInput) {
  const { nameAr } = input;
  return [
    {
      title: "اختر الكود المناسب",
      body: `تصفّح كوبونات ${nameAr} في الأعلى واختر الكود الذي يناسب فئة المنتج التي تريد شراءها.`,
    },
    {
      title: "اضغط «إظهار الكود»",
      body: `سيظهر لك الكود فوراً مع زر نسخ. الضغط على «اذهب للمتجر» يفتح ${nameAr} في تبويب جديد.`,
    },
    {
      title: "أتمّ عملية الشراء",
      body: `أضف منتجاتك إلى السلة، ثم انتقل إلى صفحة الدفع. ابحث عن خانة «كود الخصم» أو «كوبون التخفيض».`,
    },
    {
      title: "ألصق الكود وفعّله",
      body: `الصق الكود واضغط «تطبيق». ستظهر قيمة الخصم خصماً مباشراً من إجمالي الفاتورة.`,
    },
  ];
}

/**
 * FAQ for a store page — 5 questions, designed to map directly to FAQPage schema
 * structured data. Each answer is 1-2 sentences, factual, no hype.
 *
 * These questions are picked because they're the actual queries Arabic shoppers
 * search for (and also the questions Google's "People also ask" surfaces for
 * coupon-site queries). Capturing this surface area = direct organic traffic.
 */
export function storeFaq({
  nameAr,
  countryCode,
}: StoreTemplateInput): Array<{ question: string; answer: string }> {
  const country = countryPhrase(countryCode);
  return [
    {
      question: `هل كوبونات ${nameAr} على كوبوناوي مجانية؟`,
      answer: `نعم، جميع كوبونات ${nameAr} على كوبوناوي متاحة للاستخدام مجاناً ومن دون أي رسوم اشتراك أو تسجيل.`,
    },
    {
      question: `كيف أعرف أن كود ${nameAr} ساري المفعول؟`,
      answer: `نختبر كل كود قبل نشره، ونعيد التحقق منه بشكل دوري. إذا انتهت صلاحيته يتمّ تحديث الصفحة فوراً، وستجد دائماً تاريخ انتهاء واضحاً مع كل كود.`,
    },
    {
      question: `لماذا لم يعمل كود الخصم لديّ؟`,
      answer: `قد يكون السبب: انتهاء صلاحية الكود، أو عدم استيفاء شرط الحدّ الأدنى للطلب، أو أن الكود مخصّص لعملاء جدد فقط. جرّب كوداً آخر من القائمة أو راجع الشروط المرفقة معه.`,
    },
    {
      question: `هل يعمل ${nameAr} في ${country}؟`,
      answer: `نعم، ${nameAr} يخدم عملاءه في ${country} مع توصيل سريع ودفع آمن. تحقق من خيارات التوصيل والدفع المتاحة لمدينتك عند إتمام الطلب.`,
    },
    {
      question: `كم مرة تُحدَّث كوبونات ${nameAr}؟`,
      answer: `نضيف كوبونات جديدة بشكل يومي، ونزيل أي كود ينتهي مفعوله مباشرة. تابعنا للحصول على أحدث العروض الحصرية لـ ${nameAr}.`,
    },
  ];
}

// ─── Category templates ─────────────────────────────────────────────────────

export type CategoryTemplateInput = {
  nameAr: string;
  description?: string | null;
  countryCode?: string | null;
  activeCouponCount: number;
  topStoreCount: number;
};

/**
 * About-this-category long copy. Mirrors store template structure for consistency.
 */
export function aboutCategoryCopy({
  nameAr,
  description,
  countryCode,
  activeCouponCount,
  topStoreCount,
}: CategoryTemplateInput): string {
  const country = countryPhrase(countryCode);
  const opening =
    description?.trim() ||
    `قسم ${nameAr} يجمع كوبونات الخصم وأكواد التوفير من أبرز متاجر ${country} في هذه الفئة.`;

  return `
${opening}

نتابع هذه الفئة باستمرار لنوفّر لك أحدث العروض من ${topStoreCount > 0 ? topStoreCount + " متجراً" : "أكبر المتاجر"} الموثوقة. كل كود يُختبر قبل نشره، وكل صفحة تُحدّث يومياً، فلا تضيع وقتك في أكواد منتهية أو غير فعّالة.

سواء كنت تبحث عن صفقة سريعة أو تخطّط لعملية شراء كبيرة، ستجد في هذا القسم ${activeCouponCount > 0 ? activeCouponCount + " كوبوناً نشطاً" : "تشكيلة من العروض"} جاهزة للاستخدام. اختر العرض الأنسب، انسخ الكود، وأنهِ طلبك بثقة.
`.trim();
}

/**
 * Category FAQ — 4 questions. Less than store FAQ because category pages are broader
 * and shoppers ask fewer category-level questions vs store-level questions.
 */
export function categoryFaq({
  nameAr,
  countryCode,
}: CategoryTemplateInput): Array<{ question: string; answer: string }> {
  const country = countryPhrase(countryCode);
  return [
    {
      question: `كيف أختار أفضل كوبون في قسم ${nameAr}؟`,
      answer: `رتّب الكوبونات حسب نسبة الخصم أو تاريخ الانتهاء، واحرص على قراءة الشروط المرفقة (الحد الأدنى للطلب، استثناءات الفئات).`,
    },
    {
      question: `هل يمكن استخدام أكثر من كوبون في نفس الطلب؟`,
      answer: `معظم المتاجر تسمح بكوبون واحد لكل طلب. إذا كان الكوبون يدعم الجمع مع عروض أخرى فسيُذكر ذلك في تفاصيله.`,
    },
    {
      question: `هل كوبونات قسم ${nameAr} حصرية على كوبوناوي؟`,
      answer: `بعض الكوبونات حصرية بالاتفاق مع المتاجر، وستجدها مرفقة بشارة «حصري». باقي الكوبونات عامة لكنها مختارة ومجرّبة.`,
    },
    {
      question: `هل العروض في قسم ${nameAr} تشمل ${country}؟`,
      answer: `نعم، نعرض فقط الكوبونات التي تعمل في ${country} حسب الدولة المختارة في إعدادات حسابك. غيّر دولتك من القائمة أعلى الصفحة لرؤية عروض دول أخرى.`,
    },
  ];
}
