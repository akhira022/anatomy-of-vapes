"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { Brain, HeartPulse, Smile, Wind } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { BeforeAfterCompare } from "@/components/impact/BeforeAfterCompare";
import { OrganProgressDots } from "@/components/impact/OrganProgressDots";
import { Button } from "@/components/ui/button";
import {
  bodyOrganImpacts,
  type BodyOrgan,
} from "@/data/body-impact";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: "-10%" } as const;
const LG_QUERY = "(min-width: 1024px)";

const icons = {
  brain: Brain,
  oral: Smile,
  lungs: Wind,
  heart: HeartPulse,
} as const;

function useIsLg() {
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(LG_QUERY);
    const sync = () => setIsLg(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isLg;
}

export function ImpactLandingPreview() {
  const reduceMotion = useReducedMotion();
  const isLg = useIsLg();
  const [activeOrgan, setActiveOrgan] = useState<BodyOrgan>(
    bodyOrganImpacts[0]?.organ ?? "brain"
  );
  const [compareSide, setCompareSide] = useState<"before" | "after">("after");
  const cardRefs = useRef<Partial<Record<BodyOrgan, HTMLElement | null>>>({});
  const skipSpyUntil = useRef(0);

  const activeItem =
    bodyOrganImpacts.find((item) => item.organ === activeOrgan) ??
    bodyOrganImpacts[0];

  const selectOrgan = useCallback(
    (organ: BodyOrgan, options?: { scroll?: boolean }) => {
      setActiveOrgan(organ);
      if (!options?.scroll) return;

      const el = cardRefs.current[organ];
      if (!el) return;

      skipSpyUntil.current = Date.now() + 700;
      el.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "nearest",
      });
    },
    [reduceMotion]
  );

  // Mobile: scroll spy picks the card nearest a focus line (~35% viewport).
  // Desktop lg+: all four cards are visible — do not flicker from spy.
  useEffect(() => {
    if (isLg) return;
    if (typeof IntersectionObserver === "undefined") return;

    const elements = bodyOrganImpacts
      .map((item) => cardRefs.current[item.organ])
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const ratios = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target, entry.intersectionRatio);
        }
        if (Date.now() < skipSpyUntil.current) return;

        const focusY = window.innerHeight * 0.35;
        let bestOrgan: BodyOrgan | null = null;
        let bestDistance = Number.POSITIVE_INFINITY;

        for (const item of bodyOrganImpacts) {
          const el = cardRefs.current[item.organ];
          if (!el) continue;
          const ratio = ratios.get(el) ?? 0;
          if (ratio <= 0) continue;
          const rect = el.getBoundingClientRect();
          const mid = (rect.top + rect.bottom) / 2;
          const distance = Math.abs(mid - focusY);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestOrgan = item.organ;
          }
        }

        if (bestOrgan) setActiveOrgan(bestOrgan);
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: "-10% 0px -40% 0px",
      }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [isLg]);

  const onCardKeyDown = (
    event: KeyboardEvent<HTMLAnchorElement>,
    organ: BodyOrgan
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    setActiveOrgan(organ);
  };

  return (
    <section
      id="body-impact"
      aria-labelledby="impact-preview-heading"
      className="border-t border-border bg-surface px-4 py-16 sm:px-6 sm:py-24 xl:py-28"
    >
      <div className="mx-auto max-w-5xl xl:max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.4, ease: EASE_OUT }
          }
        >
          <h2
            id="impact-preview-heading"
            className="max-w-3xl font-heading text-3xl font-bold tracking-tight text-textPrimary sm:text-4xl xl:text-5xl xl:leading-[1.1]"
          >
            ร่างกายเปลี่ยนไปอย่างไรเมื่อสูบ
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-textSecondary sm:text-base">
            เทียบก่อนและหลังสูบใน 4 ระบบ แล้วเปิดร่างเต็มเพื่อดูจุดอื่นต่อ
          </p>
        </motion.div>

        <div className="sticky top-3 z-20 mt-8 sm:top-4">
          <OrganProgressDots
            items={bodyOrganImpacts.map((item) => ({
              organ: item.organ,
              shortTitle: item.shortTitle,
            }))}
            activeOrgan={activeOrgan}
            onSelect={(organ) =>
              selectOrgan(organ, { scroll: !isLg })
            }
          />
        </div>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-4">
          {bodyOrganImpacts.map((item, index) => {
            const Icon = icons[item.organ];
            const active = item.organ === activeOrgan;
            return (
              <motion.li
                key={item.id}
                ref={(node) => {
                  cardRefs.current[item.organ] = node;
                }}
                data-organ={item.organ}
                className="scroll-mt-24"
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        delay: Math.min(index * 0.08, 0.24),
                        duration: 0.4,
                        ease: EASE_OUT,
                      }
                }
              >
                <Link
                  href={`/impact?organ=${item.organ}`}
                  aria-current={active ? "true" : undefined}
                  onMouseEnter={() => {
                    if (isLg) setActiveOrgan(item.organ);
                  }}
                  onFocus={() => setActiveOrgan(item.organ)}
                  onKeyDown={(event) => onCardKeyDown(event, item.organ)}
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-left outline-none",
                    "transition-[border-color,transform,box-shadow] duration-normal",
                    "hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-glow-red",
                    "focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:translate-y-0",
                    active
                      ? "border-primary/70 shadow-glow-red"
                      : "border-border"
                  )}
                >
                  <div className="flex items-start justify-between bg-surface-2 px-5 py-4">
                    <span className="font-heading text-4xl font-bold leading-none text-textPrimary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon
                      aria-hidden="true"
                      className="size-10 text-primary transition-transform duration-normal group-hover:scale-105"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 border-t border-border px-5 py-4">
                    <h3 className="font-heading text-base font-semibold text-textPrimary">
                      {item.title}
                    </h3>
                    <span className="w-fit rounded-full bg-textPrimary px-3 py-1 text-xs font-semibold text-background">
                      {item.badge}
                    </span>
                    <span className="mt-auto text-sm font-medium text-primary">
                      ดูรายละเอียด →
                    </span>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>

        {activeItem ? (
          <motion.div
            key={activeItem.organ}
            className="mt-8"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.35, ease: EASE_OUT }
            }
          >
            <p className="mb-3 text-sm font-semibold text-textSecondary">
              ตัวอย่าง {activeItem.shortTitle}
            </p>
            <BeforeAfterCompare
              beforeLabel={activeItem.beforeLabel}
              afterLabel={activeItem.afterLabel}
              beforeText={activeItem.beforeText}
              afterText={activeItem.afterText}
              activeSide={compareSide}
              onSideChange={setCompareSide}
            />
          </motion.div>
        ) : null}

        <div className="mt-8">
          <Button
            render={<Link href="/impact" />}
            nativeButton={false}
            size="touch"
          >
            ดูผลต่อร่างกายทั้งร่าง
          </Button>
        </div>
      </div>
    </section>
  );
}
