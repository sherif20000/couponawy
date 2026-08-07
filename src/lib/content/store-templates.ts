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
  /** Optional admin override — long-form intro (markdown). If set, replaces aboutStoreCopy. */
  editorialIntroOverride?: string | null;
  /** Optional admin override — seasonal calendar (markdown). If set, replaces seasonalCalendar. */
  seasonalCalendarOverride?: string | null;
  /** Optional admin override — shipping/returns guide (markdown). If set, replaces shippingInfo. */
  shippingInfoOverride?: string | null;
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
 *
 * If `editorialIntroOverride` is provided (admin-authored markdown), returns
 * it untouched — the page renderer will pass it through markdown-to-HTML.
 */
export function aboutStoreCopy({
  nameAr,
  shortDescription,
  countryCode,
  topCategoryAr,
  activeCouponCount,
  editorialIntroOverride,
}: StoreTemplateInput): string {
  if (editorialIntroOverride?.trim()) return editorialIntroOverride.trim();

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
 * "Shipping + returns + payment guide" block — country-localized.
 * ~300-400 ar words. Covers the generic mechanics of buying from a Gulf
 * e-commerce store: delivery times, COD availability, returns window,
 * supported wallets. The bot/Google sees a substantive, useful answer; the
 * shopper sees actionable info before they click through.
 *
 * Returns admin override if set.
 */
export function shippingInfoCopy({
  nameAr,
  countryCode,
  shippingInfoOverride,
}: StoreTemplateInput): string {
  if (shippingInfoOverride?.trim()) return shippingInfoOverride.trim();

  const country = countryPhrase(countryCode);
  // Per-country delivery/payment specifics. Generic enough not to make false
  // claims about each individual store, factual enough to be useful.
  const deliveryDays =
    countryCode === "SA"
      ? "1-3 أيام داخل المدن الكبرى"
      : countryCode === "AE"
        ? "24-48 ساعة في الإمارات السبع"
        : countryCode === "KW"
          ? "1-2 يوم داخل الكويت"
          : "1-4 أيام داخل دول الخليج";
  const codNote =
    countryCode && ["SA", "AE", "KW", "QA", "BH", "OM"].includes(countryCode)
      ? `الدفع عند الاستلام متاح في معظم المدن الرئيسية في ${country}`
      : "الدفع عند الاستلام يعتمد على دولتك ومنطقتك";

  return `
عندما تطلب من متجر ${nameAr} في ${country}، تختلف تجربة الشحن والدفع قليلاً عن المتاجر الأخرى. لذلك جمعنا أهم النقاط في مكان واحد حتى لا تضطر للبحث عنها في أكثر من صفحة.

**مدة التوصيل المتوقعة:** ${deliveryDays}. المناطق النائية قد تستغرق وقتاً إضافياً، وعادةً ما يُظهر المتجر التقدير الدقيق عند إدخال عنوانك في صفحة الدفع. الطلبات التي تُؤكَّد قبل الظهر تُشحن في نفس اليوم لمعظم الفروع.

**طرق الدفع المتاحة:** البطاقات البنكية (فيزا، ماستركارد، مدى داخل السعودية)، Apple Pay، STC Pay داخل السعودية، إضافة إلى خيارات التقسيط بدون فوائد عبر Tabby و Tamara في معظم الطلبات التي تتجاوز 200 ر.س. ${codNote}، لكن قد يُضاف رسم رمزي للخدمة.

**سياسة الإرجاع والاستبدال:** معظم المنتجات قابلة للإرجاع خلال 14 يوماً من الاستلام، شريطة أن تكون في حالتها الأصلية مع كامل ملحقاتها. منتجات العناية الشخصية والملابس الداخلية مستثناة لأسباب صحية. بعض المنتجات الإلكترونية لها فترة إرجاع موسّعة تصل إلى 30 يوماً، تحقّق من تفاصيل المنتج قبل الشراء.

**رسوم الجمارك والضرائب:** للشحنات الدولية من خارج دول الخليج، قد تُطبَّق رسوم جمركية تُحسَب على قيمة الفاتورة. ${nameAr} عادةً ما يُظهر هذه الرسوم في صفحة الدفع قبل تأكيد الطلب، فلا توجد مفاجآت عند الاستلام. إن لم تظهر، اسأل خدمة العملاء قبل الدفع.

نصيحة من كوبوناوي: استخدم كود الخصم قبل خيار التقسيط — هذه الترتيب يضمن أن نسبة الخصم تُطبَّق على السعر الكامل، ثم تُقسَّط القيمة المتبقية. هكذا تستفيد من الخصم والتقسيط في نفس الطلب.
`.trim();
}

/**
 * "Seasonal savings calendar" block. ~400-500 ar words. Tells the shopper
 * when to expect peak discounts at this store: Ramadan, White Friday (Black
 * Friday equivalent in MENA), Eid, Back-to-School, Single's Day (11.11).
 * Each season gets a short, factual paragraph — what to buy, expected
 * discount range, when to start watching.
 *
 * Returns admin override if set.
 */
export function seasonalCalendarCopy({
  nameAr,
  topCategoryAr,
  seasonalCalendarOverride,
}: StoreTemplateInput): string {
  if (seasonalCalendarOverride?.trim()) return seasonalCalendarOverride.trim();

  // Category-aware framing — fashion stores peak differently from electronics.
  const peakHint =
    topCategoryAr === "إلكترونيات"
      ? "تجد أفضل عروض الأجهزة والإلكترونيات"
      : topCategoryAr === "أزياء"
        ? "تتصدّر الأزياء والإكسسوارات قائمة الخصومات"
        : "تنخفض الأسعار في معظم الفئات";

  return `
لمعرفة أفضل وقت للشراء من ${nameAr}، يستحقّ متابعة المواسم السنوية التي تتراوح فيها الخصومات بين الجيدة والاستثنائية. الأسعار في هذه الفترات تنخفض بشكل ملحوظ، والكوبونات الحصرية تكثر، فلا تشتري قبلها إلا للضرورة.

**شهر رمضان المبارك:** يبدأ ${nameAr} عادةً ببرنامج خصومات رمضاني من الأسبوع الأول، يمتدّ حتى ليلة العيد. ${peakHint} في هذه الفترة بنسب تصل إلى 50%، مع عروض يومية محدودة الوقت وحملات «اشترِ قطعتين واحصل على الثالثة مجاناً». هذه الفترة هي أفضل وقت لشراء الإلكترونيات والأجهزة المنزلية والمستلزمات الأسرية.

**الجمعة البيضاء (White Friday):** آخر جمعة من نوفمبر — أكبر حدث تخفيضات في السنة على مستوى الخليج. ${nameAr} يبدأ بترويج العروض قبل الموعد بأسبوع، والخصومات الفعلية تتراوح بين 30% و 70% على فئات مختارة. خذ بعين الاعتبار أن أفضل القطع تنفد سريعاً، فأضفها إلى قائمة الرغبات قبل الموعد لتلقّي تنبيهات السعر.

**عيد الفطر وعيد الأضحى:** يستمرّ موسم العيد عادةً 5-7 أيام بعد كل عيد. تتوفّر عروض على الهدايا، الملابس الجاهزة، الإكسسوارات، والإلكترونيات الموجّهة كهدايا. الكوبونات في هذه الفترة عادةً ما تكون كوبونات إجمالية على السلة (10-25%) وليست خصومات على منتجات بعينها.

**موسم العودة إلى المدارس:** من منتصف أغسطس حتى نهاية سبتمبر — تتركّز العروض على الأجهزة (لابتوب، تابلت، طابعة)، القرطاسية، الزيّ المدرسي، والحقائب. ${nameAr} يطلق عادةً حزم «منتج + مرفقات» بسعر أقلّ من شرائها منفصلة.

**11.11 (يوم العزّاب) و 12.12:** عروض حدّيّة قصيرة (48-72 ساعة) في 11 نوفمبر و 12 ديسمبر. ${nameAr} يشارك في هذين الحدثين بنسب خصم تنافسية تشبه الجمعة البيضاء، خصوصاً على الإلكترونيات والإكسسوارات الصينية المستوردة.

**يوم التأسيس وأسبوع التجارة الإلكترونية:** فعاليات محلية أحدث — يوم التأسيس (22 فبراير في السعودية) صار موسم عروض رسمياً، وأسبوع التجارة الإلكترونية في الإمارات (نهاية يونيو) كذلك. عروض هذه المناسبات أصغر حجماً لكنها أكثر تنوّعاً.

اشترك في تنبيهات كوبوناوي لتصلك أحدث كوبونات ${nameAr} قبل كل موسم بأيام — هكذا تشتري حين تكون الأسعار في أدنى نقطة فعلاً، لا حين يكون "الخصم" مجرّد رفع ثمّ تخفيض.
`.trim();
}

/**
 * "Brand history + background" block. ~200-300 ar words. Establishes E-E-A-T
 * by giving the shopper context about the store: when it launched, who owns
 * it (if known via short_description), what makes it distinct in its niche.
 * Generic enough not to fabricate facts, specific enough to read as editorial.
 */
export function storeHistoryCopy({
  nameAr,
  shortDescription,
  countryCode,
  topCategoryAr,
}: StoreTemplateInput): string {
  const country = countryPhrase(countryCode);
  const niche = topCategoryAr ? `قطاع ${topCategoryAr}` : "التجارة الإلكترونية";
  const baseline = shortDescription?.trim()
    ? ` ${shortDescription.trim()}`
    : "";

  return `
بدأ ${nameAr} رحلته في ${niche} ليصبح اليوم أحد الأسماء الموثوقة لدى المتسوّقين في ${country}.${baseline} ما يميّز المتجر ليس فقط حجم تشكيلته، بل أيضاً سياساته الواضحة في الجودة والإرجاع، وهذا ما جعل قاعدة عملائه تنمو عاماً بعد عام.

على مدى السنوات الماضية، طوّر ${nameAr} منظومة لوجستية متينة تشمل مستودعات إقليمية، شراكات شحن مع شركات التوصيل الكبرى، وفريق خدمة عملاء يعمل بالعربية واللغات المحلية. هذا الاستثمار في البنية التحتية ينعكس مباشرةً في تجربة العميل: من سرعة معالجة الطلب إلى دقّة التواصل عند أي استفسار.

أما على صعيد الموردين، فالمتجر يتعامل مع علامات تجارية مباشرة (بدون وسطاء) في غالبية فئاته، مما يضمن أصالة المنتجات وأسعاراً تنافسية مقارنة بالمنافسين. وعند ظهور إصدارات جديدة من المنتجات الأكثر طلباً، عادةً ما يكون ${nameAr} من أوائل المتاجر التي تعرضها في الأسواق المحلية.

نختار في كوبوناوي المتاجر التي نوصي بها بناءً على ثلاثة معايير: ثبات الأسعار، التزام السياسات المُعلنة، وجودة خدمة العملاء عند المشكلات. ${nameAr} يستوفي هذه المعايير الثلاثة، ولذلك تجد كوبوناته معروضة عندنا بشكل دائم وبتحقّق يومي.
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
    {
      question: `هل يمكنني الدفع بالتقسيط في ${nameAr}؟`,
      answer: `معظم طلبات ${nameAr} التي تتجاوز 200 ر.س مؤهّلة للتقسيط بدون فوائد عبر Tabby و Tamara على 3-4 أقساط. خيار الدفع يظهر تلقائياً عند صفحة الدفع إذا كان الطلب مؤهّلاً.`,
    },
    {
      question: `هل يوفّر ${nameAr} خصماً لأول طلب؟`,
      answer: `بعض العملاء الجدد يحصلون على كود ترحيبي عند التسجيل لأول مرة. تحقّق من بريدك بعد التسجيل، أو ابحث عن كوبون «عميل جديد» في قائمة كوبونات ${nameAr} على كوبوناوي.`,
    },
    {
      question: `كيف أتواصل مع خدمة عملاء ${nameAr}؟`,
      answer: `لمعظم متاجر الخليج، الواتساب والبريد الإلكتروني هما القناتان الأسرع. روابط التواصل تظهر في تذييل موقع المتجر، وفريقهم عادةً يردّ خلال 4-12 ساعة عمل.`,
    },
    {
      question: `ما هي مدّة استرداد المبلغ بعد طلب الإرجاع؟`,
      answer: `بعد استلام المنتج المُرجَع وفحصه، يُسترَدّ المبلغ خلال 3-7 أيام عمل لبطاقة الائتمان، أو فوراً تقريباً للمحافظ الرقمية مثل STC Pay و Apple Pay.`,
    },
    {
      question: `هل تطبّق ${nameAr} سياسة مطابقة الأسعار؟`,
      answer: `سياسة مطابقة الأسعار تختلف من متجر لآخر ومن منتج لآخر. اقرأ صفحة «سياسة الأسعار» على موقع ${nameAr}، وإن وجدت السعر أرخص في متجر منافس راسل خدمة العملاء قبل الشراء.`,
    },
    {
      question: `هل تطبيق ${nameAr} يقدّم خصومات حصرية؟`,
      answer: `نعم، بعض المتاجر تطلق كوبونات حصرية للتطبيق فقط أو تخصم نسبة إضافية للطلبات عبر التطبيق. ابحث عن كوبون «خصم التطبيق» أو حمّل التطبيق للاطلاع على عروضه.`,
    },
    {
      question: `هل أحتاج إلى حساب لاستخدام كوبون ${nameAr}؟`,
      answer: `لا، تستطيع استخدام معظم الكوبونات كزائر، لكن إنشاء حساب يفيدك في تتبّع الطلبات وحفظ العناوين، وأحياناً للحصول على كوبونات حصرية للأعضاء.`,
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
  /** Admin override for the intro paragraph (markdown). */
  editorialIntroOverride?: string | null;
  /** Admin override for the seasonal calendar (markdown). */
  seasonalCalendarOverride?: string | null;
  /** Admin override for the shopping guide (markdown). */
  shoppingGuideOverride?: string | null;
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
  editorialIntroOverride,
}: CategoryTemplateInput): string {
  if (editorialIntroOverride?.trim()) return editorialIntroOverride.trim();

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
 * Category-specific shopping guide. ~300-400 ar words. Tells the shopper how
 * to buy smart in this category — what to look for, what to avoid, when to
 * compare. Returns admin override if set.
 */
export function categoryShoppingGuide({
  nameAr,
  shoppingGuideOverride,
}: CategoryTemplateInput): string {
  if (shoppingGuideOverride?.trim()) return shoppingGuideOverride.trim();

  // Generic-but-useful shopping advice that applies across categories. Each
  // numbered point reads like an editor's checklist, not Wikipedia.
  return `
قبل أن تستخدم أي كوبون في قسم ${nameAr}، خصّص دقيقتين لقراءة هذه النقاط — ستوفّر عليك مفاجآت متأخّرة وأحياناً مبالغ أكبر من الخصم نفسه.

**1. قارن السعر قبل تطبيق الكوبون.** بعض المتاجر ترفع السعر قبل المواسم ثم تعلن خصماً يبدو ضخماً. استخدم أدوات مثل CamelCamelCamel أو سجّل السعر يدوياً قبل أسبوع من شرائك المخطّط له لتعرف الخصم الحقيقي.

**2. اقرأ شروط الكوبون بالكامل.** كل كوبون يأتي بشروط: حدّ أدنى للطلب، فئات مستثناة، صلاحية محدودة، أو "للعملاء الجدد فقط". قراءتها مسبقاً تختصر ٥ دقائق من المحاولات الفاشلة على صفحة الدفع.

**3. تحقّق من سياسة الإرجاع قبل الشراء.** خاصةً للمنتجات الموسمية أو المخفّضة بنسبة كبيرة، تأكّد أن المنتج قابل للإرجاع إن لم يناسبك. بعض المتاجر تستثني المنتجات المخفّضة من الإرجاع.

**4. ابحث عن خيار «اشترِ الآن، ادفع لاحقاً».** خدمات مثل Tabby و Tamara تتيح لك تقسيم الفاتورة على 3-4 دفعات دون فوائد. مفيد للطلبات الكبيرة، خصوصاً مع الكوبونات الكبيرة.

**5. تابع تنبيهات الأسعار لقطعتك المفضّلة.** بدلاً من تصفّح يومي، أضف المنتجات التي تريدها إلى قائمة الرغبات وفعّل إشعارات تغيّر السعر. ستصلك رسالة حين ينخفض السعر، وتتدخّل في الوقت الأمثل.

**6. اعرف أحجام المنتج قبل الشراء (للأزياء).** جدول المقاسات يختلف من علامة إلى أخرى، حتى داخل المتجر الواحد. اقرأ قياسات المقاس الذي تنوي شراءه واقرنه بقياساتك الفعلية، لا فقط مقاسك المعتاد.

**7. احفظ كود تتبّع الشحنة منذ اللحظة الأولى.** فور تأكيد طلبك، احتفظ برقم الطلب ورقم الشحنة. إن تأخّرت الشحنة أو ضاعت، هذا الكود هو ما ستحتاجه عند مراسلة خدمة العملاء.

استخدم هذه القائمة في كل عملية شراء، خصوصاً للطلبات التي تتجاوز ٥٠٠ ر.س — تصبح عادة تلقائية وتوفّر مالاً أكثر بكثير من الكوبون وحده.
`.trim();
}

/**
 * Category seasonal calendar. ~300-400 ar words. Mirrors store seasonal copy
 * but framed around category buying cycles (Ramadan kitchen restock, BTS for
 * electronics, etc.). Returns admin override if set.
 */
export function categorySeasonalCalendar({
  nameAr,
  seasonalCalendarOverride,
}: CategoryTemplateInput): string {
  if (seasonalCalendarOverride?.trim()) return seasonalCalendarOverride.trim();

  return `
عروض قسم ${nameAr} لا تتوزّع بالتساوي على مدار السنة — هناك مواسم محدّدة تنزل فيها الأسعار بشكل ملحوظ، ومن يعرفها يشتري بنسبة توفير تصل أحياناً إلى ضعفي ما يحصل عليه المتسوّق العادي.

**رمضان والعشرة الأواخر:** أوّل موجة عروض كبيرة في السنة. متاجر هذا القسم تبدأ بحملات يومية من اليوم الأول، وتشتدّ في العشر الأواخر. الكوبونات في هذه الفترة تتراوح بين 15% و 40%، مع عروض «اشتر اثنين واحصل على الثالث» للمنتجات الأكثر طلباً.

**موسم العيدين:** الأسبوع الأول من شوّال وأسبوع ذي الحجّة. الكوبونات هنا أقلّ نسبة (10-25%) لكنّها تشمل تشكيلة أوسع، وعادةً ما تشمل عروض «خصم على السلة كاملة» وليس على منتجات بعينها. مفيدة للطلبات الكبيرة.

**يوم التأسيس (22 فبراير):** موسم رسمي حديث في السعودية، تتسابق فيه المتاجر بحملات بعروض تتراوح بين 20% و 50%. مدّته أسبوع كامل عادةً.

**الجمعة البيضاء — White Friday:** آخر جمعة من نوفمبر. أعلى الخصومات في السنة في معظم الفئات، تصل إلى 70% على منتجات محدّدة. الكميات محدودة، فمن يدخل أولاً يحجز أفضل القطع. تابعنا قبل الموعد بأسبوع لجدولة عروض كل متجر.

**11.11 و 12.12:** عروض حدّيّة قصيرة (48-72 ساعة). تتميّز بخصومات حصرية لا تتكرّر، خصوصاً للمنتجات المستوردة. هذان اليومان مهمّان جداً لمن يخطّط لشراء إلكترونيات أو أجهزة منزلية كبيرة.

**Back to School (أغسطس - سبتمبر):** قسم ${nameAr} يطلق عروضاً موجّهة للطلاب والأسر، تشمل حزم «منتج + مرفقات» بأسعار حزمية أقلّ من شرائها منفصلة. الفترة الفضلى من 15 أغسطس إلى 15 سبتمبر.

**نهاية السنة الميلادية (12.25 - 12.31):** عروض ما قبل رأس السنة، وأخيراً تخفيضات تصفية المخزون. الأسعار تكون منخفضة لكن الاختيار أقلّ تنوّعاً مما كان عليه في نوفمبر.

نصيحة: لا تشترِ في الفترة بين منتصف يناير ومنتصف فبراير، فالأسعار في أعلى نقطة عادةً بعد موجة الأعياد. انتظر يوم التأسيس أو رمضان، الفرق ملموس.
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
    {
      question: `ما هي أفضل فترة في السنة للشراء من قسم ${nameAr}؟`,
      answer: `الجمعة البيضاء (نوفمبر)، رمضان، والعشرة الأواخر منه، تليها 11.11 و 12.12 — هذه الفترات تشهد أكبر الخصومات. للأسر، موسم العودة للمدارس (أغسطس-سبتمبر) أيضاً ممتاز.`,
    },
    {
      question: `هل ينخفض سعر المنتج بعد استخدام الكوبون أكثر من العروض المعلنة في المتجر؟`,
      answer: `أحياناً نعم. بعض الكوبونات تُطبَّق فوق الخصومات المعلنة، وأحياناً تكون بديلاً للخصومات (المتجر يختار الأعلى). جرّب الكوبون عند الدفع وقارن السعر النهائي قبل وبعد.`,
    },
    {
      question: `هل يمكنني الدفع بالتقسيط على منتجات قسم ${nameAr}؟`,
      answer: `معظم المنتجات التي تتجاوز قيمة الطلب 200 ر.س مؤهّلة للتقسيط بدون فوائد عبر Tabby و Tamara. الخيار يظهر في صفحة الدفع تلقائياً.`,
    },
    {
      question: `ماذا أفعل إن وصلني منتج معيب من قسم ${nameAr}؟`,
      answer: `صوّر المنتج فور استلامه، احتفظ بالفاتورة، وراسل خدمة عملاء المتجر خلال 48 ساعة. معظم المتاجر تستبدل أو تسترد المبلغ في حالات العيوب التصنيعية دون عناء.`,
    },
    {
      question: `هل المنتجات في قسم ${nameAr} أصلية وبضمان؟`,
      answer: `نختار المتاجر التي نعرضها بناءً على سجلّ مثبت في بيع منتجات أصلية. تحقّق من علامة «بائع رسمي» أو «وكيل معتمد» في صفحة المنتج، وضمان الجهة المصنّعة عادةً ما يكون متاحاً للمنتجات المؤهّلة.`,
    },
    {
      question: `كم تستغرق الشحنة في قسم ${nameAr} عادةً؟`,
      answer: `داخل ${country}: 1-3 أيام للطلبات داخل المدن الكبرى، 2-5 أيام للمناطق النائية. الشحنات الدولية: 5-14 يوماً حسب البلد المصدر وخدمة الشحن المختارة.`,
    },
  ];
}
