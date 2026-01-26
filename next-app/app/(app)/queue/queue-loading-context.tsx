"use client";

import * as React from "react";

interface QueueLoadingContextValue {
  isLoading: boolean;
  startTransition: React.TransitionStartFunction;
}

const QueueLoadingContext = React.createContext<QueueLoadingContextValue | null>(null);

export function QueueLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, startTransition] = React.useTransition();

  return (
    <QueueLoadingContext.Provider value={{ isLoading, startTransition }}>
      {children}
    </QueueLoadingContext.Provider>
  );
}

export function useQueueLoading() {
  const context = React.useContext(QueueLoadingContext);
  if (!context) {
    throw new Error("useQueueLoading must be used within a QueueLoadingProvider");
  }
  return context;
}
