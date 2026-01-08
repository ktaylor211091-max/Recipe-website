"use client";

import { useState, useTransition } from "react";

type Review = {
  id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  profiles?: {
    id: string;
  };
};

type Props = {
  recipeId: string;
  reviews: Review[];
  averageRating: number;
  userReview: Review | null;
  isAuthenticated: boolean;
};

export function RecipeReviews({
  recipeId,
  reviews,
  averageRating,
  userReview,
  isAuthenticated,
}: Props) {
  const [rating, setRating] = useState(userReview?.rating || 0);
  const [reviewText, setReviewText] = useState(userReview?.review_text || "");
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localReviews] = useState(reviews);
  const [localAverage] = useState(averageRating);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/reviews", {
          method: userReview ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipeId,
            rating,
            reviewText: reviewText.trim() || null,
          }),
        });

        if (response.ok) {
          window.location.reload();
        } else {
          const data = await response.json();
          alert(data.error || "Failed to submit review");
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        alert("Failed to submit review");
      }
    });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your review?")) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/reviews", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipeId }),
        });

        if (response.ok) {
          window.location.reload();
        } else {
          const data = await response.json();
          alert(data.error || "Failed to delete review");
        }
      } catch (error) {
        console.error("Error deleting review:", error);
        alert("Failed to delete review");
      }
    });
  };

  const renderStars = (count: number, interactive: boolean = false, size: string = "h-5 w-5") => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
          >
            <svg
              className={`${size} ${
                star <= count
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-none text-neutral-300"
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">
          Ratings & Reviews
        </h2>

        {/* Average Rating Display */}
        <div className="flex items-center gap-6 p-4 rounded-lg bg-neutral-50">
          <div className="text-center">
            <div className="text-4xl font-bold text-neutral-900">
              {localAverage > 0 ? localAverage.toFixed(1) : "—"}
            </div>
            <div className="mt-2">{renderStars(Math.round(localAverage))}</div>
            <div className="mt-1 text-sm text-neutral-500">
              {localReviews.length} {localReviews.length === 1 ? "review" : "reviews"}
            </div>
          </div>

          {/* Rating Distribution */}
          {localReviews.length > 0 && (
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = localReviews.filter((r) => r.rating === star).length;
                const percentage = (count / localReviews.length) * 100;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-12 text-neutral-600">{star} star</span>
                    <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-neutral-500 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Form */}
      {isAuthenticated ? (
        <div className="mb-6 p-4 rounded-lg border border-neutral-200 bg-neutral-50">
          {!showForm && !userReview ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              Write a Review
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Your Rating {userReview && "(Edit)"}
                </label>
                {renderStars(rating, true, "h-8 w-8")}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Your Review (optional)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Share your experience with this recipe..."
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <div className="mt-1 text-xs text-neutral-500">
                  {reviewText.length}/1000 characters
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isPending ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
                </button>
                {userReview && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
                {showForm && !userReview && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setRating(0);
                      setReviewText("");
                    }}
                    className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-lg border border-neutral-200 bg-neutral-50 text-center">
          <p className="text-sm text-neutral-600">
            <a href="/login" className="font-medium text-emerald-600 hover:underline">
              Sign in
            </a>{" "}
            to leave a review
          </p>
        </div>
      )}

      {/* Reviews List */}
      {localReviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-neutral-900">All Reviews</h3>
          {localReviews.map((review) => (
            <div
              key={review.id}
              className="p-4 rounded-lg border border-neutral-200 bg-white"
            >
              <div className="flex items-center justify-between mb-2">
                {renderStars(review.rating)}
                <span className="text-xs text-neutral-500">
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              {review.review_text && (
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {review.review_text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
