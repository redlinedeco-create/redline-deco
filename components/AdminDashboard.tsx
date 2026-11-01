"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  Upload,
  FileText,
  Layers,
  PaintBucket,
  Tag,
  Loader2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  LogOut,
  Inbox,
  MessageSquare,
  Settings,
  FileType,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SectionTitle } from "./SectionTitle";
import { useLanguage } from "@/lib/providers/LanguageProvider";
import { cn } from "@/lib/utils";
import type {
  Category,
  Price,
  Project,
  ServiceItem,
  Testimonial,
} from "@/types";
import { type I18nText } from "./AdminForms";
import { AdminModal } from "./AdminModal";
import {
  AdminCategories,
  AdminPrices,
  AdminProjects,
  AdminServices,
  AdminSettings,
  AdminSiteText,
  AdminTestimonials,
  AdminUpload,
} from "@/lib/adminApi";
import {
  CategoryForm,
  PriceForm,
  ProjectForm,
  ServiceForm,
  SettingForm,
  SiteTextForm,
  TestimonialForm,
} from "./EntityForms";
import { MultiImagePicker } from "./AdminForms";
import { AdminRequests } from "./AdminRequests";
import { getBrowserAuthClient } from "@/lib/supabase/browser";

const tabs = [
  "projects",
  "categories",
  "services",
  "prices",
  "testimonials",
  "siteText",
  "settings",
  "requests",
  "uploads",
] as const;
const tabIcons: Record<(typeof tabs)[number], any> = {
  projects: FileText,
  categories: Tag,
  services: Layers,
  prices: PaintBucket,
  testimonials: MessageSquare,
  siteText: FileType,
  settings: Settings,
  requests: Inbox,
  uploads: Upload,
};

type ModalState<T> =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "edit"; entity: T }
  | { kind: "delete"; entity: T; label: string };

export function AdminDashboard({
  projects: initialProjects,
  categories: initialCategories,
  services: initialServices,
  pricing: initialPricing,
  testimonials: initialTestimonials,
  siteText: initialSiteText,
  settings: initialSettings,
}: {
  projects?: Project[];
  categories?: Category[];
  services?: ServiceItem[];
  pricing?: Price[];
  testimonials?: Testimonial[];
  siteText?: { key: string; value: Partial<I18nText> }[];
  settings?: { key: string; value: Record<string, unknown> }[];
}) {
  const { t, language } = useLanguage();
  const router = useRouter();

  const [tab, setTab] = useState<(typeof tabs)[number]>("projects");
  const [projects, setProjects] = useState<Project[]>(initialProjects ?? []);
  const [categories, setCategories] = useState<Category[]>(
    initialCategories ?? [],
  );
  const [services, setServices] = useState<ServiceItem[]>(
    initialServices ?? [],
  );
  const [pricing, setPricing] = useState<Price[]>(initialPricing ?? []);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    initialTestimonials ?? [],
  );
  const [siteText, setSiteText] = useState<
    { id: string; key: string; value: Partial<I18nText> }[]
  >((initialSiteText ?? []).map((x) => ({ id: x.key, key: x.key, value: x.value })));
  const [settings, setSettings] = useState<
    { id: string; key: string; value: Record<string, unknown> }[]
  >((initialSettings ?? []).map((x) => ({ id: x.key, key: x.key, value: x.value })));
  const [requestCount, setRequestCount] = useState(0);
  const pendingTestimonialsCount = useMemo(
    () => testimonials.filter((t) => t.status === "pending").length,
    [testimonials],
  );

  useEffect(() => {
    if (initialTestimonials) {
      setTestimonials(initialTestimonials);
    }
  }, [initialTestimonials]);

  useEffect(() => {
    if (tab === "testimonials" && typeof AdminTestimonials?.list === "function") {
      AdminTestimonials.list()
        .then((res: any) => {
          if (res?.testimonials && Array.isArray(res.testimonials)) {
            setTestimonials(res.testimonials.map((x: any) => normalizeTestimonial(x)));
          }
        })
        .catch(() => {});
    }
  }, [tab]);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [projectModal, setProjectModal] = useState<ModalState<Project>>({
    kind: "none",
  });
  const [categoryModal, setCategoryModal] = useState<ModalState<Category>>({
    kind: "none",
  });
  const [serviceModal, setServiceModal] = useState<ModalState<ServiceItem>>({
    kind: "none",
  });
  const [priceModal, setPriceModal] = useState<ModalState<Price>>({
    kind: "none",
  });
  const [testimonialModal, setTestimonialModal] = useState<
    ModalState<Testimonial>
  >({ kind: "none" });
  const [siteTextModal, setSiteTextModal] = useState<
    ModalState<{ id: string; key: string; value: Partial<I18nText> }>
  >({ kind: "none" });
  const [settingModal, setSettingModal] = useState<
    ModalState<{ id: string; key: string; value: Record<string, unknown> }>
  >({ kind: "none" });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (
    type: "success" | "error",
    key: string,
    fallback: string,
  ) => {
    let message = fallback;
    try {
      const resolved = key
        .split(".")
        .reduce<any>((acc, seg) => (acc ? acc[seg] : undefined), t as any);
      if (typeof resolved === "string") message = resolved;
    } catch {}
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const serviceOptions = useMemo(
    () =>
      services.map((s) => ({
        value: s.id,
        label: s.name[language] || s.name.en,
      })),
    [services, language],
  );

  const signOut = async () => {
    const supabase = getBrowserAuthClient();
    if (supabase) await supabase.auth.signOut();
    // Full reload so middleware re-checks the now-missing session.
    window.location.href = "/admin/login";
  };

  // ---------------- Project actions ----------------
  const saveProject = async (payload: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const isEdit = projectModal.kind === "edit";
      const res = isEdit
        ? await AdminProjects.update(payload)
        : await AdminProjects.create(payload);
      const newRow = normalizeProject(res.project as any, categories);
      setProjects((prev) =>
        isEdit
          ? prev.map((p) => (p.id === newRow.id ? newRow : p))
          : [newRow, ...prev],
      );
      setProjectModal({ kind: "none" });
      showToast("success", "admin.toast.projectSaved", "Project saved");
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.saveError", e.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProject = async () => {
    if (projectModal.kind !== "delete") return;
    setSubmitting(true);
    try {
      await AdminProjects.remove(projectModal.entity.id);
      setProjects((prev) =>
        prev.filter((p) => p.id !== projectModal.entity.id),
      );
      setProjectModal({ kind: "none" });
      showToast("success", "admin.toast.projectDeleted", "Project deleted");
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.deleteError", e.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleProjectFeatured = async (p: Project) => {
    try {
      const res = await AdminProjects.update({
        id: p.id,
        featured: !p.featured,
      });
      const updated = normalizeProject(res.project as any, categories);
      setProjects((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
      showToast(
        "success",
        "admin.toast.featuredToggled",
        p.featured ? "Removed from featured" : "Marked as featured",
      );
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.saveError", e.message || "Update failed");
    }
  };

  // ---------------- Category actions ----------------
  const saveCategory = async (payload: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const isEdit = categoryModal.kind === "edit";
      const res = isEdit
        ? await AdminCategories.update(payload)
        : await AdminCategories.create(payload);
      const newRow = normalizeCategory(res.category as any);
      setCategories((prev) =>
        isEdit
          ? prev.map((c) => (c.id === newRow.id ? newRow : c))
          : [...prev, newRow],
      );
      setCategoryModal({ kind: "none" });
      showToast("success", "admin.toast.categorySaved", "Category saved");
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.saveError", e.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCategory = async () => {
    if (categoryModal.kind !== "delete") return;
    setSubmitting(true);
    try {
      await AdminCategories.remove(categoryModal.entity.id);
      setCategories((prev) =>
        prev.filter((c) => c.id !== categoryModal.entity.id),
      );
      setCategoryModal({ kind: "none" });
      showToast("success", "admin.toast.categoryDeleted", "Category deleted");
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.deleteError", e.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- Service actions ----------------
  const saveService = async (payload: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const isEdit = serviceModal.kind === "edit";
      const res = isEdit
        ? await AdminServices.update(payload)
        : await AdminServices.create(payload);
      const newRow = normalizeService(res.service as any);
      setServices((prev) =>
        isEdit
          ? prev.map((s) => (s.id === newRow.id ? newRow : s))
          : [...prev, newRow],
      );
      setServiceModal({ kind: "none" });
      showToast("success", "admin.toast.serviceSaved", "Service saved");
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.saveError", e.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteService = async () => {
    if (serviceModal.kind !== "delete") return;
    setSubmitting(true);
    try {
      await AdminServices.remove(serviceModal.entity.id);
      setServices((prev) =>
        prev.filter((s) => s.id !== serviceModal.entity.id),
      );
      setServiceModal({ kind: "none" });
      showToast("success", "admin.toast.serviceDeleted", "Service deleted");
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.deleteError", e.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- Price actions ----------------
  const savePrice = async (payload: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const isEdit = priceModal.kind === "edit";
      const res = isEdit
        ? await AdminPrices.update(payload)
        : await AdminPrices.create(payload);
      const newRow = normalizePrice(res.price as any);
      setPricing((prev) =>
        isEdit
          ? prev.map((p) => (p.id === newRow.id ? newRow : p))
          : [...prev, newRow],
      );
      setPriceModal({ kind: "none" });
      showToast("success", "admin.toast.priceSaved", "Price saved");
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.saveError", e.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const deletePrice = async () => {
    if (priceModal.kind !== "delete") return;
    setSubmitting(true);
    try {
      await AdminPrices.remove(priceModal.entity.id);
      setPricing((prev) =>
        prev.filter((p) => p.id !== priceModal.entity.id),
      );
      setPriceModal({ kind: "none" });
      showToast("success", "admin.toast.priceDeleted", "Price deleted");
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.deleteError", e.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- Testimonial actions ----------------
  const saveTestimonial = async (payload: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const isEdit = testimonialModal.kind === "edit";
      const res = isEdit
        ? await AdminTestimonials.update(payload)
        : await AdminTestimonials.create(payload);
      const newRow = normalizeTestimonial(res.testimonial as any);
      setTestimonials((prev) =>
        isEdit
          ? prev.map((x) => (x.id === newRow.id ? newRow : x))
          : [newRow, ...prev],
      );
      setTestimonialModal({ kind: "none" });
      showToast(
        "success",
        "admin.toast.testimonialSaved",
        "Testimonial saved",
      );
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.saveError", e.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTestimonial = async () => {
    if (testimonialModal.kind !== "delete") return;
    setSubmitting(true);
    try {
      await AdminTestimonials.remove(testimonialModal.entity.id);
      setTestimonials((prev) =>
        prev.filter((x) => x.id !== testimonialModal.entity.id),
      );
      setTestimonialModal({ kind: "none" });
      showToast(
        "success",
        "admin.toast.testimonialDeleted",
        "Testimonial deleted",
      );
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.deleteError", e.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  const approveTestimonial = async (item: Testimonial) => {
    setSubmitting(true);
    try {
      await AdminTestimonials.update({ id: item.id, status: "approved" });
      setTestimonials((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, status: "approved" } : x)),
      );
      showToast(
        "success",
        "admin.toast.testimonialSaved",
        "Testimonial approved & published",
      );
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.saveError", e.message || "Approval failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- Site Text actions ----------------
  const saveSiteText = async (payload: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const isEdit = siteTextModal.kind === "edit";
      const res = isEdit
        ? await AdminSiteText.update(payload)
        : await AdminSiteText.create(payload);
      const row = res.siteText as any;
      const newRow = {
        id: String(row.key),
        key: String(row.key),
        value: row.value,
      };
      setSiteText((prev) =>
        isEdit
          ? prev.map((x) => (x.id === newRow.id ? newRow : x))
          : [...prev, newRow],
      );
      setSiteTextModal({ kind: "none" });
      showToast("success", "admin.toast.siteTextSaved", "Site text saved");
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.saveError", e.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSiteText = async () => {
    if (siteTextModal.kind !== "delete") return;
    setSubmitting(true);
    try {
      await AdminSiteText.remove(siteTextModal.entity.id);
      setSiteText((prev) => prev.filter((x) => x.id !== siteTextModal.entity.id));
      setSiteTextModal({ kind: "none" });
      showToast("success", "admin.toast.siteTextDeleted", "Site text deleted");
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.deleteError", e.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- Settings actions ----------------
  const saveSetting = async (payload: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const isEdit = settingModal.kind === "edit";
      const res = isEdit
        ? await AdminSettings.update(payload)
        : await AdminSettings.create(payload);
      const row = res.setting as any;
      const newRow = {
        id: String(row.key),
        key: String(row.key),
        value: row.value,
      };
      setSettings((prev) =>
        isEdit
          ? prev.map((x) => (x.id === newRow.id ? newRow : x))
          : [...prev, newRow],
      );
      setSettingModal({ kind: "none" });
      showToast("success", "admin.toast.settingSaved", "Setting saved");
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.saveError", e.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSetting = async () => {
    if (settingModal.kind !== "delete") return;
    setSubmitting(true);
    try {
      await AdminSettings.remove(settingModal.entity.id);
      setSettings((prev) => prev.filter((x) => x.id !== settingModal.entity.id));
      setSettingModal({ kind: "none" });
      showToast("success", "admin.toast.settingDeleted", "Setting deleted");
      router.refresh();
    } catch (e: any) {
      showToast("error", "admin.toast.deleteError", e.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (
    !initialProjects ||
    !initialCategories ||
    !initialServices ||
    !initialPricing
  )
    return null;

  return (
    <section className="py-10 lg:py-14">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {t("admin.disclaimer")}
          </p>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("admin.auth.signOut")}
          </button>
        </div>

        {toast && (
          <div
            className={cn(
              "fixed top-20 right-4 z-[200] max-w-sm rounded-xl shadow-xl border px-4 py-3 flex items-start gap-3 animate-in fade-in slide-in-from-right",
              toast.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200"
                : "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200",
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
            )}
            <div className="text-sm font-medium leading-snug">
              {toast.message}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <StatCard
            label={t("admin.sections.projects")}
            value={projects.length}
            hint={`${projects.filter((p) => p.featured).length} ${
              t("admin.stats.featured") || "featured"
            }`}
            icon={TrendingUp}
          />
          <StatCard
            label={t("admin.sections.categories")}
            value={categories.filter((c) => c.slug !== "all").length}
            icon={Tag}
          />
          <StatCard
            label={t("admin.sections.services")}
            value={services.length}
            icon={Layers}
          />
          <StatCard
            label={t("admin.sections.prices")}
            value={pricing.length}
            icon={PaintBucket}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-border pb-2">
          {tabs.map((k) => {
            const Icon = tabIcons[k];
            const active = tab === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-t-md text-sm font-semibold border-b-2 transition-colors mb-[-2px]",
                  active
                    ? "text-brand-red border-brand-red bg-brand-red/5"
                    : "text-muted-foreground border-transparent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {t(`admin.sections.${k}`)}
                {k === "requests" && requestCount > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-brand-red px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {requestCount}
                  </span>
                )}
                {k === "testimonials" && pendingTestimonialsCount > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {pendingTestimonialsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tab === "projects" && (
          <AdminProjectsView
            projects={projects}
            categories={categories}
            language={language}
            t={t}
            onAdd={() => setProjectModal({ kind: "create" })}
            onEdit={(p) => setProjectModal({ kind: "edit", entity: p })}
            onDelete={(p) =>
              setProjectModal({
                kind: "delete",
                entity: p,
                label: p.title[language] || p.title.en,
              })
            }
            onToggleFeatured={toggleProjectFeatured}
          />
        )}
        {tab === "categories" && (
          <AdminCategoriesView
            categories={categories}
            language={language}
            t={t}
            onAdd={() => setCategoryModal({ kind: "create" })}
            onEdit={(c) => setCategoryModal({ kind: "edit", entity: c })}
            onDelete={(c) =>
              setCategoryModal({
                kind: "delete",
                entity: c,
                label: c.name[language] || c.name.en,
              })
            }
          />
        )}
        {tab === "services" && (
          <AdminServicesView
            services={services}
            language={language}
            t={t}
            onAdd={() => setServiceModal({ kind: "create" })}
            onEdit={(s) => setServiceModal({ kind: "edit", entity: s })}
            onDelete={(s) =>
              setServiceModal({
                kind: "delete",
                entity: s,
                label: s.name[language] || s.name.en,
              })
            }
          />
        )}
        {tab === "prices" && (
          <AdminPricesView
            pricing={pricing}
            language={language}
            t={t}
            onAdd={() => setPriceModal({ kind: "create" })}
            onEdit={(p) => setPriceModal({ kind: "edit", entity: p })}
            onDelete={(p) =>
              setPriceModal({
                kind: "delete",
                entity: p,
                label: p.service[language] || p.service.en,
              })
            }
          />
        )}
        {tab === "testimonials" && (
          <AdminTestimonialsView
            testimonials={testimonials}
            language={language}
            t={t}
            onAdd={() => setTestimonialModal({ kind: "create" })}
            onEdit={(x) => setTestimonialModal({ kind: "edit", entity: x })}
            onDelete={(x) =>
              setTestimonialModal({
                kind: "delete",
                entity: x,
                label: x.name,
              })
            }
            onApprove={approveTestimonial}
          />
        )}
        {tab === "settings" && (
          <AdminSettingsView
            settings={settings}
            t={t}
            onAdd={() => setSettingModal({ kind: "create" })}
            onEdit={(x) => setSettingModal({ kind: "edit", entity: x })}
            onDelete={(x) =>
              setSettingModal({
                kind: "delete",
                entity: x,
                label: x.key,
              })
            }
          />
        )}
        {tab === "siteText" && (
          <AdminSiteTextView
            siteText={siteText}
            language={language}
            t={t}
            onAdd={() => setSiteTextModal({ kind: "create" })}
            onEdit={(x) => setSiteTextModal({ kind: "edit", entity: x })}
            onDelete={(x) =>
              setSiteTextModal({
                kind: "delete",
                entity: x,
                label: x.key,
              })
            }
          />
        )}
        {tab === "requests" && <AdminRequests onNewCount={setRequestCount} />}
        {tab === "uploads" && <AdminUploads t={t} />}
      </div>

      {/* Project modals */}
      <AdminModal
        open={projectModal.kind === "create" || projectModal.kind === "edit"}
        onClose={() => setProjectModal({ kind: "none" })}
        size="xl"
        title={
          projectModal.kind === "edit"
            ? t("admin.modal.editProject")
            : t("admin.modal.newProject")
        }
      >
        <ProjectForm
          initial={projectModal.kind === "edit" ? projectModal.entity : undefined}
          categories={categories}
          services={serviceOptions}
          onCancel={() => setProjectModal({ kind: "none" })}
          onSubmit={saveProject}
          loading={submitting}
        />
      </AdminModal>
      <ConfirmModal
        open={projectModal.kind === "delete"}
        onClose={() => setProjectModal({ kind: "none" })}
        title={t("admin.modal.confirmDelete")}
        description={
          projectModal.kind === "delete"
            ? `${t("admin.modal.deleteProjectPrompt")} “${projectModal.label}”?`
            : ""
        }
        confirmLabel={t("admin.modal.delete")}
        danger
        loading={submitting}
        onConfirm={deleteProject}
      />

      {/* Category modals */}
      <AdminModal
        open={categoryModal.kind === "create" || categoryModal.kind === "edit"}
        onClose={() => setCategoryModal({ kind: "none" })}
        size="md"
        title={
          categoryModal.kind === "edit"
            ? t("admin.modal.editCategory")
            : t("admin.modal.newCategory")
        }
      >
        <CategoryForm
          initial={
            categoryModal.kind === "edit" ? categoryModal.entity : undefined
          }
          onCancel={() => setCategoryModal({ kind: "none" })}
          onSubmit={saveCategory}
          loading={submitting}
        />
      </AdminModal>
      <ConfirmModal
        open={categoryModal.kind === "delete"}
        onClose={() => setCategoryModal({ kind: "none" })}
        title={t("admin.modal.confirmDelete")}
        description={
          categoryModal.kind === "delete"
            ? `${t("admin.modal.deleteCategoryPrompt")} “${categoryModal.label}”?`
            : ""
        }
        confirmLabel={t("admin.modal.delete")}
        danger
        loading={submitting}
        onConfirm={deleteCategory}
      />

      {/* Service modals */}
      <AdminModal
        open={serviceModal.kind === "create" || serviceModal.kind === "edit"}
        onClose={() => setServiceModal({ kind: "none" })}
        size="lg"
        title={
          serviceModal.kind === "edit"
            ? t("admin.modal.editService")
            : t("admin.modal.newService")
        }
      >
        <ServiceForm
          initial={serviceModal.kind === "edit" ? serviceModal.entity : undefined}
          onCancel={() => setServiceModal({ kind: "none" })}
          onSubmit={saveService}
          loading={submitting}
        />
      </AdminModal>
      <ConfirmModal
        open={serviceModal.kind === "delete"}
        onClose={() => setServiceModal({ kind: "none" })}
        title={t("admin.modal.confirmDelete")}
        description={
          serviceModal.kind === "delete"
            ? `${t("admin.modal.deleteServicePrompt")} “${serviceModal.label}”?`
            : ""
        }
        confirmLabel={t("admin.modal.delete")}
        danger
        loading={submitting}
        onConfirm={deleteService}
      />

      {/* Price modals */}
      <AdminModal
        open={priceModal.kind === "create" || priceModal.kind === "edit"}
        onClose={() => setPriceModal({ kind: "none" })}
        size="lg"
        title={
          priceModal.kind === "edit"
            ? t("admin.modal.editPrice")
            : t("admin.modal.newPrice")
        }
      >
        <PriceForm
          initial={priceModal.kind === "edit" ? priceModal.entity : undefined}
          categories={categories}
          onCancel={() => setPriceModal({ kind: "none" })}
          onSubmit={savePrice}
          loading={submitting}
        />
      </AdminModal>
      <ConfirmModal
        open={priceModal.kind === "delete"}
        onClose={() => setPriceModal({ kind: "none" })}
        title={t("admin.modal.confirmDelete")}
        description={
          priceModal.kind === "delete"
            ? `${t("admin.modal.deletePricePrompt")} “${priceModal.label}”?`
            : ""
        }
        confirmLabel={t("admin.modal.delete")}
        danger
        loading={submitting}
        onConfirm={deletePrice}
      />

      {/* Testimonial modals */}
      <AdminModal
        open={
          testimonialModal.kind === "create" || testimonialModal.kind === "edit"
        }
        onClose={() => setTestimonialModal({ kind: "none" })}
        size="lg"
        title={
          testimonialModal.kind === "edit"
            ? t("admin.modal.editTestimonial")
            : t("admin.modal.newTestimonial")
        }
      >
        <TestimonialForm
          initial={
            testimonialModal.kind === "edit" ? testimonialModal.entity : undefined
          }
          onCancel={() => setTestimonialModal({ kind: "none" })}
          onSubmit={saveTestimonial}
          loading={submitting}
        />
      </AdminModal>
      <ConfirmModal
        open={testimonialModal.kind === "delete"}
        onClose={() => setTestimonialModal({ kind: "none" })}
        title={t("admin.modal.confirmDelete")}
        description={
          testimonialModal.kind === "delete"
            ? `${t("admin.modal.deleteTestimonialPrompt")} “${testimonialModal.label}”?`
            : ""
        }
        confirmLabel={t("admin.modal.delete")}
        danger
        loading={submitting}
        onConfirm={deleteTestimonial}
      />

      {/* Site Text */}
      <AdminModal
        open={siteTextModal.kind === "create" || siteTextModal.kind === "edit"}
        onClose={() => setSiteTextModal({ kind: "none" })}
        size="lg"
        title={
          siteTextModal.kind === "edit"
            ? t("admin.modal.editSiteText")
            : t("admin.modal.newSiteText")
        }
      >
        <SiteTextForm
          initial={siteTextModal.kind === "edit" ? siteTextModal.entity : undefined}
          onCancel={() => setSiteTextModal({ kind: "none" })}
          onSubmit={saveSiteText}
          loading={submitting}
        />
      </AdminModal>
      <ConfirmModal
        open={siteTextModal.kind === "delete"}
        onClose={() => setSiteTextModal({ kind: "none" })}
        title={t("admin.modal.confirmDelete")}
        description={
          siteTextModal.kind === "delete"
            ? `${t("admin.modal.deleteSiteTextPrompt")} “${siteTextModal.label}”?`
            : ""
        }
        confirmLabel={t("admin.modal.delete")}
        danger
        loading={submitting}
        onConfirm={deleteSiteText}
      />

      {/* Settings */}
      <AdminModal
        open={settingModal.kind === "create" || settingModal.kind === "edit"}
        onClose={() => setSettingModal({ kind: "none" })}
        size="lg"
        title={
          settingModal.kind === "edit"
            ? t("admin.modal.editSetting")
            : t("admin.modal.newSetting")
        }
      >
        <SettingForm
          initial={settingModal.kind === "edit" ? settingModal.entity : undefined}
          onCancel={() => setSettingModal({ kind: "none" })}
          onSubmit={saveSetting}
          loading={submitting}
        />
      </AdminModal>
      <ConfirmModal
        open={settingModal.kind === "delete"}
        onClose={() => setSettingModal({ kind: "none" })}
        title={t("admin.modal.confirmDelete")}
        description={
          settingModal.kind === "delete"
            ? `${t("admin.modal.deleteSettingPrompt")} “${settingModal.label}”?`
            : ""
        }
        confirmLabel={t("admin.modal.delete")}
        danger
        loading={submitting}
        onConfirm={deleteSetting}
      />
    </section>
  );
}

// ----------------------------- VIEWS -----------------------------

function AdminProjectsView({
  projects,
  categories,
  language,
  t,
  onAdd,
  onEdit,
  onDelete,
  onToggleFeatured,
}: {
  projects: Project[];
  categories: Category[];
  language: "en" | "fr" | "ar";
  t: any;
  onAdd: () => void;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
  onToggleFeatured: (p: Project) => void;
}) {
  const catMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) m.set(c.slug, c.name[language] || c.name.en);
    return m;
  }, [categories, language]);

  return (
    <div>
      <AdminBar
        title={t("admin.sections.projects") + ` (${projects.length})`}
        onAdd={onAdd}
        addLabel={t("admin.actions.add") + " " + t("admin.sections.projects")}
      />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-start px-4 py-3 font-semibold w-12"></th>
                <th className="text-start px-4 py-3 font-semibold">
                  {t("admin.fields.project")}
                </th>
                <th className="text-start px-4 py-3 font-semibold hidden md:table-cell">
                  {t("admin.fields.category")}
                </th>
                <th className="text-start px-4 py-3 font-semibold hidden sm:table-cell">
                  {t("admin.fields.location")}
                </th>
                <th className="text-start px-4 py-3 font-semibold hidden lg:table-cell">
                  {t("admin.fields.year")}
                </th>
                <th className="text-start px-4 py-3 font-semibold">
                  {t("admin.fields.featured")}
                </th>
                <th className="text-end px-4 py-3 font-semibold">
                  {t("admin.actions.label") || "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 align-middle">
                  <td className="px-4 py-3">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.coverImage}
                        alt=""
                        className="h-10 w-14 object-cover rounded-md border border-border"
                      />
                    ) : (
                      <div className="h-10 w-14 rounded-md bg-muted/50 grid place-items-center text-muted-foreground">
                        <FileText className="h-4 w-4" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <div>{p.title[language] ?? p.title.en}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                      /{p.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell capitalize">
                    {catMap.get(p.category) ?? p.category}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    {p.location[language] ?? p.location.en}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {p.year}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onToggleFeatured(p)}
                      aria-pressed={p.featured}
                      title={t("admin.actions.toggleFeatured")}
                      className={cn(
                        "h-9 w-9 rounded-md inline-flex items-center justify-center transition-colors",
                        p.featured
                          ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <Star
                        className="h-4 w-4"
                        fill={p.featured ? "currentColor" : "none"}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton Icon={Edit2} onClick={() => onEdit(p)} label={t("admin.actions.edit")} />
                      <IconButton Icon={Trash2} danger onClick={() => onDelete(p)} label={t("admin.actions.delete")} />
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    {t("admin.empty.projects") || "No projects yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminCategoriesView({
  categories,
  language,
  t,
  onAdd,
  onEdit,
  onDelete,
}: {
  categories: Category[];
  language: "en" | "fr" | "ar";
  t: any;
  onAdd: () => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  const cats = categories.filter((c) => c.slug !== "all");
  return (
    <div>
      <AdminBar
        title={t("admin.sections.categories") + ` (${cats.length})`}
        onAdd={onAdd}
        addLabel={t("admin.actions.add") + " " + t("admin.sections.categories")}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-border bg-card p-5 flex items-start justify-between gap-4 hover:border-brand-red/40 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">
                {c.name[language] ?? c.name.en}
              </div>
              <div className="text-xs text-muted-foreground mt-1">/{c.slug}</div>
              {c.description && (
                <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
                  {c.description[language] ?? c.description.en}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <IconButton Icon={Edit2} onClick={() => onEdit(c)} label={t("admin.actions.edit")} />
              <IconButton Icon={Trash2} danger onClick={() => onDelete(c)} label={t("admin.actions.delete")} />
            </div>
          </div>
        ))}
        {cats.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground text-sm py-10 rounded-xl border border-dashed border-border bg-background">
            {t("admin.empty.categories") || "No categories yet."}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminServicesView({
  services,
  language,
  t,
  onAdd,
  onEdit,
  onDelete,
}: {
  services: ServiceItem[];
  language: "en" | "fr" | "ar";
  t: any;
  onAdd: () => void;
  onEdit: (s: ServiceItem) => void;
  onDelete: (s: ServiceItem) => void;
}) {
  return (
    <div>
      <AdminBar
        title={t("admin.sections.services") + ` (${services.length})`}
        onAdd={onAdd}
        addLabel={t("admin.actions.add") + " " + t("admin.sections.services")}
      />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-start px-4 py-3 font-semibold">
                  {t("admin.fields.service")}
                </th>
                <th className="text-start px-4 py-3 font-semibold hidden md:table-cell">
                  {t("admin.fields.icon")}
                </th>
                <th className="text-start px-4 py-3 font-semibold hidden lg:table-cell">
                  {t("admin.fields.startingPrice")}
                </th>
                <th className="text-end px-4 py-3 font-semibold">
                  {t("admin.actions.label") || "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 align-middle">
                  <td className="px-4 py-3 font-medium min-w-[200px]">
                    <div>{s.name[language] ?? s.name.en}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {s.description[language] ?? s.description.en}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/70 border border-border text-xs font-mono">
                      {s.icon}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                    {s.startingPrice
                      ? `${s.startingPrice.toLocaleString()} DZD${s.unit ? ` / ${s.unit[language] ?? s.unit.en}` : ""}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton Icon={Edit2} onClick={() => onEdit(s)} label={t("admin.actions.edit")} />
                      <IconButton Icon={Trash2} danger onClick={() => onDelete(s)} label={t("admin.actions.delete")} />
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    {t("admin.empty.services") || "No services yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminPricesView({
  pricing,
  language,
  t,
  onAdd,
  onEdit,
  onDelete,
}: {
  pricing: Price[];
  language: "en" | "fr" | "ar";
  t: any;
  onAdd: () => void;
  onEdit: (p: Price) => void;
  onDelete: (p: Price) => void;
}) {
  return (
    <div>
      <AdminBar
        title={t("admin.sections.prices") + ` (${pricing.length})`}
        onAdd={onAdd}
        addLabel={t("admin.actions.add") + " " + t("admin.sections.prices")}
      />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-start px-4 py-3 font-semibold">
                  {t("admin.fields.service")}
                </th>
                <th className="text-start px-4 py-3 font-semibold hidden md:table-cell">
                  {t("admin.fields.category")}
                </th>
                <th className="text-start px-4 py-3 font-semibold">
                  {t("pricing.columns.range") || "Range"}
                </th>
                <th className="text-start px-4 py-3 font-semibold hidden sm:table-cell">
                  {t("admin.fields.unit")}
                </th>
                <th className="text-start px-4 py-3 font-semibold hidden lg:table-cell">
                  {t("pricing.columns.updated") || "Updated"}
                </th>
                <th className="text-end px-4 py-3 font-semibold">
                  {t("admin.actions.label") || "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pricing.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 align-middle">
                  <td className="px-4 py-3 font-medium min-w-[200px]">
                    <div>{p.service[language] ?? p.service.en}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {p.description[language] ?? p.description.en}
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize hidden md:table-cell text-muted-foreground">
                    {p.category || "—"}
                  </td>
                  <td className="px-4 py-3 text-brand-red font-semibold whitespace-nowrap">
                    {p.priceFrom.toLocaleString()}
                    {p.priceTo ? ` – ${p.priceTo.toLocaleString()}` : ""} {p.currency}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    {p.unit[language] ?? p.unit.en}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {p.updatedAt}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton Icon={Edit2} onClick={() => onEdit(p)} label={t("admin.actions.edit")} />
                      <IconButton Icon={Trash2} danger onClick={() => onDelete(p)} label={t("admin.actions.delete")} />
                    </div>
                  </td>
                </tr>
              ))}
              {pricing.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    {t("admin.empty.prices") || "No prices yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminTestimonialsView({
  testimonials,
  language,
  t,
  onAdd,
  onEdit,
  onDelete,
  onApprove,
}: {
  testimonials: Testimonial[];
  language: "en" | "fr" | "ar";
  t: any;
  onAdd: () => void;
  onEdit: (x: Testimonial) => void;
  onDelete: (x: Testimonial) => void;
  onApprove: (x: Testimonial) => void;
}) {
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const pendingCount = testimonials.filter((x) => x.status === "pending").length;
  const approvedCount = testimonials.filter((x) => x.status !== "pending").length;

  const filtered = testimonials.filter((x) => {
    if (filter === "pending") return x.status === "pending";
    if (filter === "approved") return x.status !== "pending";
    return true;
  });

  return (
    <div>
      <AdminBar
        title={t("admin.sections.testimonials") + ` (${testimonials.length})`}
        onAdd={onAdd}
        addLabel={
          t("admin.actions.add") + " " + t("admin.sections.testimonials")
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors",
            filter === "all"
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          All ({testimonials.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("pending")}
          className={cn(
            "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors",
            filter === "pending"
              ? "bg-amber-500 text-white"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
          )}
        >
          <span>Pending Approval</span>
          {pendingCount > 0 && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-amber-600 text-white text-[10px] grid place-items-center font-bold">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setFilter("approved")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors",
            filter === "approved"
              ? "bg-emerald-600 text-white"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20",
          )}
        >
          Approved ({approvedCount})
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-start px-4 py-3 font-semibold">
                  {t("admin.fields.name")}
                </th>
                <th className="text-start px-4 py-3 font-semibold">Status</th>
                <th className="text-start px-4 py-3 font-semibold">Phone (Private)</th>
                <th className="text-start px-4 py-3 font-semibold">
                  {t("admin.fields.review")}
                </th>
                <th className="text-start px-4 py-3 font-semibold hidden md:table-cell">
                  {t("admin.fields.project")}
                </th>
                <th className="text-start px-4 py-3 font-semibold hidden lg:table-cell">
                  {t("admin.fields.date")}
                </th>
                <th className="text-end px-4 py-3 font-semibold">
                  {t("admin.actions.label") || "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((x) => {
                const isPending = x.status === "pending";
                return (
                  <tr
                    key={x.id}
                    className={cn(
                      "hover:bg-muted/30 align-top",
                      isPending && "bg-amber-500/5",
                    )}
                  >
                    <td className="px-4 py-3 font-medium min-w-[140px]">
                      <div>{x.name}</div>
                      {x.rating && (
                        <div className="flex items-center gap-0.5 text-amber-400 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-3 w-3"
                              fill={i < x.rating! ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                      )}
                      {x.isPlaceholder && (
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">
                          placeholder
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          Pending Approval
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          Approved
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {x.phone ? (
                        <a
                          href={`tel:${x.phone}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-brand-red transition-colors"
                          title="Call client to confirm work"
                        >
                          <Phone className="h-3.5 w-3.5 text-brand-red" />
                          <span dir="ltr">{x.phone}</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground min-w-[220px] max-w-[420px]">
                      <span className="line-clamp-2">
                        {x.review[language] || x.review.en}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {x.project || "—"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                      {x.date || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => onApprove(x)}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                            title="Approve & Publish to website"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        <IconButton
                          Icon={Edit2}
                          onClick={() => onEdit(x)}
                          label={t("admin.actions.edit")}
                        />
                        <IconButton
                          Icon={Trash2}
                          danger
                          onClick={() => onDelete(x)}
                          label={t("admin.actions.delete")}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-muted-foreground text-sm"
                  >
                    {filter === "pending"
                      ? "No pending testimonials to review."
                      : t("admin.empty.testimonials")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminSiteTextView({
  siteText,
  language,
  t,
  onAdd,
  onEdit,
  onDelete,
}: {
  siteText: { id: string; key: string; value: Partial<I18nText> }[];
  language: "en" | "fr" | "ar";
  t: any;
  onAdd: () => void;
  onEdit: (x: { id: string; key: string; value: Partial<I18nText> }) => void;
  onDelete: (x: { id: string; key: string; value: Partial<I18nText> }) => void;
}) {
  return (
    <div>
      <AdminBar
        title={t("admin.sections.siteText") + ` (${siteText.length})`}
        onAdd={onAdd}
        addLabel={t("admin.actions.add") + " " + t("admin.sections.siteText")}
      />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-start px-4 py-3 font-semibold">
                  {t("admin.fields.key")}
                </th>
                <th className="text-start px-4 py-3 font-semibold">
                  {t("admin.fields.value")}
                </th>
                <th className="text-end px-4 py-3 font-semibold">
                  {t("admin.actions.label") || "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {siteText.map((x) => (
                <tr key={x.key} className="hover:bg-muted/30 align-top">
                  <td className="px-4 py-3 font-mono text-xs min-w-[160px]">
                    {x.key}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground min-w-[240px] max-w-[520px]">
                    <span className="line-clamp-2">
                      {x.value?.[language] || x.value?.en || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton
                        Icon={Edit2}
                        onClick={() => onEdit(x)}
                        label={t("admin.actions.edit")}
                      />
                      <IconButton
                        Icon={Trash2}
                        danger
                        onClick={() => onDelete(x)}
                        label={t("admin.actions.delete")}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {siteText.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-10 text-center text-muted-foreground text-sm"
                  >
                    {t("admin.empty.siteText")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminSettingsView({
  settings,
  t,
  onAdd,
  onEdit,
  onDelete,
}: {
  settings: { id: string; key: string; value: Record<string, unknown> }[];
  t: any;
  onAdd: () => void;
  onEdit: (x: { id: string; key: string; value: Record<string, unknown> }) => void;
  onDelete: (x: { id: string; key: string; value: Record<string, unknown> }) => void;
}) {
  return (
    <div>
      <AdminBar
        title={t("admin.sections.settings") + ` (${settings.length})`}
        onAdd={onAdd}
        addLabel={t("admin.actions.add") + " " + t("admin.sections.settings")}
      />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-start px-4 py-3 font-semibold">
                  {t("admin.fields.key")}
                </th>
                <th className="text-start px-4 py-3 font-semibold">
                  {t("admin.fields.value")}
                </th>
                <th className="text-end px-4 py-3 font-semibold">
                  {t("admin.actions.label") || "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {settings.map((x) => (
                <tr key={x.key} className="hover:bg-muted/30 align-top">
                  <td className="px-4 py-3 font-mono text-xs min-w-[160px]">
                    {x.key}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground min-w-[240px] max-w-[520px]">
                    <span className="line-clamp-2 font-mono text-xs">
                      {JSON.stringify(x.value)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton
                        Icon={Edit2}
                        onClick={() => onEdit(x)}
                        label={t("admin.actions.edit")}
                      />
                      <IconButton
                        Icon={Trash2}
                        danger
                        onClick={() => onDelete(x)}
                        label={t("admin.actions.delete")}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {settings.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-10 text-center text-muted-foreground text-sm"
                  >
                    {t("admin.empty.settings")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminUploads({ t }: { t: any }) {
  const [paths, setPaths] = useState<string[]>([]);
  return (
    <div>
      <AdminBar title={t("admin.sections.uploads")} />
      <div className="space-y-5">
        <div className="rounded-xl border-2 border-dashed border-border bg-card p-10 text-center">
          <div className="mx-auto mb-4 h-14 w-14 grid place-items-center rounded-full bg-brand-red/10 text-brand-red">
            <Upload className="h-7 w-7" />
          </div>
          <h3 className="font-bold text-lg mb-1">
            {t("admin.upload.hintTitle") || "Upload Images"}
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            {t("admin.upload.hint") ||
              "Use the Cover Image and Gallery uploaders inside each Project editor. You can also batch-upload images here — they will be stored in the media library and available to pick for any project."}
          </p>
        </div>
        <MultiImagePicker
          label={t("admin.upload.library") || "Media Library"}
          value={paths}
          onChange={setPaths}
          folder="general"
          onRemove={async (path: string) => {
            try {
              await AdminUpload.remove(path);
            } catch {}
          }}
        />
      </div>
    </div>
  );
}

// ----------------------------- SMALL PARTS -----------------------------

function AdminBar({
  title,
  onAdd,
  addLabel,
}: {
  title: string;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-bold text-xl">{title}</h2>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-md bg-brand-red text-white px-4 py-2 text-sm font-semibold hover:bg-brand-red-600 transition-colors"
        >
          <Plus className="h-4 w-4" /> {addLabel ?? "Add"}
        </button>
      )}
    </div>
  );
}

function IconButton({
  Icon,
  danger,
  onClick,
  label,
}: {
  Icon: any;
  danger?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "h-9 w-9 inline-flex items-center justify-center rounded-md border border-border bg-background transition-colors",
        danger
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: any;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
      <div className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 grid place-items-center rounded-lg bg-brand-red/10 text-brand-red">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 text-2xl font-extrabold tracking-tight">{value}</div>
        {hint && (
          <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
        )}
      </div>
    </div>
  );
}

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel,
  danger,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
}) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
    >
      {description && (
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          {description}
        </p>
      )}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
        >
          {cancelLabel ?? "Cancel"}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60",
            danger
              ? "bg-red-600 hover:bg-red-700"
              : "bg-brand-red hover:bg-brand-red-600",
          )}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </AdminModal>
  );
}

// ----------------------------- NORMALIZATION HELPERS -----------------------------

type I18n = { en: string; fr: string; ar: string };
const pickI18n = (v: unknown): I18n => {
  const o = v && typeof v === "object" ? (v as any) : {};
  return {
    en: typeof o.en === "string" ? o.en : "",
    fr: typeof o.fr === "string" ? o.fr : "",
    ar: typeof o.ar === "string" ? o.ar : "",
  };
};
const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
const toPublicUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  if (base) return `${base}/storage/v1/object/public/media/${path}`;
  return `/${path}`;
};

function normalizeProject(row: any, categories: Category[]): Project {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: pickI18n(row.title),
    category: String(row.category ?? ""),
    location: pickI18n(row.location),
    year: typeof row.year === "number" ? row.year : 0,
    description: pickI18n(row.description),
    services: Array.isArray(row.services)
      ? row.services.filter((x: any) => typeof x === "string")
      : [],
    coverImage: toPublicUrl(row.cover_path),
    images: Array.isArray(row.images) ? row.images.map(toPublicUrl) : [],
    beforeImage: row.before_path ? toPublicUrl(row.before_path) : undefined,
    afterImage: row.after_path ? toPublicUrl(row.after_path) : undefined,
    featured: row.featured === true,
    createdAt:
      typeof row.created_at === "string"
        ? row.created_at.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
  };
}

function normalizeCategory(row: any): Category {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    name: pickI18n(row.name),
    description: row.description ? pickI18n(row.description) : undefined,
  };
}

function normalizeService(row: any): ServiceItem {
  return {
    id: String(row.id ?? ""),
    name: pickI18n(row.name),
    description: pickI18n(row.description),
    icon: typeof row.icon === "string" ? row.icon : "layers",
    startingPrice:
      typeof row.starting_price === "number" ? row.starting_price : undefined,
    unit: row.unit ? pickI18n(row.unit) : undefined,
  };
}

function normalizePrice(row: any): Price {
  return {
    id: String(row.id ?? ""),
    service: pickI18n(row.service),
    category:
      typeof row.category === "string" ? row.category : "",
    description: pickI18n(row.description),
    unit: pickI18n(row.unit),
    priceFrom: typeof row.price_from === "number" ? row.price_from : 0,
    priceTo: typeof row.price_to === "number" ? row.price_to : undefined,
    currency: typeof row.currency === "string" ? row.currency : "DZD",
    notes: row.notes ? pickI18n(row.notes) : undefined,
    updatedAt:
      typeof row.updated_at === "string"
        ? row.updated_at.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
  };
}

function normalizeTestimonial(row: any): Testimonial {
  const rev = row.review && typeof row.review === "object" ? row.review : {};
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    phone:
      typeof row.phone === "string"
        ? row.phone
        : typeof rev.phone === "string"
          ? rev.phone
          : undefined,
    status: (row.status || rev.status || "approved") as any,
    project: typeof row.project === "string" ? row.project : undefined,
    review: pickI18n(row.review),
    rating: typeof row.rating === "number" ? row.rating : undefined,
    date: typeof row.review_date === "string" ? row.review_date : undefined,
    photo: typeof row.photo_path === "string" ? row.photo_path : undefined,
    isPlaceholder: row.is_placeholder !== false,
  };
}
