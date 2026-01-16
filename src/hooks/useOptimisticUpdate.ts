"use client";

import { useState } from "react";

interface OptimisticState<T> {
  data: T;
  isPending: boolean;
  error: Error | null;
}

interface OptimisticUpdateResult<T> {
  data: T;
  update: (newData: T) => Promise<void>;
  reset: () => void;
  isPending: boolean;
  error: Error | null;
}

/**
 * Hook for optimistic UI updates with automatic rollback on error
 * Updates the UI immediately while the API request is in flight
 * 
 * @param initialData Initial data state
 * @param updateFn Async function that performs the actual update
 * @returns Object with current data, update function, reset function, and state flags
 * 
 * @example
 * const { data, update, isPending } = useOptimisticUpdate(
 *   initialRecipe,
 *   async (updated) => {
 *     const response = await updateRecipe(updated);
 *     return response.data;
 *   }
 * );
 * 
 * // UI updates immediately, rolls back if API fails
 * await update({ ...data, title: "New Title" });
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T) => Promise<T>
): OptimisticUpdateResult<T> {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isPending: false,
    error: null,
  });

  const update = async (newData: T): Promise<void> => {
    // Store previous data for rollback
    const previousData = state.data;

    // Optimistically update UI
    setState({
      data: newData,
      isPending: true,
      error: null,
    });

    try {
      // Perform actual update
      const result = await updateFn(newData);
      
      // Update with server response
      setState({
        data: result,
        isPending: false,
        error: null,
      });
    } catch (err) {
      // Rollback on error
      setState({
        data: previousData,
        isPending: false,
        error: err as Error,
      });
      
      throw err; // Re-throw so caller can handle
    }
  };

  const reset = () => {
    setState({
      data: initialData,
      isPending: false,
      error: null,
    });
  };

  return {
    data: state.data,
    update,
    reset,
    isPending: state.isPending,
    error: state.error,
  };
}
