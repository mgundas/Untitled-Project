import { createClient } from "@/utils/supabase/server";
import { NotificationsList } from "@/app/components/notifications/NotificationsList";
import AuthButtons from "@/app/components/AuthButtons";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-4"><AuthButtons /></div>;

  return (
    <div className="w-full h-full overflow-auto">
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>
      <NotificationsList />
    </div>
  );
}
