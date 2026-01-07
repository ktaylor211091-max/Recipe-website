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

type MessagesListProps = {
  conversations: Conversation[];
  currentUserId: string;
  preselectedUserId: string | null;
};

export function MessagesList({ conversations, currentUserId, preselectedUserId }: MessagesListProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    preselectedUserId || conversations[0]?.userId || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!selectedUserId) return;

    loadMessages();
    markAsRead();

    // Subscribe to new messages (both sent and received)
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // If this message is part of the current conversation
          if (
            (newMsg.sender_id === currentUserId && newMsg.recipient_id === selectedUserId) ||
            (newMsg.sender_id === selectedUserId && newMsg.recipient_id === currentUserId)
          ) {
            setMessages((prev) => [...prev, newMsg]);
            if (newMsg.sender_id === selectedUserId) {
              markAsRead();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUserId, currentUserId]);

  const loadMessages = async () => {
    if (!selectedUserId) return;

    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},recipient_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const markAsRead = async () => {
    if (!selectedUserId) return;

    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("recipient_id", currentUserId)
      .eq("sender_id", selectedUserId)
      .eq("is_read", false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId || loading) return;

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUserId,
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

  const selectedConversation = conversations.find((c) => c.userId === selectedUserId);

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">No conversations yet</h2>
        <p className="text-neutral-600 mb-6">
          Visit user profiles and send them a message to start a conversation
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-500"
        >
          Explore Recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Conversations List */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm lg:col-span-1">
        <h2 className="mb-4 px-2 text-sm font-bold uppercase tracking-wide text-neutral-500">
          Conversations
        </h2>
        <div className="space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.userId}
              onClick={() => setSelectedUserId(conv.userId)}
              className={`w-full rounded-xl p-3 text-left transition-colors ${
                selectedUserId === conv.userId
                  ? "bg-emerald-100 border-2 border-emerald-600"
                  : "hover:bg-neutral-50 border-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-bold text-white">
                  {(conv.display_name || "U")[0].toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-semibold text-neutral-900 truncate">
                    {conv.display_name || "Anonymous Chef"}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message Thread */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm lg:col-span-2">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="border-b border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white">
                  {(selectedConversation.display_name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-neutral-900">
                    {selectedConversation.display_name || "Anonymous Chef"}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-neutral-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isSent = msg.sender_id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          isSent
                            ? "bg-emerald-600 text-white"
                            : "bg-neutral-100 text-neutral-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <div
                          className={`mt-1 text-xs ${
                            isSent ? "text-emerald-100" : "text-neutral-500"
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-neutral-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || loading}
                  className="rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : null}
      </div>
    </div>
  );
}
