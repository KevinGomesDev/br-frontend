// contexts/FeedbackContext.tsx
import { createContext, useContext, useState } from "react";

type FeedbackType = "success" | "error";

type Feedback = {
  message: string;
  type: FeedbackType;
};

interface FeedbackContextType {
  feedback: Feedback | null;
  setFeedback: (fb: Feedback | null) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(
  undefined
);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  return (
    <FeedbackContext.Provider value={{ feedback, setFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context)
    throw new Error("useFeedback must be used inside FeedbackProvider");
  return context;
}
