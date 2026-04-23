import { createClient } from "@/lib/supabase/server";

interface Props {
  title: string;
}

export async function AdminTopbar({ title }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="h-14 border-b border-charcoal/10 bg-white/60 backdrop-blur-sm flex items-center justify-between px-6">
      <h1 className="text-base font-display font-semibold text-charcoal">
        {title}
      </h1>
      {user && (
        <span className="text-xs text-warm-brown ltr font-mono" dir="ltr">
          {user.email}
        </span>
      )}
    </header>
  );
}
