import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "../i18n";

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const t = useI18n();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onCancel();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in"
    >
      <div className="bg-bg-secondary border border-white/[0.08] rounded-xl w-full max-w-sm mx-4 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] animate-modal-in">
        <div className="px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-danger/10 shrink-0">
              <AlertTriangle size={18} className="text-danger" />
            </div>
            <p className="text-sm text-text-primary leading-relaxed pt-1.5">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 pb-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-bg-hover active:scale-[0.98] transition-all duration-200"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-danger text-white hover:bg-danger/90 active:scale-[0.97] transition-all duration-200 shadow-[0_0_0_1px_rgba(239,68,68,0.5),0_2px_8px_rgba(239,68,68,0.25)]"
          >
            {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
