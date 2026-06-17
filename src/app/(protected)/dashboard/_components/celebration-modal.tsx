"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type CelebrationType = "14d" | "3d";

type Props = {
  subtasks14d: number;
  subtasks3d: number;
  userId: string;
};

const STORAGE_KEY_14D = (userId: string) => `celebration_14d_v1_${userId}`;
const STORAGE_KEY_3D_LAST_SHOWN = (userId: string) =>
  `celebration_3d_v1_last_shown_${userId}`;

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

function shouldShow14d(userId: string, count: number): boolean {
  if (count === 0) return false;
  try {
    return !localStorage.getItem(STORAGE_KEY_14D(userId));
  } catch {
    return false;
  }
}

function shouldShow3d(userId: string, count: number): boolean {
  if (count === 0) return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_3D_LAST_SHOWN(userId));
    if (!raw) return true;
    return Date.now() - parseInt(raw, 10) >= THREE_DAYS_MS;
  } catch {
    return false;
  }
}

const CelebrationModal = ({ subtasks14d, subtasks3d, userId }: Props) => {
  const [type, setType] = useState<CelebrationType | null>(null);

  useEffect(() => {
    if (!userId) return;
    if (shouldShow14d(userId, subtasks14d)) {
      setType("14d");
    } else if (shouldShow3d(userId, subtasks3d)) {
      setType("3d");
    }
  }, [userId, subtasks14d, subtasks3d]);

  const dismiss = () => {
    if (!userId || !type) return;
    try {
      if (type === "14d") {
        localStorage.setItem(STORAGE_KEY_14D(userId), "true");
      } else {
        localStorage.setItem(
          STORAGE_KEY_3D_LAST_SHOWN(userId),
          String(Date.now()),
        );
      }
    } catch {
      // ignore storage errors
    }
    setType(null);
  };

  const count = type === "14d" ? subtasks14d : subtasks3d;
  const windowLabel = type === "14d" ? "14 days" : "3 days";

  return (
    <Dialog open={!!type} onOpenChange={(open) => { if (!open) dismiss(); }}>
      <DialogContent className="max-w-sm text-center py-10 px-8">
        <div className="text-6xl mb-2 select-none">🎉</div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Congratulations!
        </h2>

        <p className="text-gray-500 text-sm mb-4">
          In the last {windowLabel} you closed
        </p>

        <div className="my-2">
          <span className="text-6xl font-extrabold text-green-600 leading-none">
            {count}
          </span>
          <p className="text-gray-500 text-sm mt-1">
            {count === 1 ? "subtask" : "subtasks"}
          </p>
        </div>

        <p className="text-gray-400 text-xs mt-4 mb-6">
          {type === "3d"
            ? "We'll check in again in 3 days."
            : "Keep the momentum going!"}
        </p>

        <Button
          onClick={dismiss}
          className="w-full bg-green-500 hover:bg-green-600 text-white text-base py-5"
        >
          Awesome, thanks! 🙌
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CelebrationModal;
