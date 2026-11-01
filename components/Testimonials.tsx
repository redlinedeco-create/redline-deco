"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Quote,
  ArrowRight,
  UserRound,
  Star,
  PenLine,
  X,
  CheckCircle2,
  Loader2,
  Lock,
} from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types";

export function ReviewModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t, dir } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [project, setProject] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t("testimonials.nameLabel") + " is required.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 6) {
      setError(t("testimonials.phoneLabel") + " is required.");
      return;
    }
    if (!review.trim() || review.trim().length < 5) {
      setError(t("testimonials.reviewLabel") + " is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          project: project.trim() || undefined,
          review: review.trim(),
          rating,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit testimonial.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName("");
    setPhone("");
    setProject("");
    setReview("");
    setRating(5);
    setHoverRating(0);
    setError(null);
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleReset}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir={dir}
      >
        <button
          type="button"
          onClick={handleReset}
          className="absolute top-4 end-4 h-9 w-9 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground grid place-items-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
          aria-label={t("testimonials.close") || "Close"}
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-green-500/10 text-green-600 dark:text-green-400 grid place-items-center">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              {t("testimonials.successTitle") || "Thank You!"}
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
              {t("testimonials.successMessage") ||
                "Your testimonial has been submitted. It will appear on our website after review."}
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-md bg-brand-red px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-600 transition-colors"
              >
                {t("testimonials.close") || "Close"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                {t("testimonials.modalTitle") || "Share Your Experience"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("testimonials.modalSubtitle") ||
                  "We appreciate your honest feedback on our work."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  {t("testimonials.nameLabel") || "Your Name"}{" "}
                  <span className="text-brand-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("testimonials.namePlaceholder") || "Houari B."}
                  className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    {t("testimonials.phoneLabel") || "Phone Number"}{" "}
                    <span className="text-brand-red">*</span>
                  </label>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                    <Lock className="h-3 w-3" />
                    <span>Private</span>
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("testimonials.phonePlaceholder") || "06 XX XX XX XX"}
                  dir="ltr"
                  className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red transition-colors"
                />
                <p className="mt-1 text-xs text-muted-foreground leading-normal flex items-start gap-1">
                  <span>
                    {t("testimonials.phoneHint") ||
                      "Used only to confirm your project with us. Will never be published on the website."}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  {t("testimonials.projectLabel") || "Project Type / Location (Optional)"}
                </label>
                <input
                  type="text"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder={
                    t("testimonials.projectPlaceholder") || "e.g. False ceiling - Sebdou"
                  }
                  className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  {t("testimonials.ratingLabel") || "Rating"}
                </label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded hover:scale-110 transition-transform focus:outline-none text-amber-400"
                      aria-label={`${star} star`}
                    >
                      <Star
                        className="h-6 w-6"
                        fill={
                          star <= (hoverRating || rating) ? "currentColor" : "none"
                        }
                      />
                    </button>
                  ))}
                  <span className="text-xs text-muted-foreground ms-2">
                    {rating} / 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  {t("testimonials.reviewLabel") || "Your Testimonial"}{" "}
                  <span className="text-brand-red">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder={
                    t("testimonials.reviewPlaceholder") ||
                    "Tell us about the work quality, punctuality, finishing..."
                  }
                  className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red transition-colors resize-y"
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  {t("testimonials.close") || "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-md bg-brand-red px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-red-600 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>
                    {loading
                      ? t("testimonials.submitting") || "Submitting..."
                      : t("testimonials.submit") || "Submit Review"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export function TestimonialsSection({
  testimonials: items,
}: {
  testimonials?: Testimonial[];
}) {
  const { t, language } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  if (!items) return null;

  return (
    <section className="section-padding bg-muted/40 relative">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <p className="text-brand-red font-semibold uppercase tracking-[0.2em] text-xs sm:text-sm mb-2">
              {t("testimonials.title")}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-balance">
              {t("testimonials.subtitle")}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 self-start sm:self-auto rounded-lg border border-brand-red/30 bg-background px-4 py-2.5 text-sm font-semibold text-brand-red shadow-sm hover:bg-brand-red hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
          >
            <PenLine className="h-4 w-4" />
            <span>{t("testimonials.addReview") || "Leave a Review"}</span>
          </button>
        </div>

        <div className="stack-mobile grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((tst) => {
            const review = tst.review[language] ?? tst.review.en;
            return (
              <figure
                key={tst.id}
                className="relative rounded-2xl border border-border bg-card p-6 sm:p-7 flex flex-col justify-between"
              >
                <Quote className="absolute top-5 end-5 h-7 w-7 text-brand-red/20" />
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-muted border border-border grid place-items-center text-muted-foreground shrink-0">
                      <UserRound className="h-6 w-6" />
                    </div>
                    <div>
                      <figcaption className="font-semibold text-foreground">
                        {tst.isPlaceholder ? "—" : tst.name}
                      </figcaption>
                      <p className="text-xs text-muted-foreground">
                        {tst.project ?? "—"}
                      </p>
                    </div>
                  </div>

                  {tst.rating && (
                    <div className="flex items-center gap-1 mb-3 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-3.5 w-3.5"
                          fill={i < tst.rating! ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  )}

                  <blockquote className="text-sm sm:text-base leading-relaxed text-muted-foreground italic">
                    &ldquo;
                    {tst.isPlaceholder ? t("testimonials.placeholder") : review}
                    &rdquo;
                  </blockquote>
                </div>

                {tst.date && (
                  <div className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground/80">
                    {tst.date}
                  </div>
                )}
              </figure>
            );
          })}
        </div>
      </div>

      <ReviewModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}

export function CTASection() {
  const { t, dir } = useLanguage();
  return (
    <section className="relative overflow-hidden section-padding">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-red-700 via-brand-red to-brand-red-600" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
      <div className="container max-w-5xl relative mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-balance">
          {t("cta.title")}
        </h2>
        <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          {t("cta.subtitle")}
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-md bg-white text-brand-red px-8 py-4 text-base font-bold shadow-2xl hover:bg-white/95 hover:-translate-y-0.5 transition-all"
        >
          {t("cta.button")}
          <ArrowRight className={cn("h-5 w-5", dir === "rtl" && "scale-x-[-1]")} />
        </Link>
      </div>
    </section>
  );
}
