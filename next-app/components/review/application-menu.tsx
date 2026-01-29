"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Trash2, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  const [showDemoInfo, setShowDemoInfo] = useState(false);
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
          <DropdownMenuItem onSelect={() => setShowDemoInfo(true)}>
            <Info className="size-4" />
            Demo data note
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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

      <AlertDialog open={showDemoInfo} onOpenChange={setShowDemoInfo}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-treasury-info-lightest">
              <Info className="text-treasury-info" />
            </AlertDialogMedia>
            <AlertDialogTitle>Demo Data Note</AlertDialogTitle>
            <AlertDialogDescription>
              Alcohol Content and Net Contents are mocked from label OCR for
              this dataset. A small number of values are intentionally perturbed
              to create reviewable mismatches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction variant="primary" onClick={() => setShowDemoInfo(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
