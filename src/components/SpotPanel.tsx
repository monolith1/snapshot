import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  open: boolean;
  isDesktop: boolean;
  onClose: () => void;
  /** Changing this resets scroll to top (e.g. spot id). */
  contentKey?: string;
  /** Show a dimmed backdrop that closes on tap (used over the list view). */
  backdrop?: boolean;
  children: ReactNode;
}

export const PANEL_WIDTH = 440;
const ANIM_MS = 380;

/**
 * Responsive container for spot details:
 *  - mobile: bottom sheet (swipe down on the handle area to dismiss)
 *  - desktop: floating side panel on the right
 * Keeps children mounted during the exit animation.
 */
export default function SpotPanel({
  open,
  isDesktop,
  onClose,
  contentKey,
  backdrop = false,
  children,
}: Props) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [rendered, setRendered] = useState<ReactNode>(children);
  const [dragY, setDragY] = useState(0);
  const dragStart = useRef<number | null>(null);
  const dragStartX = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep last content visible while closing.
  useEffect(() => {
    if (open) setRendered(children);
  }, [open, children]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), ANIM_MS);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [contentKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  // ---- swipe-to-dismiss (mobile) ----
  const onTouchStart = (e: React.TouchEvent) => {
    // Only start a drag when content is scrolled to the top.
    if ((scrollRef.current?.scrollTop ?? 0) > 0) return;
    dragStart.current = e.touches[0].clientY;
    dragStartX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStart.current === null) return;
    const dy = e.touches[0].clientY - dragStart.current;
    const dx = e.touches[0].clientX - dragStartX.current;
    // Horizontal gesture (photo carousel) — not a dismiss.
    if (dragY === 0 && Math.abs(dx) > Math.abs(dy)) {
      dragStart.current = null;
      return;
    }
    setDragY(Math.max(0, dy));
  };
  const onTouchEnd = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    if (dragY > 110) onClose();
    setDragY(0);
  };

  const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';

  if (isDesktop) {
    return (
      <>
        {backdrop && (
          <div
            className="fixed inset-0 z-30 bg-black/50 transition-opacity"
            style={{ opacity: shown ? 1 : 0, transitionDuration: `${ANIM_MS}ms` }}
            onClick={onClose}
          />
        )}
        <aside
          role="dialog"
          aria-modal="false"
          className="fixed bottom-4 right-4 top-4 z-40 overflow-hidden rounded-2xl border border-white/10 bg-ink-2/95 shadow-2xl shadow-black/60 backdrop-blur-xl"
          style={{
            width: PANEL_WIDTH,
            transform: shown ? 'translateX(0)' : `translateX(${PANEL_WIDTH + 32}px)`,
            opacity: shown ? 1 : 0,
            transition: `transform ${ANIM_MS}ms ${easing}, opacity ${ANIM_MS}ms ease`,
          }}
        >
          <div ref={scrollRef} className="no-scrollbar h-full overflow-y-auto overscroll-contain">
            {open ? children : rendered}
          </div>
        </aside>
      </>
    );
  }

  return (
    <>
      {backdrop && (
        <div
          className="fixed inset-0 z-30 bg-black/60 transition-opacity"
          style={{ opacity: shown ? 1 : 0, transitionDuration: `${ANIM_MS}ms` }}
          onClick={onClose}
        />
      )}
      <section
        role="dialog"
        aria-modal="false"
        className="fixed inset-x-0 bottom-0 z-40 flex max-h-[62dvh] flex-col overflow-hidden rounded-t-[1.75rem] border-t border-white/10 bg-ink-2 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]"
        style={{
          transform: shown ? `translateY(${dragY}px)` : 'translateY(100%)',
          transition: dragStart.current !== null ? 'none' : `transform ${ANIM_MS}ms ${easing}`,
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-2">
          <span className="h-1 w-10 rounded-full bg-white/50 shadow" />
        </div>
        <div ref={scrollRef} className="pb-safe no-scrollbar overflow-y-auto overscroll-contain">
          {open ? children : rendered}
        </div>
      </section>
    </>
  );
}
