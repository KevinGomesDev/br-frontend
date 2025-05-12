import { useEffect } from "react";

interface FeedbackProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export default function Feedback({
  message,
  type = "success",
  onClose,
}: FeedbackProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg =
    type === "success"
      ? "bg-[var(--resource-positive)]"
      : "bg-[var(--button-danger)]";

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded text-[var(--button-primary-text)] shadow-lg z-50 ${bg}`}
    >
      {message}
    </div>
  );
}
