"use client";

import { resolveValue, ToastBar, Toaster, toast, type Toast } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function CenteredMessageDialog({ t }: { t: Toast }) {
  const message = resolveValue(t.message, t);
  const title = t.type === "error" ? "Warning" : "Notice";

  return (
    <AlertDialog
      open={t.visible}
      onOpenChange={(open) => {
        if (!open) toast.dismiss(t.id);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {message && (
            <AlertDialogDescription className="text-base text-foreground">
              {message}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => toast.dismiss(t.id)}>
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        error: {
          duration: 1000 * 60 * 60,
        },
        blank: {
          duration: 1000 * 60 * 60,
        },
      }}
    >
      {(t) =>
        t.type === "error" || t.type === "blank" ? (
          <CenteredMessageDialog t={t} />
        ) : (
          <ToastBar toast={t} />
        )
      }
    </Toaster>
  );
}
