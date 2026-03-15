import { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export interface ToastData {
  id: number;
  type: "success" | "error";
  message: string;
}

let nextId = 0;
export function createToast(
  type: ToastData["type"],
  message: string,
): ToastData {
  return { id: ++nextId, type, message };
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: number) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isError = toast.type === "error";

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md animate-toast-in ${
        isError
          ? "bg-danger/10 border-danger/25 text-danger"
          : "bg-green-500/10 border-green-500/25 text-green-400"
      }`}
    >
      {isError ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
      <span className="text-sm flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 rounded hover:bg-white/10 transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
