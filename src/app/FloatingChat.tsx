"use client";

import { useState, useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";

type Conversation = {
  userId: string;
  display_name: string | null;
  avatar_url: string | null;
};

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export function FloatingChat({ userId }: { userId: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!userId) return;

    loadConversations();
    loadUnreadCount();

    // Subscribe to new messages (both sent and received)
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("floating-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // If this message involves the current user
          if (newMsg.sender_id === userId || newMsg.recipient_id === userId) {
            loadConversations();
            loadUnreadCount();
            
            // If we're viewing this conversation, add the message
            if (selectedUserId && (newMsg.sender_id === selectedUserId || newMsg.recipient_id === selectedUserId)) {
              setMessages((prev) => [...prev, newMsg]);
              if (newMsg.sender_id === selectedUserId) {
                markAsRead();
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, selectedUserId]);

  useEffect(() => {
    if (selectedUserId && userId) {
      loadMessages();
      markAsRead();
    }
  }, [selectedUserId, userId]);

  const loadConversations = async () => {
    if (!userId) return;

    const supabase = createSupabaseBrowserClient();
    
    const { data: sentMessages } = await supabase
      .from("messages")
      .select("recipient_id")
      .eq("sender_id", userId);

    const { data: receivedMessages } = await supabase
      .from("messages")
      .select("sender_id")
      .eq("recipient_id", userId);

    const userIds = new Set<string>();
    sentMessages?.forEach((msg: any) => userIds.add(msg.recipient_id));
    receivedMessages?.forEach((msg: any) => userIds.add(msg.sender_id));

    if (userIds.size > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", Array.from(userIds));

      const convs = Array.from(userIds).map((id) => {
        const profile = profiles?.find((p) => p.id === id);
        return {
          userId: id,
          display_name: profile?.display_name || null,
          avatar_url: profile?.avatar_url || null,
        };
      });

      setConversations(convs);
    }
  };

  const loadUnreadCount = async () => {
    if (!userId) return;

    const supabase = createSupabaseBrowserClient();
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .eq("is_read", false);

    setUnreadCount(count || 0);
  };

  const loadMessages = async () => {
    if (!selectedUserId || !userId) return;

    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},recipient_id.eq.${userId})`
      )
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const markAsRead = async () => {
    if (!selectedUserId || !userId) return;

    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("recipient_id", userId)
      .eq("sender_id", selectedUserId)
      .eq("is_read", false);

    loadUnreadCount();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId || !userId || loading) return;

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: userId,
        recipient_id: selectedUserId,
        content: newMessage.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      // Add message immediately (real-time will handle it too, but this ensures it shows)
      setMessages((prev) => {
        // Check if message already exists (from real-time)
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setNewMessage("");
    }
    setLoading(false);
  };

  if (!userId) return null;

  const selectedConversation = conversations.find((c) => c.userId === selectedUserId);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-all hover:bg-emerald-500 hover:scale-110 lg:h-16 lg:w-16"
      >
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
        <svg
          className="h-6 w-6 lg:h-7 lg:w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 bg-emerald-600 p-4 text-white">
            <h3 className="text-lg font-bold">Messages</h3>
            <div className="flex items-center gap-2">
              <Link
                href="/messages"
                className="rounded-lg p-2 transition-colors hover:bg-emerald-500"
                title="Open full messages"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 transition-colors hover:bg-emerald-500"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          {!selectedUserId ? (
            <div className="max-h-96 overflow-y-auto p-4">
              {conversations.length === 0 ? (
                <div className="py-8 text-center text-neutral-500">
                  <div className="mb-2 text-4xl">💬</div>
                  <p className="text-sm">No conversations yet</p>
                  <Link
                    href="/search-users"
                    className="mt-4 inline-block text-sm text-emerald-600 hover:underline"
                  >
                    Find chefs to message
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.userId}
                      onClick={() => setSelectedUserId(conv.userId)}
                      className="w-full rounded-xl border-2 border-transparent p-3 text-left transition-colors hover:bg-neutral-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white">
                          {(conv.display_name || "U")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="truncate font-semibold text-neutral-900">
                            {conv.display_name || "Anonymous Chef"}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Conversation Header */}
              <div className="flex items-center gap-3 border-b border-neutral-200 bg-neutral-50 p-3">
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="rounded-lg p-1 transition-colors hover:bg-neutral-200"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white">
                  {(selectedConversation?.display_name || "U")[0].toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="truncate font-semibold text-neutral-900">
                    {selectedConversation?.display_name || "Anonymous Chef"}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                    No messages yet
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.sender_id === userId
                            ? "bg-emerald-600 text-white"
                            : "bg-neutral-100 text-neutral-900"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`mt-1 text-xs ${
                            msg.sender_id === userId
                              ? "text-emerald-100"
                              : "text-neutral-500"
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSend} className="border-t border-neutral-200 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
