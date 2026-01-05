import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MessagesList } from "./MessagesList";

type Props = {
  searchParams: Promise<{ user?: string }>;
};

export default async function MessagesPage({ searchParams }: Props) {
  const { user: preselectedUserId } = await searchParams;

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login");
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect("/login");
  }

  // Get all conversations (users you've messaged with)
  const { data: sentMessages } = await supabase
    .from("messages")
    .select("recipient_id, profiles!messages_recipient_id_fkey(id, display_name, avatar_url)")
    .eq("sender_id", userData.user.id)
    .order("created_at", { ascending: false });

  const { data: receivedMessages } = await supabase
    .from("messages")
    .select("sender_id, profiles!messages_sender_id_fkey(id, display_name, avatar_url)")
    .eq("recipient_id", userData.user.id)
    .order("created_at", { ascending: false });

  // Combine and deduplicate conversation partners
  const conversationMap = new Map();

  sentMessages?.forEach((msg: any) => {
    const profile = msg.profiles;
    if (profile && !conversationMap.has(msg.recipient_id)) {
      conversationMap.set(msg.recipient_id, profile);
    }
  });

  receivedMessages?.forEach((msg: any) => {
    const profile = msg.profiles;
    if (profile && !conversationMap.has(msg.sender_id)) {
      conversationMap.set(msg.sender_id, profile);
    }
  });

  const conversations = Array.from(conversationMap.entries()).map(([userId, profile]) => ({
    userId,
    ...profile,
  }));

  // If preselected user is provided and not in conversations, add them
  if (preselectedUserId && !conversationMap.has(preselectedUserId)) {
    const { data: preselectedProfile } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("id", preselectedUserId)
      .single();

    if (preselectedProfile) {
      conversations.unshift({
        userId: preselectedProfile.id,
        display_name: preselectedProfile.display_name,
        avatar_url: preselectedProfile.avatar_url,
      });
    }
  }

  // Get unread message count
  const { count: unreadCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", userData.user.id)
    .eq("is_read", false);
      
  return (
    <main className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          Messages
        </h1>
        {unreadCount ? (
          <p className="mt-2 text-neutral-600">
            You have {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
          </p>
        ) : null}
      </div>

      <MessagesList
        conversations={conversations}
        currentUserId={userData.user.id}
        preselectedUserId={preselectedUserId || null}
      />
    </main>
  );
}
