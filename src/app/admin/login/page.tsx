import { sendMagicLink } from "./actions";

interface Props {
  searchParams: Promise<{ sent?: string; error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const sent = params.sent === "1";
  const hasError = !!params.error;

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-brand-red">
            كوبوناوي
          </h1>
          <p className="text-warm-brown mt-2 text-sm">لوحة الإدارة</p>
        </div>

        <div className="bg-white rounded-2xl shadow-brand p-8">
          <h2 className="text-xl font-display font-semibold text-charcoal mb-2">
            تسجيل الدخول
          </h2>
          <p className="text-warm-brown text-sm mb-6">
            أدخل بريدك الإلكتروني وسنرسل لك رابط دخول مباشر.
          </p>

          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-800 font-semibold">تم إرسال الرابط!</p>
              <p className="text-green-700 text-sm mt-1">
                تحقق من بريدك الإلكتروني وانقر على الرابط للدخول.
              </p>
            </div>
          ) : (
            <form action={sendMagicLink} className="space-y-4">
              {hasError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-700 text-sm">
                    {params.error === "auth_error"
                      ? "حدث خطأ أثناء المصادقة. حاول مرة أخرى."
                      : "تعذر إرسال الرابط. تأكد من البريد الإلكتروني وحاول مجدداً."}
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-charcoal mb-1.5"
                >
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@couponawy.com"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-charcoal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-brand-red text-cream rounded-xl font-semibold hover:bg-brand-red-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2"
              >
                إرسال رابط الدخول
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
