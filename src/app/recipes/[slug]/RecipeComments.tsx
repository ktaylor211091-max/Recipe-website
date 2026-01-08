"use client";

import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createNotification } from "@/lib/notifications";

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_comment_id: string | null;
  profiles: {
    display_name: string | null;
  } | null;
};

type RecipeCommentsProps = {
  recipeId: string;
  comments: Comment[];
  currentUserId: string | null;
  recipeAuthorId: string;
  recipeName: string;
};

export function RecipeComments({ recipeId, comments, currentUserId, recipeAuthorId, recipeName }: RecipeCommentsProps) {
  const [commentText, setCommentText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [localComments, setLocalComments] = useState(comments);

  // Group comments by parent
  const topLevelComments = localComments.filter((c) => !c.parent_comment_id);
  const getReplies = (commentId: string) =>
    localComments.filter((c) => c.parent_comment_id === commentId);

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUserId) return;

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      
      const { data, error } = await supabase
        .from("recipe_comments")
        .insert({
          recipe_id: recipeId,
          user_id: currentUserId,
          content: commentText.trim(),
          parent_comment_id: parentId,
        })
        .select(`
          id,
          user_id,
          content,
          created_at,
          parent_comment_id,
          profiles (display_name)
        `)
        .single();

      if (!error && data) {
        // Transform to match Comment type
        const newComment: Comment = {
          ...data,
          profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
        };
        setLocalComments([newComment, ...localComments]);
        setCommentText("");

        // Create activity for commenting (only for top-level comments)
        if (!parentId) {
          await supabase.from("activities").insert({
            user_id: currentUserId,
            activity_type: "comment_posted",
            recipe_id: recipeId,
          });
        }

        // Notify recipe author (if not commenting on own recipe)
        if (currentUserId !== recipeAuthorId) {
          await createNotification({
            userId: recipeAuthorId,
            type: "comment",
            message: `Someone commented on your recipe "${recipeName}"`,
            fromUserId: currentUserId,
            recipeId: recipeId,
            commentId: data.id,
          });
        }

        // If it's a reply, notify the parent comment author
        if (parentId) {
          const parentComment = localComments.find((c) => c.id === parentId);
          if (parentComment && parentComment.user_id !== currentUserId) {
            await createNotification({
              userId: parentComment.user_id,
              type: "mention",
              message: `Someone replied to your comment on "${recipeName}"`,
              fromUserId: currentUserId,
              recipeId: recipeId,
              commentId: data.id,
            });
          }
        }
      }
    });
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("recipe_comments")
        .delete()
        .eq("id", commentId);

      if (!error) {
        setLocalComments(localComments.filter((c) => c.id !== commentId && c.parent_comment_id !== commentId));
      }
    });
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isOwner = currentUserId === comment.user_id;
    const replies = getReplies(comment.id);
    const [showReplyForm, setShowReplyForm] = useState(false);

    return (
      <div className={`${isReply ? "ml-12" : ""}`}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white">
            {(comment.profiles?.display_name || "U")[0].toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-neutral-900">
                  {comment.profiles?.display_name || "Anonymous Chef"}
                </span>
                <span className="text-xs text-neutral-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-2 flex items-center gap-4 text-sm">
              {currentUserId && !isReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-neutral-600 hover:text-emerald-600 font-medium"
                >
                  Reply
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={isPending}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              )}
            </div>

            {/* Reply Form */}
            {showReplyForm && currentUserId && (
              <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={3}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isPending}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyForm(false);
                      setCommentText("");
                    }}
                    className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Replies */}
            {replies.length > 0 && (
              <div className="mt-4 space-y-4">
                {replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold text-neutral-900">
        Comments ({localComments.length})
      </h2>

      {/* Comment Form */}
      {currentUserId ? (
        <form onSubmit={(e) => handleSubmit(e)} className="mb-8">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts about this recipe..."
            rows={4}
            className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={!commentText.trim() || isPending}
              className="rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              {isPending ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 p-6 text-center">
          <p className="text-neutral-600">
            <a href="/login" className="font-semibold text-emerald-600 hover:underline">
              Sign in
            </a>{" "}
            to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {topLevelComments.length === 0 ? (
        <div className="py-12 text-center text-neutral-500">
          <div className="text-5xl mb-4">💬</div>
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {topLevelComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
