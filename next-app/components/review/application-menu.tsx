"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteApplication } from "@/lib/actions/admin";

type ApplicationMenuProps = {
  applicationId: string;
  colaId?: string;
};

export function ApplicationMenu({ applicationId, colaId }: ApplicationMenuProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteApplication(applicationId);
      if (result.success) {
        toast.success("Application deleted");
        router.push("/queue");
      } else {
        toast.error("Delete failed", { description: result.error });
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreVertical className="size-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="size-4" />
            Delete application
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-treasury-error-lightest">
              <AlertTriangle className="text-treasury-error" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete application{" "}
              <strong>{colaId ?? applicationId}</strong> and all associated
              images, OCR results, comparisons, and reviews.
              <br /><br />
              <strong>This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} variant="base">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="warning"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
