import { signIn } from "./actions";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params.error;

  const errorMessage =
    error === "invalid_credentials"
      ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
      : error === "missing_fields"
        ? "يرجى إدخال البريد الإلكتروني وكلمة المرور."
        : error
          ? "حدث خطأ. حاول مرة أخرى."
          : null;

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
          <h2 className="text-xl font-display font-semibold text-charcoal mb-6">
            تسجيل الدخول
          </h2>

          <form action={signIn} className="space-y-4">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-700 text-sm">{errorMessage}</p>
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
                dir="ltr"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-charcoal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-charcoal mb-1.5"
              >
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                dir="ltr"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-charcoal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-brand-red text-cream rounded-xl font-semibold hover:bg-brand-red-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2"
            >
              دخول
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
