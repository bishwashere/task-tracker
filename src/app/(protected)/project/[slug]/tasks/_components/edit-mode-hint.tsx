"use client";

import { SettingsIcon } from "lucide-react";

type Props = {
  variant?: "compact" | "steps";
  showAiHint?: boolean;
  onEnableEdit?: () => void;
};

export function EditModeHint({
  variant = "compact",
  showAiHint = false,
  onEnableEdit,
}: Props) {
  if (variant === "compact") {
    return (
      <p className="text-sm text-muted-foreground text-center sm:text-left">
        <SettingsIcon
          className="inline size-4 align-text-bottom mr-1"
          aria-hidden
        />
        Admins can add or edit tasks from the{" "}
        <span className="font-medium text-gray-800">gear menu</span> (top right)
        and tap <span className="font-medium text-gray-800">Edit</span>.
      </p>
    );
  }

  return (
    <div className="mt-10 flex flex-col items-center gap-4 rounded-lg border border-dashed border-gray-300 bg-gray-50/80 px-6 py-10 text-center max-w-lg mx-auto">
      <p className="text-lg font-semibold text-gray-900">No tasks yet</p>
      <div className="text-sm text-muted-foreground leading-relaxed text-left w-full space-y-3">
        <p>Admins can add and manage tasks:</p>
        <ol className="list-decimal list-inside space-y-2 pl-1">
          <li>
            Tap the{" "}
            <span className="inline-flex items-center gap-1 font-medium text-gray-800">
              <SettingsIcon className="size-4" aria-hidden />
              gear
            </span>{" "}
            in the top-right corner
          </li>
          <li>
            Choose <span className="font-medium text-gray-800">Edit</span>
          </li>
          <li>
            Click <span className="font-medium text-gray-800">Add task</span>{" "}
            above this list
          </li>
        </ol>
        {showAiHint && (
          <p className="pt-1 border-t border-gray-200">
            If you see task suggestions above, you can accept one with ✓—you
            still use the gear → Edit flow to add more tasks later.
          </p>
        )}
      </div>
      {onEnableEdit && (
        <button
          type="button"
          onClick={onEnableEdit}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2"
        >
          Turn on Edit now
        </button>
      )}
    </div>
  );
}
