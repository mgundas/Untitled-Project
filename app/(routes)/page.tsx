import AuthButtons from "../components/AuthButtons";
import { createClient } from '@/utils/supabase/server'
import { FeedTabs } from '../components/posts/FeedTabs';
import { PostComposerButton } from '../components/posts/PostComposerButton';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-4"><AuthButtons /></div>;

  return (
    <div className="w-full h-full overflow-auto">
      <FeedTabs />
      <PostComposerButton />
    </div>
  );
}
