/**
 * Arabic SEO copy templates for coupon detail pages.
 *
 * Mirrors store-templates.ts. The problem is identical: 415 coupon pages can't
 * each get hand-written long-form copy, but ~40 body words per page is thin
 * content that Google ranks poorly and users bounce from.
 *
 * Solution: parameterized templates that read like genuine Arabic editorial when
 * filled with the offer's real data (store name, discount type/value, code,
 * expiry). They vary sentence-by-sentence to avoid duplicate-content flags,
 * while staying factually generic so we never fabricate claims about a specific
 * offer (e.g. we don't invent a minimum-order amount the coupon doesn't have).
 *
 * If a coupon has an admin-written description_ar, the about-block uses it
 * instead. Templates are the fallback for the long tail of offers without
 * custom copy.
 */

export type CouponDiscountType =
  | "percentage"
  | "fixed"
  | "free_shipping"
  | "bogo"
  | "other";

export type CouponTemplateInput = {
  /** The offer headline — e.g. "خصم 30% على الإلكترونيات" */
  titleAr: string;
  /** Arabic store name — e.g. "نون" */
  storeNameAr: string;
  /** Discount mechanic — drives the wording of every block */
  discountType: CouponDiscountType;
  /** Numeric value when discountType is percentage/fixed */
  discountValue?: number | null;
  /** Pre-formatted display string when admin set one (e.g. "خصم يصل إلى 50%") */
  discountDisplay?: string | null;
  /** The coupon code, when the offer requires one */
  code?: string | null;
  /** ISO expiry timestamp, or null when the offer doesn't expire */
  expiresAt?: string | null;
  /** Minimum order amount in SAR, when the offer enforces one */
  minOrder?: number | null;
  /** ISO country code — localizes copy ("في السعودية" vs "في الإمارات") */
  countryCode?: string | null;
  /** Admin-written long description. If set, replaces aboutOfferCopy. */
  descriptionOverride?: string | null;
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
 * Does this offer use a code the shopper must copy/paste? Free-shipping and
 * some "other" offers activate automatically via a link instead of a code.
 */
export function couponHasCode(input: CouponTemplateInput): boolean {
  return input.discountType !== "free_shipping" && !!input.code?.trim();
}

/**
 * Human-readable Arabic noun phrase for the discount, e.g. "خصم 30%",
 * "خصم 50 ريالاً", "شحن مجاني". Falls back to discount_display, then to a
 * neutral "عرض خاص" so we never print an empty or broken phrase.
 */
export function discountNoun(input: CouponTemplateInput): string {
  const { discountType, discountValue, discountDisplay } = input;
  if (discountType === "percentage" && discountValue != null) {
    return `خصم ${discountValue}%`;
  }
  if (discountType === "fixed" && discountValue != null) {
    return `خصم ${discountValue} ريالاً`;
  }
  if (discountType === "free_shipping") {
    return "شحن مجاني";
  }
  if (discountType === "bogo") {
    return "عرض اشترِ واحدة واحصل على الأخرى";
  }
  if (discountDisplay?.trim()) {
    return discountDisplay.trim();
  }
  return "عرض خاص";
}

/**
 * "About this offer" long-copy block. ~250 words, three paragraphs:
 *   1. What the offer is and the headline value
 *   2. Why it's worth using right now + how the discount mechanic works
 *   3. How couponawy fits in — verification, freshness, fallback if expired
 *
 * Returns the admin override verbatim when descriptionOverride is set.
 */
export function aboutOfferCopy(input: CouponTemplateInput): string {
  if (input.descriptionOverride?.trim()) return input.descriptionOverride.trim();

  const { titleAr, storeNameAr, discountType } = input;
  const country = countryPhrase(input.countryCode);
  const noun = discountNoun(input);

  // Second paragraph adapts to the discount mechanic so percentage, fixed,
  // free-shipping and bogo offers each read distinctly (anti-duplicate-content).
  const mechanic =
    discountType === "percentage"
      ? `يُحسب ${noun} على قيمة سلتك قبل الضريبة والشحن، أي أنّ التوفير يكبر كلما زادت قيمة طلبك. لهذا السبب يُنصح باستخدام هذا العرض عند تجميع أكثر من منتج في طلب واحد بدلاً من طلبات صغيرة متفرّقة.`
      : discountType === "fixed"
        ? `يُخصم ${noun} مبلغاً ثابتاً من إجمالي فاتورتك، وهو الأنسب للطلبات المتوسطة حيث تشكّل القيمة الثابتة نسبة ملموسة من السعر. تأكّد أن قيمة سلتك تستحقّ استخدام العرض الآن بدل الانتظار.`
        : discountType === "free_shipping"
          ? `يلغي هذا العرض رسوم الشحن بالكامل عند إتمام الطلب من ${storeNameAr}، وهو توفير حقيقي خصوصاً للطلبات الخفيفة التي عادةً ما تكون رسوم شحنها نسبة كبيرة من قيمتها.`
          : discountType === "bogo"
            ? `يمنحك هذا العرض قطعة إضافية مجاناً أو بنصف السعر عند شراء قطعة، وهو الأفضل لمن يشتري بكميات أو يخطّط لإهداء أحدهم. اقرأ شرط العرض بعناية لمعرفة القطع المشمولة.`
            : `فعّل هذا العرض من ${storeNameAr} لتحصل على توفير مباشر على طلبك. تظهر قيمة التوفير الفعلية في صفحة الدفع قبل تأكيد الطلب.`;

  const opening = `${titleAr} هو أحد العروض النشطة من ${storeNameAr} في ${country}، ويتيح لك ${noun} على مشترياتك عند الشراء عبر كوبوناوي.`;

  return `
${opening}

${mechanic} الأسعار في المتاجر الإلكترونية تتغيّر باستمرار، فاستخدام عرض ${storeNameAr} في كل عملية شراء يعني توفيراً حقيقياً يُضاف إلى رصيدك بدل أن يضيع.

في كوبوناوي نتحقّق من عروض ${storeNameAr} قبل نشرها ونعيد فحصها بشكل دوري، فما تراه هنا ليس مجرّد كود قديم منسوخ من موقع آخر. إن انتهت صلاحية هذا العرض، ستجد في أسفل الصفحة كوبونات ${storeNameAr} الأخرى الفعّالة لتستبدله في ثوانٍ — فلسفتنا بسيطة: لا تضيّع وقتك مع أكواد لا تعمل.
`.trim();
}

/**
 * "How to redeem this coupon" — ordered steps. Free-shipping/no-code offers get
 * a 3-step link-activation flow; coded offers get the 4-step copy/paste flow.
 * Returns {title, body} pairs; the renderer handles list semantics.
 */
export function howToRedeemSteps(
  input: CouponTemplateInput
): Array<{ title: string; body: string }> {
  const { storeNameAr } = input;
  const noun = discountNoun(input);

  if (!couponHasCode(input)) {
    return [
      {
        title: "اضغط «اذهب للمتجر»",
        body: `يفتح زر العرض موقع ${storeNameAr} في تبويب جديد مع تفعيل ${noun} تلقائياً على طلبك دون الحاجة لإدخال أي كود.`,
      },
      {
        title: "أضف منتجاتك إلى السلة",
        body: `تسوّق كالمعتاد وأضف ما تريده إلى السلة. تأكّد من استيفاء شروط العرض إن وُجدت (مثل حدّ أدنى للطلب).`,
      },
      {
        title: "أتمّ الدفع وتأكّد من التوفير",
        body: `عند صفحة الدفع، تحقّق من تطبيق ${noun} على الإجمالي قبل تأكيد الطلب. إن لم يظهر، عُد وافتح العرض من جديد عبر الرابط.`,
      },
    ];
  }

  return [
    {
      title: "اضغط «إظهار الكود»",
      body: `سيظهر كود خصم ${storeNameAr} فوراً مع زر نسخ. الضغط على «اذهب للمتجر» يفتح الموقع في تبويب جديد محتفظاً بالكود في الحافظة.`,
    },
    {
      title: "تسوّق وأضف إلى السلة",
      body: `انتقل إلى ${storeNameAr} وأضف المنتجات التي تريدها إلى السلة كالمعتاد، ثم اذهب إلى صفحة إتمام الطلب.`,
    },
    {
      title: "الصق الكود في خانة الخصم",
      body: `ابحث عن خانة «كود الخصم» أو «كوبون التخفيض» عند الدفع، الصق الكود واضغط «تطبيق» ليُحتسب ${noun}.`,
    },
    {
      title: "تأكّد قبل تأكيد الطلب",
      body: `راجع الإجمالي النهائي للتأكّد من ظهور قيمة الخصم. إن لم يعمل الكود، جرّب كوداً آخر من قائمة كوبونات ${storeNameAr} أدناه.`,
    },
  ];
}

/**
 * "Terms & eligibility" block. ~280 ar words. Covers the generic mechanics that
 * make a coupon succeed or fail: minimum order, new-customer-only, excluded
 * categories, one-per-order stacking, expiry. Written so it's useful without
 * inventing offer-specific numbers we don't have.
 */
export function termsAndEligibilityCopy(input: CouponTemplateInput): string {
  const { storeNameAr } = input;
  const noun = discountNoun(input);

  // Only state the minimum-order line as a fact when we actually have the number.
  const minOrderLine =
    input.minOrder != null
      ? `**الحدّ الأدنى للطلب:** يتطلّب هذا العرض حدّاً أدنى لقيمة السلة قدره ${input.minOrder} ريال قبل أن يُفعّل ${noun}. أضف منتجات حتى تتجاوز هذا الحدّ، فالعرض لن يُطبَّق على الطلبات الأصغر.`
      : `**الحدّ الأدنى للطلب:** بعض عروض ${storeNameAr} تشترط حدّاً أدنى لقيمة السلة قبل تفعيل الخصم. إن لم يُطبَّق ${noun} عند الدفع، تحقّق من بلوغ سلتك القيمة المطلوبة وأضف منتجاً صغيراً عند الحاجة.`;

  return `
قبل استخدام هذا العرض، خصّص دقيقة لقراءة الشروط التالية — معرفتها مسبقاً توفّر عليك محاولات فاشلة على صفحة الدفع وتضمن أن ${noun} يُطبَّق فعلاً.

${minOrderLine}

**العملاء الجدد مقابل الحاليين:** بعض الأكواد مخصّصة للعملاء الجدد في أول طلب فقط، وبعضها متاح للجميع. إن رفض الموقع الكود مع أنّك مستوفٍ للشروط، فقد يكون مخصّصاً لحساب جديد — جرّب كوداً عاماً من القائمة بدلاً منه.

**الفئات المستثناة:** كثير من العروض تستثني فئات محدّدة مثل المنتجات المخفّضة أصلاً، بطاقات الهدايا، أو علامات تجارية معيّنة بطلب من الموردين. إن لم تنخفض قيمة منتج بعينه، فغالباً هو ضمن الاستثناءات.

**كوبون واحد لكل طلب:** في معظم متاجر الخليج لا يمكن جمع أكثر من كود خصم في الطلب الواحد. النظام يطبّق الكود الأعلى قيمة فقط، فاختر العرض الأكبر إن كان لديك أكثر من خيار.

**الصلاحية:** ${input.expiresAt ? `لهذا العرض تاريخ انتهاء محدّد معروض أعلى الصفحة، وقد يُسحب قبل ذلك إن نفدت الكمية المخصّصة له.` : `لم يُحدَّد لهذا العرض تاريخ انتهاء ثابت، لكنّه قد يُسحب في أي وقت عند تغيّر سياسة المتجر — استخدمه قبل أن يختفي.`} ننصح دائماً بإتمام الطلب فور التأكّد من عمل الكود.
`.trim();
}

/**
 * "Maximize your savings" block. ~280 ar words. Actionable tactics that stack
 * extra value on top of the coupon: BNPL ordering, seasonal timing, wishlist
 * price alerts, comparing pre/post-discount price. Reads like an editor's
 * checklist, not boilerplate.
 */
export function maximizeSavingsCopy(input: CouponTemplateInput): string {
  const { storeNameAr } = input;
  const noun = discountNoun(input);

  return `
استخدام الكود وحده توفير جيّد، لكن تركيب الخطوات التالية معه يضاعف ما تحتفظ به في جيبك عند الشراء من ${storeNameAr}.

**طبّق الخصم قبل التقسيط لا بعده.** إن كنت ستقسّط طلبك عبر Tabby أو Tamara، فعّل ${noun} أولاً ثم اختر التقسيط. هذا الترتيب يضمن احتساب الخصم على السعر الكامل، ثم تُقسَّط القيمة المتبقّية الأقل — وليس العكس.

**قارن السعر قبل وبعد الكود.** بعض المنتجات تكون مخفّضة أصلاً، وقد يطبّق المتجر الخصم الأعلى فقط. سجّل السعر النهائي قبل إدخال الكود وبعده لتعرف التوفير الحقيقي، ولا تفترض أنّ الخصم يُضاف فوق التخفيض المعلن دائماً.

**اجمع مشترياتك في طلب واحد.** رسوم الشحن والحدّ الأدنى للطلب يجعلان الطلبات الصغيرة المتكرّرة أغلى. جمّع ما تحتاجه في سلة واحدة لتتجاوز شرط الحدّ الأدنى وتوزّع رسوم الشحن على قيمة أكبر.

**تابع المواسم الكبرى.** أعلى خصومات ${storeNameAr} تظهر في رمضان، الجمعة البيضاء (نوفمبر)، 11.11، ويوم التأسيس. إن لم يكن شراؤك عاجلاً، انتظر الموسم القادم وراقب صفحة المتجر على كوبوناوي.

**فعّل تنبيهات الأسعار.** أضف ما تريده إلى قائمة الرغبات في ${storeNameAr} وفعّل إشعار تغيّر السعر. عند انخفاضه، استخدم الكود فوقه لتحصل على أدنى سعر ممكن.
`.trim();
}

/**
 * FAQ for a coupon page — 8 questions mapped directly to FAQPage schema.
 * Each answer is 1-2 sentences, factual, no hype. Questions reflect the actual
 * queries Arabic shoppers type ("ليش الكود ما اشتغل؟") and Google's "People
 * also ask" surface for offer queries.
 */
export function couponFaq(
  input: CouponTemplateInput
): Array<{ question: string; answer: string }> {
  const { storeNameAr, titleAr } = input;
  const noun = discountNoun(input);
  const hasCode = couponHasCode(input);
  const country = countryPhrase(input.countryCode);

  return [
    {
      question: `هل عرض «${titleAr}» مجاني الاستخدام؟`,
      answer: `نعم، استخدام هذا العرض على كوبوناوي مجاني تماماً دون أي رسوم اشتراك أو تسجيل. تدفع فقط قيمة طلبك من ${storeNameAr} بعد خصم قيمة العرض.`,
    },
    {
      question: hasCode
        ? `كيف أستخدم كود خصم ${storeNameAr}؟`
        : `كيف أفعّل هذا العرض من ${storeNameAr}؟`,
      answer: hasCode
        ? `اضغط «إظهار الكود» لنسخه، انتقل إلى ${storeNameAr}، أضف منتجاتك للسلة، ثم الصق الكود في خانة «كود الخصم» عند الدفع ليُحتسب ${noun}.`
        : `اضغط زر العرض لينقلك إلى ${storeNameAr} مع تفعيل ${noun} تلقائياً. أكمل تسوّقك وتأكّد من ظهور التوفير في صفحة الدفع قبل تأكيد الطلب.`,
    },
    {
      question: `لماذا لم يعمل العرض لديّ؟`,
      answer: `الأسباب الأكثر شيوعاً: انتهاء صلاحية الكود، عدم بلوغ الحدّ الأدنى للطلب، أنّ العرض لعملاء جدد فقط، أو أنّ منتجك ضمن فئة مستثناة. جرّب كوداً آخر من قائمة كوبونات ${storeNameAr} أدناه.`,
    },
    {
      question: `كم قيمة التوفير من هذا العرض؟`,
      answer: `يمنحك هذا العرض ${noun}. القيمة الفعلية بالريال تعتمد على إجمالي سلتك وتظهر بوضوح في صفحة الدفع قبل تأكيد الطلب.`,
    },
    {
      question: `هل يمكنني استخدام أكثر من كوبون في نفس الطلب؟`,
      answer: `معظم متاجر الخليج بما فيها ${storeNameAr} تسمح بكوبون واحد لكل طلب، ويطبّق النظام الأعلى قيمة فقط. إن سمح العرض بالجمع مع تخفيضات أخرى فسيُذكر ذلك في شروطه.`,
    },
    {
      question: `هل هذا العرض ساري المفعول الآن؟`,
      answer: `${input.expiresAt ? `تاريخ انتهاء العرض معروض أعلى الصفحة، ونعيد التحقّق منه دورياً.` : `هذا العرض نشط حالياً ولا يحمل تاريخ انتهاء ثابتاً، لكنّه قد يُسحب في أي وقت.`} إن وجدته متوقّفاً، استبدله بأحد العروض الفعّالة من ${storeNameAr} في أسفل الصفحة.`,
    },
    {
      question: `هل يعمل العرض في ${country}؟`,
      answer: `نعم، نعرض عروض ${storeNameAr} المتاحة في ${country}. تحقّق من خيارات التوصيل والدفع المتاحة لمدينتك عند إتمام الطلب، فبعض العروض قد تختلف بين دول الخليج.`,
    },
    {
      question: `هل يمكنني الدفع بالتقسيط مع استخدام هذا العرض؟`,
      answer: `نعم في معظم الحالات. فعّل ${noun} أولاً ثم اختر التقسيط عبر Tabby أو Tamara عند الدفع — هكذا يُحتسب الخصم على السعر الكامل وتُقسَّط القيمة المتبقّية الأقل.`,
    },
  ];
}
