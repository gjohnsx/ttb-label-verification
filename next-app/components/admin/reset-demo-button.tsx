'use client';

import { useState, useTransition } from 'react';
import { RefreshCw, AlertTriangle, Check, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { resetDemoData } from '@/lib/actions/admin';

export function ResetDemoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [secret, setSecret] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    if (!secret.trim()) {
      toast.error('Please enter the reset secret');
      return;
    }

    startTransition(async () => {
      const result = await resetDemoData(secret);

      if (result.success) {
        toast.success(result.message, {
          description: `Deleted: ${result.deletedCounts.reviews} reviews, ${result.deletedCounts.auditEvents} audit events, ${result.deletedCounts.comparisons} comparisons, ${result.deletedCounts.ocrResults} OCR results. Reset ${result.deletedCounts.applicationsReset} applications.`,
        });
        setIsOpen(false);
        setSecret('');
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error('Reset failed', {
          description: result.error,
        });
      }
    });
  };

  const handleCancel = () => {
    setIsOpen(false);
    setSecret('');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="warning" size="default">
          <RefreshCw className="size-4" />
          Reset Demo Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-treasury-warning-lightest">
            <AlertTriangle className="text-treasury-warning" />
          </AlertDialogMedia>
          <AlertDialogTitle>Reset Demo Data</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete all reviews, audit events, comparisons,
            and OCR results. Application statuses will be reset to their initial values.
            <br />
            <br />
            <strong>This action cannot be undone.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <label htmlFor="reset-secret" className="text-sm font-medium text-treasury-ink">
            Enter reset secret to confirm
          </label>
          <Input
            id="reset-secret"
            type="password"
            placeholder="Enter secret..."
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            disabled={isPending}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleReset();
              }
            }}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isPending}>
            <X className="size-4" />
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleReset();
            }}
            disabled={isPending || !secret.trim()}
            variant="warning"
          >
            {isPending ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <Check className="size-4" />
                Reset Data
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
