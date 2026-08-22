import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ExternalLink,
  Globe2,
  Image,
  Plus,
  Rocket,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { PageSpinner } from "@/components/ui/Spinner";
import {
  getWebsiteOnboarding,
  getWebsiteDomains,
  claimWebsiteDomain,
  verifyWebsiteDomain,
  setPrimaryWebsiteDomain,
  removeWebsiteDomain,
  getWebsiteVersions,
  publishWebsite,
  restoreWebsiteVersion,
  removeWebsiteMedia,
  unpublishWebsite,
  updateWebsiteOnboarding,
  uploadWebsiteMedia,
} from "@/services/agencyService";
import { useAuthStore } from "@/store/authStore";
import { useProperties } from "@/hooks/useProperties";
import WebsiteLivePreview from "@/components/website-editor/WebsiteLivePreview";

const STEPS = [
  [
    "Identity & about",
    "Agency name, tagline, introduction, and establishment details.",
  ],
  [
    "Brand & header",
    "Logo, colours, fonts, hero imagery, favicon, and social-sharing assets.",
  ],
  [
    "Contact",
    "Public contact methods, service area, office address, and business hours.",
  ],
  [
    "Hero & properties",
    "Hero message, calls to action, and featured-property behavior.",
  ],
  [
    "About & services",
    "Mission, vision, story, services, specialities, and areas served.",
  ],
  [
    "Trust",
    "Statistics, testimonials, and frequently asked questions.",
  ],
  [
    "Pages & sections",
    "Choose pages, header/footer navigation, and homepage section visibility.",
  ],
  [
    "Footer & SEO",
    "Social channels, language, search metadata, and footer content.",
  ],
  [
    "Review & publish",
    "Confirm accuracy, test responsive preview, and publish the current draft.",
  ],
].map(([title, description]) => ({ title, description }));

const STEP_PREVIEW_SECTION = {
  1: "about",
  2: "header",
  3: "contact",
  4: "hero",
  5: "about",
  6: "testimonials",
  7: "featured-properties",
  8: "footer",
  9: "hero",
};

const PREVIEW_SECTION_STEP = {
  header: 2,
  hero: 4,
  properties: 4,
  "featured-properties": 4,
  services: 5,
  about: 5,
  statistics: 6,
  testimonials: 6,
  faqs: 6,
  agents: 7,
  contact: 3,
  footer: 8,
};

const PAGES = [
  ["home", "Home"],
  ["properties", "Properties"],
  ["map", "Map"],
  ["agents", "Agents"],
  ["about", "About"],
  ["mission", "Mission"],
  ["story", "Story"],
  ["services", "Services"],
  ["faq", "FAQ"],
  ["contact", "Contact"],
  ["schedule-viewing", "Schedule viewing"],
  ["valuation", "Valuation"],
];
const SECTIONS = [
  ["hero", "Hero"],
  ["featured_properties", "Featured properties"],
  ["property_categories", "Property categories"],
  ["services", "Services"],
  ["statistics", "Statistics"],
  ["about", "About"],
  ["mission", "Mission"],
  ["vision", "Vision"],
  ["testimonials", "Testimonials"],
  ["agents", "Agents"],
  ["faqs", "FAQs"],
  ["contact_cta", "Contact CTA"],
  ["social_links", "Social links"],
  ["newsletter", "Newsletter"],
];
const MEDIA = [
  ["logo", "Primary logo"],
  ["logo_light", "Logo for dark backgrounds"],
  ["logo_dark", "Logo for light backgrounds"],
  ["favicon", "Favicon"],
  ["hero_image", "Homepage hero image"],
  ["about_image", "About section image"],
  ["property_placeholder", "Property placeholder"],
  ["social_share_image", "Social sharing image"],
];
const DEFAULT_ENABLED_PAGES = new Set([
  "home",
  "properties",
  "agents",
  "contact",
  "valuation",
]);
const DEFAULT_CONFIG = {
  schema_version: 2,
  display_name: "",
  primary_color: "#496B5A",
  secondary_color: "#8FAF9B",
  accent_color: "#C8A96A",
  heading_font: "playfair-display",
  body_font: "inter",
  tagline: "",
  about: "",
  mission: "",
  vision: "",
  story: "",
  year_established: "",
  specialities: [],
  areas_served: [],
  hero_eyebrow: "",
  hero_title: "",
  hero_subtitle: "",
  hero_primary_cta_label: "Explore properties",
  hero_primary_cta_url: "/properties",
  hero_secondary_cta_label: "Contact us",
  hero_secondary_cta_url: "/contact",
  newsletter_title: "",
  newsletter_description: "",
  contact_cta_eyebrow: "",
  contact_cta_title: "",
  contact_cta_subtitle: "",
  contact_cta_label: "",
  contact_cta_url: "/contact",
  featured_property_limit: 6,
  featured_property_mode: "latest",
  featured_property_ids: [],
  services: [],
  statistics: [],
  testimonials: [],
  faqs: [],
  enabled_pages: Object.fromEntries(
    PAGES.map(([key]) => [key, DEFAULT_ENABLED_PAGES.has(key)]),
  ),
  navigation: [],
  footer_navigation: [],
  section_visibility: Object.fromEntries(SECTIONS.map(([key]) => [key, true])),
  section_order: SECTIONS.map(([key]) => key),
  facebook_url: "",
  instagram_url: "",
  linkedin_url: "",
  youtube_url: "",
  tiktok_url: "",
  whatsapp_number: "",
  viber_number: "",
  public_email: "",
  public_phone: "",
  address: "",
  service_area: "",
  business_hours: "",
  map_latitude: null,
  map_longitude: null,
  seo_title: "",
  seo_description: "",
  og_title: "",
  og_description: "",
  language: "en",
  legal_text: "",
  copyright_text: "",
  accuracy_confirmed: false,
  media: Object.fromEntries(MEDIA.map(([key]) => [key, ""])),
};

const REQUIRED = {
  agency_name: [1, "Agency name"],
  public_contact: [3, "Public email or phone"],
  about: [1, "Agency description (40+ characters)"],
  location: [3, "Address or service area"],
  logo: [2, "Primary logo"],
  primary_color: [2, "Primary colour"],
  hero_title: [4, "Homepage headline"],
  seo_title: [8, "SEO title"],
  seo_description: [8, "SEO description (40+ characters)"],
  accuracy_confirmed: [9, "Content accuracy confirmation"],
  about_page_content: [5, "About page content (40+ characters)"],
  mission_page_content: [5, "Mission page content (20+ characters)"],
  story_page_content: [5, "Story page content (40+ characters)"],
  services_page_content: [5, "At least one service for the Services page"],
  faq_page_content: [6, "At least one FAQ for the FAQ page"],
  map_page_location: [3, "Address or service area for the Map page"],
};

export default function WebsiteOnboardingPage() {
  const query = useQuery({
    queryKey: ["website-onboarding"],
    queryFn: getWebsiteOnboarding,
  });
  if (query.isLoading) return <PageSpinner />;
  if (query.isError)
    return (
      <Card>
        <p className="font-semibold text-red-600">
          Unable to load website onboarding.
        </p>
      </Card>
    );
  return <WebsiteWizard key={query.data.id} initial={query.data} />;
}

function WebsiteWizard({ initial }) {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const updateAuthAgency = useAuthStore((state) => state.updateAgency);
  const localKey = `nexora-website-draft-${initial.id}`;
  const local = readLocal(localKey);
  const requestedStep = Number(searchParams.get("step"));
  const [step, setStep] = useState(
    Math.min(
      Math.max(
        (Number.isInteger(requestedStep) && requestedStep >= 1 && requestedStep <= STEPS.length)
          ? requestedStep
          : (local?.step || initial.website_onboarding_step || 1),
        1,
      ),
      STEPS.length,
    ),
  );
  const [form, setForm] = useState(() => normalizeForm(local?.form
    ? {
        ...initial,
        ...local.form,
        website_draft_config: {
          ...(initial.website_draft_config || {}),
          ...(local.form.website_draft_config || {}),
        },
      }
    : initial));
  const [serverState, setServerState] = useState(initial);
  const [saveState, setSaveState] = useState("saved");
  const [conflict, setConflict] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [previewMode, setPreviewMode] = useState("desktop");
  const [mobilePane, setMobilePane] = useState("edit");
  const [localMedia, setLocalMedia] = useState({});
  const [previewScrollRequest, setPreviewScrollRequest] = useState(0);
  const timer = useRef(null);
  const revisionRef = useRef(initial.website_draft_revision || 0);
  const editRevisionRef = useRef(0);
  const propertiesQuery = useProperties();
  const versionsQuery = useQuery({ queryKey: ["website-versions"], queryFn: getWebsiteVersions });
  const eligibleProperties = useMemo(
    () => (propertiesQuery.data || []).filter((property) =>
      property.is_published &&
      ["available", "reserved", "under_negotiation"].includes(property.status) &&
      !property.requires_republish_approval &&
      property.listing_expires_at && new Date(property.listing_expires_at) > new Date()
    ),
    [propertiesQuery.data],
  );

  const saveMutation = useMutation({
    scope: { id: `website-autosave-${initial.id}` },
    mutationFn: ({ data }) => updateWebsiteOnboarding({ base_revision: revisionRef.current, changes: data }),
    onSuccess: (data, variables) => {
      revisionRef.current = data.website_draft_revision;
      setConflict(null);
      setServerState(data);
      queryClient.setQueryData(["website-onboarding"], data);
      if (variables.revision === editRevisionRef.current) {
        // The editor's local state is authoritative while it is open. Replacing
        // it with an API echo can erase typing made after the request started.
        setDirty(false);
        setSaveState("saved");
        localStorage.removeItem(localKey);
      }
    },
    onError: (error, variables) => {
      if (variables.revision !== editRevisionRef.current) return;
      if (error.response?.status === 409) {
        setConflict(error.response.data);
        setSaveState("conflict");
        return;
      }
      setSaveState("error");
      toast.error(apiError(error, "Unable to save the website draft."));
    },
  });
  const publishMutation = useMutation({
    mutationFn: publishWebsite,
    onSuccess: (data) => {
      revisionRef.current = data.website_draft_revision;
      setServerState(data);
      setForm(normalizeForm(data));
      updateAuthAgency({
        website_onboarding_status: data.website_onboarding_status,
        is_website_published: true,
      });
      toast.success("Your agency website is live.");
      queryClient.invalidateQueries({ queryKey: ["website-versions"] });
    },
    onError: (error) =>
      toast.error(apiError(error, "The website could not be published.")),
  });
  const unpublishMutation = useMutation({
    mutationFn: unpublishWebsite,
    onSuccess: (data) => {
      setServerState(data);
      updateAuthAgency({ is_website_published: false });
      toast.success("Your agency website is now private.");
    },
    onError: (error) =>
      toast.error(apiError(error, "The website could not be unpublished.")),
  });
  const restoreMutation = useMutation({
    mutationFn: restoreWebsiteVersion,
    onSuccess: ({ website }) => {
      revisionRef.current = website.website_draft_revision;
      setServerState(website);
      setForm(normalizeForm(website));
      setDirty(false);
      setSaveState("saved");
      queryClient.setQueryData(["website-onboarding"], website);
      queryClient.invalidateQueries({ queryKey: ["website-versions"] });
      toast.success("The selected version is live as a new published version.");
    },
    onError: (error) => toast.error(apiError(error, "Unable to restore this website version.")),
  });

  const config = form.website_draft_config;
  const payload = useMemo(
    () => ({
      website_onboarding_step: step,
      website_draft_config: config,
    }),
    [config, step],
  );
  const previewPayload = useMemo(
    () => buildPreviewPayload(form, serverState, localMedia),
    [form, serverState, localMedia],
  );
  const activePreviewSection = STEP_PREVIEW_SECTION[step] || "hero";

  useEffect(() => {
    if (!dirty) return undefined;
    localStorage.setItem(
      localKey,
      JSON.stringify({ step, form, savedAt: Date.now() }),
    );
    clearTimeout(timer.current);
    const revision = editRevisionRef.current;
    timer.current = setTimeout(() => saveMutation.mutate({ data: payload, revision }), 900);
    return () => clearTimeout(timer.current);
  }, [dirty, form, step, localKey, payload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const warnBeforeLeaving = (event) => {
      if (!dirty && !saveMutation.isPending) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty, saveMutation.isPending]);

  function changeConfig(field, value) {
    editRevisionRef.current += 1;
    setForm((current) => ({
      ...current,
      website_draft_config: { ...current.website_draft_config, [field]: value },
    }));
    setDirty(true);
    setSaveState("saving");
  }
  function copyOrganizationDetails() {
    const defaults = {
      display_name: serverState.name,
      about: serverState.about,
      public_email: serverState.email,
      public_phone: serverState.phone,
      address: serverState.address,
      business_hours: serverState.business_hours,
      primary_color: serverState.primary_color,
      seo_title: serverState.seo_title,
      seo_description: serverState.seo_description,
      facebook_url: serverState.facebook_url,
      instagram_url: serverState.instagram_url,
      linkedin_url: serverState.linkedin_url,
      youtube_url: serverState.youtube_url,
      tiktok_url: serverState.tiktok_url,
      whatsapp_number: serverState.whatsapp_number,
      viber_number: serverState.viber_number,
      language: serverState.default_language,
    };
    const available = Object.fromEntries(
      Object.entries(defaults).filter(([, value]) => value !== null && value !== undefined && value !== ""),
    );
    editRevisionRef.current += 1;
    setForm((current) => ({
      ...current,
      website_draft_config: { ...current.website_draft_config, ...available },
    }));
    setDirty(true);
    setSaveState("saving");
    toast.success("Organization details copied into the website draft.");
  }
  async function save(target = step) {
    clearTimeout(timer.current);
    setSaveState("saving");
    await saveMutation.mutateAsync({
      data: { ...payload, website_onboarding_step: target },
      revision: editRevisionRef.current,
    });
  }
  async function go(target) {
    if (dirty) await save(target);
    setStep(target);
  }
  async function publish() {
    if (dirty) await save(9);
    publishMutation.mutate();
  }
  function applyServer(data, mediaKind) {
    revisionRef.current = data.website_draft_revision;
    setServerState(data);
    if (mediaKind) {
      const normalized = normalizeForm(data);
      editRevisionRef.current += 1;
      setForm((current) => ({
        ...current,
        website_draft_config: {
          ...current.website_draft_config,
          media: normalized.website_draft_config.media,
        },
      }));
      setDirty(true);
      setSaveState("saving");
      setLocalMedia((current) => {
        const next = { ...current };
        delete next[mediaKind];
        return next;
      });
    } else {
      setForm(normalizeForm(data));
      setDirty(false);
    }
    queryClient.setQueryData(["website-onboarding"], data);
  }
  async function reloadLatest() {
    const latest = conflict?.current || await getWebsiteOnboarding();
    revisionRef.current = latest.website_draft_revision;
    setServerState(latest);
    setForm(normalizeForm(latest));
    setConflict(null);
    setDirty(false);
    setSaveState("saved");
    localStorage.removeItem(localKey);
    queryClient.setQueryData(["website-onboarding"], latest);
  }
  const previewSectionSelected = useCallback((section) => {
    const target = PREVIEW_SECTION_STEP[section];
    if (target) setStep(target);
  }, []);
  const previewMedia = useCallback((kind, value) => {
    setLocalMedia((current) => value
      ? { ...current, [kind]: value }
      : Object.fromEntries(Object.entries(current).filter(([key]) => key !== kind)));
  }, []);

  const missing = new Set(serverState.missing_fields || []);
  const canPublish =
    [...missing].every((field) => field === "accuracy_confirmed") &&
    config.accuracy_confirmed;
  const current = STEPS[step - 1];
  return (
    <div className="mx-auto max-w-[1800px] space-y-4">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#496B5A]">
            Website Studio
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#263238]">
            Manage your agency website
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#637079]">
            Edit on the left and see the real website immediately. Changes stay
            private until you explicitly publish.
          </p>
        </div>
        <div className="text-right">
          <p
            className={`text-xs font-semibold ${saveState === "error" ? "text-red-600" : saveState === "conflict" ? "text-amber-700" : "text-[#637079]"}`}
          >
            {saveState === "saving"
              ? "Saving…"
              : saveState === "error"
                ? "Save failed — retry available"
                : saveState === "conflict"
                  ? "This website was updated elsewhere."
                : "All changes saved"}
          </p>
          {saveState === "conflict" && <button type="button" onClick={reloadLatest} className="mt-1 text-xs font-semibold text-[#496B5A] underline">Reload latest changes</button>}
          <div className="mt-2 flex items-center gap-3">
            <span className="text-sm font-semibold text-[#496B5A]">
              {serverState.completion_percentage || 0}% complete
            </span>
            <div className="h-2 w-36 overflow-hidden rounded-full bg-[#DDE5E3]">
              <div
                className="h-full bg-[#496B5A]"
                style={{ width: `${serverState.completion_percentage || 0}%` }}
              />
            </div>
          </div>
        </div>
      </header>
      <DomainSettings />
      <details className="rounded-xl border border-[#DDE5E3] bg-white px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-[#263238]">Publish history</summary>
        <div className="mt-3 grid gap-2">
          {versionsQuery.isLoading && <p className="text-xs text-[#637079]">Loading published versions…</p>}
          {(versionsQuery.data || []).map((version) => <div key={version.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#F8FAFA] px-3 py-2"><div><p className="text-sm font-semibold text-[#263238]">Version {version.version}{version.is_current ? " · Current" : ""}</p><p className="text-xs text-[#637079]">Published {new Date(version.published_at).toLocaleString()} by {version.published_by_name || "System"}{version.restored_from_version ? ` · Restored from v${version.restored_from_version}` : ""}</p></div>{!version.is_current && <Button type="button" variant="outlined" size="sm" disabled={restoreMutation.isPending} onClick={() => restoreMutation.mutate(version.version)}>Restore</Button>}</div>)}
          {!versionsQuery.isLoading && !(versionsQuery.data || []).length && <p className="text-xs text-[#637079]">Published versions will appear here after the first publish.</p>}
        </div>
      </details>
      <div className="flex rounded-xl border border-[#DDE5E3] bg-white p-1 xl:hidden">
        {[['edit', 'Edit website'], ['preview', 'Preview website']].map(([key, label]) => <button key={key} type="button" onClick={() => setMobilePane(key)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${mobilePane === key ? 'bg-[#496B5A] text-white' : 'text-[#637079]'}`}>{label}</button>)}
      </div>
      <div className="grid min-h-0 gap-4 xl:h-[calc(100vh-10.5rem)] xl:min-h-[720px] xl:grid-cols-[minmax(430px,40%)_minmax(0,60%)]">
        <Card padding="none" className={`${mobilePane === "preview" ? "hidden" : "flex"} min-h-[720px] flex-col overflow-hidden xl:flex xl:min-h-0`}>
          <nav className="border-b border-[#DDE5E3] p-3" aria-label="Website editor sections">
            <ol className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {STEPS.map((item, index) => {
                const number = index + 1;
                return <li key={item.title}><button type="button" onClick={() => setStep(number)} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs ${number === step ? "bg-[#eef3f0] font-semibold text-[#496B5A]" : "text-[#637079] hover:bg-[#F8FAFA]"}`}><span className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${number === step ? "bg-[#496B5A] text-white" : "bg-[#EEF2F2]"}`}>{number < (serverState.website_onboarding_step || 1) ? <Check size={11} /> : number}</span><span className="truncate">{item.title}</span></button></li>;
              })}
            </ol>
          </nav>
          <div className="border-b border-[#DDE5E3] px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#8b969d]">
              Step {step} of {STEPS.length}
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#263238]">
              {current.title}
            </h2>
            <p className="mt-1 text-sm text-[#637079]">{current.description}</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5" onFocusCapture={() => setPreviewScrollRequest((value) => value + 1)}>
            <WebsiteEditorStep
              step={step}
              form={form}
              changeConfig={changeConfig}
              copyOrganizationDetails={copyOrganizationDetails}
              applyServer={applyServer}
              serverState={serverState}
              missing={missing}
              setStep={setStep}
              previewMedia={previewMedia}
              eligibleProperties={eligibleProperties}
              propertiesLoading={propertiesQuery.isLoading}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-[#DDE5E3] px-5 py-3 sm:flex-row sm:justify-between">
            <Button
              variant="outlined"
              leftIcon={<ArrowLeft size={15} />}
              onClick={() => go(Math.max(1, step - 1))}
              disabled={step === 1 || saveMutation.isPending}
            >
              Back
            </Button>
            <div className="flex flex-wrap gap-3">
              {saveState === "error" && (
                <Button variant="outlined" onClick={() => save()}>
                  Retry save
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => save()}
                loading={saveMutation.isPending}
              >
                Save draft
              </Button>
              {step < 9 ? (
                <Button
                  rightIcon={<ArrowRight size={15} />}
                  onClick={() => go(step + 1)}
                  loading={saveMutation.isPending}
                >
                  Save & continue
                </Button>
              ) : (
                <>
                  <Button
                    leftIcon={<Rocket size={15} />}
                    onClick={publish}
                    loading={publishMutation.isPending}
                    disabled={!canPublish}
                  >
                    {serverState.is_website_published
                      ? "Update live website"
                      : "Publish website"}
                  </Button>
                  {serverState.is_website_published && (
                    <Button
                      variant="outlined"
                      onClick={() => unpublishMutation.mutate()}
                      loading={unpublishMutation.isPending}
                    >
                      Unpublish
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>
        <div className={`${mobilePane === "edit" ? "hidden" : "block"} min-h-[720px] xl:block xl:min-h-0`}>
          <WebsiteLivePreview
            payload={previewPayload}
            activeSection={activePreviewSection}
            scrollRequest={previewScrollRequest}
            device={previewMode}
            onDeviceChange={setPreviewMode}
            onSectionSelect={previewSectionSelected}
          />
        </div>
      </div>
    </div>
  );
}

function DomainSettings() {
  const queryClient = useQueryClient();
  const [domain, setDomain] = useState("");
  const query = useQuery({ queryKey: ["website-domains"], queryFn: getWebsiteDomains });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["website-domains"] });
  const claim = useMutation({
    mutationFn: claimWebsiteDomain,
    onSuccess: () => { setDomain(""); refresh(); toast.success("Domain claimed. Add the DNS records shown below."); },
    onError: (error) => toast.error(apiError(error, "Unable to claim this domain.")),
  });
  const verify = useMutation({
    mutationFn: verifyWebsiteDomain,
    onSuccess: () => { refresh(); toast.success("Domain ownership verified."); },
    onError: (error) => { refresh(); toast.error(apiError(error, "The verification record is not visible yet.")); },
  });
  const primary = useMutation({
    mutationFn: setPrimaryWebsiteDomain,
    onSuccess: () => { refresh(); toast.success("Primary website domain updated."); },
    onError: (error) => toast.error(apiError(error, "Unable to set this domain as primary.")),
  });
  const remove = useMutation({
    mutationFn: removeWebsiteDomain,
    onSuccess: () => { refresh(); toast.success("Domain removed."); },
    onError: (error) => toast.error(apiError(error, "Unable to remove this domain.")),
  });
  return (
    <details className="rounded-xl border border-[#DDE5E3] bg-white px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-[#263238]">Custom domain</summary>
      <div className="mt-4 space-y-4">
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); claim.mutate(domain); }}>
          <Input value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="agency.com" aria-label="Custom domain" />
          <Button type="submit" loading={claim.isPending} disabled={!domain.trim()}>Claim domain</Button>
        </form>
        <p className="text-xs text-[#637079]">Claiming reserves the hostname. It will not serve the website until ownership is verified and it is selected as primary.</p>
        {(query.data || []).map((item) => (
          <div key={item.id} className="rounded-xl border border-[#DDE5E3] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-semibold text-[#263238]">{item.domain}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#496B5A]">{item.is_primary ? "Verified · Primary" : item.status.replace("_", " ")}</p></div>
              <div className="flex flex-wrap gap-2">
                {item.status !== "verified" && <Button size="sm" variant="outlined" loading={verify.isPending} onClick={() => verify.mutate(item.id)}>Check verification</Button>}
                {item.status === "verified" && !item.is_primary && <Button size="sm" variant="outlined" loading={primary.isPending} onClick={() => primary.mutate(item.id)}>Set as primary</Button>}
                <Button size="sm" variant="ghost-danger" loading={remove.isPending} onClick={() => remove.mutate(item.id)}>Remove</Button>
              </div>
            </div>
            {item.status !== "verified" && <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
              {[item.verification_record, item.routing_record].map((record) => <div key={record.type} className="rounded-lg bg-[#F8FAFA] p-3"><p className="font-semibold">{record.type} record</p><p className="mt-2 break-all text-[#637079]">Host: <span className="font-mono text-[#263238]">{record.host}</span></p><p className="mt-1 break-all text-[#637079]">Value: <span className="font-mono text-[#263238]">{record.value}</span></p></div>)}
            </div>}
          </div>
        ))}
        {!query.isLoading && !(query.data || []).length && <p className="text-sm text-[#637079]">No custom domain claimed yet. Your Nexora subdomain remains the canonical website address.</p>}
      </div>
    </details>
  );
}

function WebsiteEditorStep(props) {
  const {
    step,
    form,
    changeConfig,
    copyOrganizationDetails,
    applyServer,
    serverState,
    missing,
    setStep,
    previewMedia,
    eligibleProperties,
    propertiesLoading,
  } = props;
  const c = form.website_draft_config;
  if (step === 1)
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-[#DDE5E3] bg-[#F8FAFA] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-semibold text-[#263238]">Use organization defaults</p><p className="mt-1 text-xs leading-5 text-[#637079]">Copy the current organization profile, contact details, legacy SEO and social links into this private draft. Existing matching draft fields will be replaced.</p></div>
          <Button type="button" size="sm" variant="outlined" onClick={copyOrganizationDetails}>Copy details</Button>
        </div>
        <Input
          label="Website display name"
          value={c.display_name || ""}
          onChange={(e) => changeConfig("display_name", e.target.value)}
          placeholder={form.name || "Agency name"}
          hint={`Organization name: ${form.name || "Not configured"}`}
        />
        <Textarea
          label="Agency description"
          rows={6}
          value={c.about}
          onChange={(e) => changeConfig("about", e.target.value)}
          hint={`${c.about.trim().length}/40 minimum characters`}
          required
        />
        <Input
          label="Agency tagline"
          value={c.tagline}
          onChange={(e) => changeConfig("tagline", e.target.value)}
          maxLength={120}
        />
        <Input
          label="Year established"
          type="number"
          value={c.year_established}
          onChange={(e) => changeConfig("year_established", e.target.value)}
        />
      </div>
    );
  if (step === 2)
    return (
      <div className="space-y-7">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MEDIA.map(([kind, label]) => (
            <MediaField
              key={kind}
              kind={kind}
              label={label}
              url={serverState.media_urls?.[kind]}
              onLocalPreview={(value) => previewMedia(kind, value)}
              onComplete={(data) => applyServer(data, kind)}
            />
          ))}
        </div>
        <PartnerLogosField
          paths={c.media?.partner_logos || []}
          urls={serverState.media_urls?.partner_logos || []}
          onComplete={(data) => applyServer(data, "partner_logos")}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorField
            label="Primary colour"
            value={c.primary_color}
            onChange={(value) => changeConfig("primary_color", value)}
          />
          <ColorField
            label="Secondary colour"
            value={c.secondary_color}
            onChange={(value) => changeConfig("secondary_color", value)}
          />
          <ColorField
            label="Accent colour"
            value={c.accent_color}
            onChange={(value) => changeConfig("accent_color", value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Heading font"
            value={c.heading_font}
            onChange={(value) => changeConfig("heading_font", value)}
            options={fontOptions()}
          />
          <Select
            label="Body font"
            value={c.body_font}
            onChange={(value) => changeConfig("body_font", value)}
            options={fontOptions()}
          />
        </div>
      </div>
    );
  if (step === 3)
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Public email"
          type="email"
          value={c.public_email}
          onChange={(e) => changeConfig("public_email", e.target.value)}
        />
        <Input
          label="Public phone"
          value={c.public_phone}
          onChange={(e) => changeConfig("public_phone", e.target.value)}
        />
        <Input
          label="WhatsApp"
          value={c.whatsapp_number}
          onChange={(e) => changeConfig("whatsapp_number", e.target.value)}
        />
        <Input
          label="Viber"
          value={c.viber_number}
          onChange={(e) => changeConfig("viber_number", e.target.value)}
        />
        <div className="sm:col-span-2">
          <Input
            label="Public address"
            value={c.address}
            onChange={(e) => changeConfig("address", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Service area"
            value={c.service_area}
            onChange={(e) => changeConfig("service_area", e.target.value)}
          />
        </div>
        <Input
          label="Business hours"
          value={c.business_hours}
          onChange={(e) => changeConfig("business_hours", e.target.value)}
        />
        <Input
          label="Map latitude"
          type="number"
          value={c.map_latitude ?? ""}
          onChange={(e) => changeConfig("map_latitude", e.target.value || null)}
        />
        <Input
          label="Map longitude"
          type="number"
          value={c.map_longitude ?? ""}
          onChange={(e) =>
            changeConfig("map_longitude", e.target.value || null)
          }
        />
      </div>
    );
  if (step === 4)
    return (
      <div className="space-y-4">
        <Input
          label="Hero eyebrow"
          value={c.hero_eyebrow}
          onChange={(e) => changeConfig("hero_eyebrow", e.target.value)}
        />
        <Input
          label="Main homepage headline"
          value={c.hero_title}
          onChange={(e) => changeConfig("hero_title", e.target.value)}
          required
        />
        <Textarea
          label="Homepage introduction"
          rows={4}
          value={c.hero_subtitle}
          onChange={(e) => changeConfig("hero_subtitle", e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Primary CTA label"
            value={c.hero_primary_cta_label}
            onChange={(e) =>
              changeConfig("hero_primary_cta_label", e.target.value)
            }
          />
          <Input
            label="Primary CTA destination"
            value={c.hero_primary_cta_url}
            onChange={(e) =>
              changeConfig("hero_primary_cta_url", e.target.value)
            }
          />
          <Input
            label="Secondary CTA label"
            value={c.hero_secondary_cta_label}
            onChange={(e) =>
              changeConfig("hero_secondary_cta_label", e.target.value)
            }
          />
          <Input
            label="Secondary CTA destination"
            value={c.hero_secondary_cta_url}
            onChange={(e) =>
              changeConfig("hero_secondary_cta_url", e.target.value)
            }
          />
          <Input
            label="Featured-property limit"
            type="number"
            min="1"
            max="24"
            value={c.featured_property_limit}
            onChange={(e) =>
              changeConfig("featured_property_limit", Number(e.target.value))
            }
          />
          <Select
            label="Featured-property rule"
            value={c.featured_property_mode}
            onChange={(value) => changeConfig("featured_property_mode", value)}
            options={[
              ["latest", "Latest published"],
              ["featured", "Marked featured"],
              ["manual", "Manual selection"],
            ]}
          />
        </div>
        {c.featured_property_mode === "manual" && (
          <ManualFeaturedProperties
            properties={eligibleProperties}
            loading={propertiesLoading}
            selected={c.featured_property_ids || []}
            limit={c.featured_property_limit}
            onChange={(ids) => changeConfig("featured_property_ids", ids)}
          />
        )}
        <div className="grid gap-4 border-t border-[#DDE5E3] pt-5 sm:grid-cols-2">
          <Input label="Newsletter title" value={c.newsletter_title} onChange={(e) => changeConfig("newsletter_title", e.target.value)} />
          <Input label="Newsletter description" value={c.newsletter_description} onChange={(e) => changeConfig("newsletter_description", e.target.value)} />
          <Input label="Contact CTA eyebrow" value={c.contact_cta_eyebrow} onChange={(e) => changeConfig("contact_cta_eyebrow", e.target.value)} />
          <Input label="Contact CTA title" value={c.contact_cta_title} onChange={(e) => changeConfig("contact_cta_title", e.target.value)} />
          <Input label="Contact CTA button" value={c.contact_cta_label} onChange={(e) => changeConfig("contact_cta_label", e.target.value)} />
          <Input label="Contact CTA destination" value={c.contact_cta_url} onChange={(e) => changeConfig("contact_cta_url", e.target.value)} />
          <div className="sm:col-span-2"><Textarea label="Contact CTA description" rows={3} value={c.contact_cta_subtitle} onChange={(e) => changeConfig("contact_cta_subtitle", e.target.value)} /></div>
        </div>
      </div>
    );
  if (step === 5)
    return (
      <div className="space-y-5">
        <Textarea
          label="Mission"
          rows={4}
          value={c.mission}
          onChange={(e) => changeConfig("mission", e.target.value)}
        />
        <Textarea
          label="Vision"
          rows={4}
          value={c.vision}
          onChange={(e) => changeConfig("vision", e.target.value)}
        />
        <Textarea
          label="Company story"
          rows={6}
          value={c.story}
          onChange={(e) => changeConfig("story", e.target.value)}
        />
        <Input
          label="Specialities (comma separated)"
          value={c.specialities.join(", ")}
          onChange={(e) => changeConfig("specialities", csv(e.target.value))}
        />
        <Input
          label="Areas served (comma separated)"
          value={c.areas_served.join(", ")}
          onChange={(e) => changeConfig("areas_served", csv(e.target.value))}
        />
        <ListEditor
          title="Services"
          items={c.services}
          maximum={12}
          empty={{ title: "", description: "" }}
          fields={[
            ["title", "Service title"],
            ["description", "Description", "textarea"],
          ]}
          onChange={(items) => changeConfig("services", items)}
        />
      </div>
    );
  if (step === 6)
    return (
      <div className="space-y-6">
        <ListEditor
          title="Statistics"
          maximum={6}
          items={c.statistics}
          empty={{ label: "", value: "", helper: "" }}
          fields={[
            ["label", "Label"],
            ["value", "Value"],
            ["helper", "Helper"],
          ]}
          onChange={(items) => changeConfig("statistics", items)}
        />
        <ListEditor
          title="Testimonials"
          maximum={8}
          items={c.testimonials}
          empty={{ name: "", role: "", location: "", quote: "", rating: 5 }}
          fields={[
            ["name", "Name"],
            ["role", "Role"],
            ["location", "Location"],
            ["rating", "Rating", "number"],
            ["quote", "Quote", "textarea"],
          ]}
          onChange={(items) => changeConfig("testimonials", items)}
        />
        <ListEditor
          title="Frequently asked questions"
          maximum={12}
          items={c.faqs}
          empty={{ question: "", answer: "" }}
          fields={[
            ["question", "Question"],
            ["answer", "Answer", "textarea"],
          ]}
          onChange={(items) => changeConfig("faqs", items)}
        />
      </div>
    );
  if (step === 7) return <PagesStep config={c} changeConfig={changeConfig} capabilities={serverState.template_capabilities} />;
  if (step === 8)
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["facebook_url", "Facebook"],
            ["instagram_url", "Instagram"],
            ["linkedin_url", "LinkedIn"],
            ["youtube_url", "YouTube"],
            ["tiktok_url", "TikTok"],
          ].map(([field, label]) => (
            <Input
              key={field}
              type="url"
              label={label}
              value={c[field]}
              onChange={(e) => changeConfig(field, e.target.value)}
            />
          ))}
          <Select
            label="Website language"
            value={c.language}
            onChange={(value) => changeConfig("language", value)}
            options={[
              ["en", "English"],
              ["ne", "Nepali"],
            ]}
          />
        </div>
        <Input
          label="SEO title"
          value={c.seo_title}
          onChange={(e) => changeConfig("seo_title", e.target.value)}
          maxLength={70}
          hint={`${c.seo_title.length}/70 characters`}
        />
        <Textarea
          label="SEO description"
          rows={3}
          value={c.seo_description}
          onChange={(e) => changeConfig("seo_description", e.target.value)}
          maxLength={180}
          hint={`${c.seo_description.length}/180 characters`}
        />
        <Input
          label="Open Graph title"
          value={c.og_title}
          onChange={(e) => changeConfig("og_title", e.target.value)}
        />
        <Textarea
          label="Open Graph description"
          rows={3}
          value={c.og_description}
          onChange={(e) => changeConfig("og_description", e.target.value)}
        />
        <Textarea
          label="Legal/footer text"
          rows={3}
          value={c.legal_text}
          onChange={(e) => changeConfig("legal_text", e.target.value)}
        />
        <Input
          label="Copyright text"
          value={c.copyright_text}
          onChange={(e) => changeConfig("copyright_text", e.target.value)}
        />
      </div>
    );
  return (
    <div className="space-y-6">
      <div
        className={`rounded-xl border p-5 ${serverState.is_ready_to_publish ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}
      >
        <div className="flex items-start gap-3">
          <Globe2 className="mt-0.5 text-[#496B5A]" size={21} />
          <div>
            <p className="font-semibold">
              {serverState.is_website_published
                ? "Ready to update your live website"
                : "Complete the publishing checklist"}
            </p>
            <p className="mt-1 text-sm text-[#637079]">
              Draft edits never affect the live website until Publish is
              clicked.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {Object.entries(REQUIRED).map(([key, [target, label]]) => (
          <button
            key={key}
            type="button"
            onClick={() => setStep(target)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm ${missing.has(key) ? "border-amber-200 bg-amber-50" : "border-[#DDE5E3]"}`}
          >
            <span
              className={
                missing.has(key) ? "text-amber-700" : "text-emerald-700"
              }
            >
              {missing.has(key) ? "!" : <Check size={13} />}
            </span>
            {label}
          </button>
        ))}
      </div>
      <label className="flex items-start gap-3 rounded-xl border border-[#DDE5E3] p-4 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={c.accuracy_confirmed}
          onChange={(e) => changeConfig("accuracy_confirmed", e.target.checked)}
        />
        <span>
          <strong>
            I confirm this agency-provided content is accurate and approved for
            public display.
          </strong>
          <span className="mt-1 block text-[#637079]">
            This confirmation is required every time the site is republished.
          </span>
        </span>
      </label>
      {serverState.is_website_published && (
        <a
          href={serverState.website_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 font-semibold text-[#496B5A]"
        >
          <ExternalLink size={15} />
          Open live website
        </a>
      )}
    </div>
  );
}

function PagesStep({ config, changeConfig, capabilities }) {
  const supportedPageKeys = capabilities?.supported_pages || PAGES.map(([key]) => key);
  const supportedSectionKeys = capabilities?.supported_sections || SECTIONS.map(([key]) => key);
  const supportedPages = PAGES.filter(([key]) => supportedPageKeys.includes(key));
  const supportedSections = SECTIONS.filter(([key]) => supportedSectionKeys.includes(key));
  const nav = (config.navigation.length
    ? config.navigation
    : supportedPages.filter(([key]) => config.enabled_pages[key]).map(
        ([page, label]) => ({
          page,
          label,
          url: page === "home" ? "/" : `/${page}`,
        }),
      )).filter((item) => supportedPageKeys.includes(item.page));
  function toggle(page, checked) {
    changeConfig("enabled_pages", { ...config.enabled_pages, [page]: checked });
  }
  function move(page, delta) {
    const visible = nav.filter(
      (item) => config.enabled_pages[item.page] !== false,
    );
    const index = visible.findIndex((item) => item.page === page);
    const targetItem = visible[index + delta];
    if (index < 0 || !targetItem) return;
    const next = [...nav];
    const source = next.findIndex((item) => item.page === page);
    const target = next.findIndex((item) => item.page === targetItem.page);
    [next[source], next[target]] = [next[target], next[source]];
    changeConfig("navigation", next);
  }
  function moveSection(index, delta) {
    const current = config.section_order?.length
      ? [...config.section_order]
      : supportedSections.map(([key]) => key);
    const target = index + delta;
    if (target < 0 || target >= current.length) return;
    [current[index], current[target]] = [current[target], current[index]];
    changeConfig("section_order", current);
  }
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">Enabled public pages</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {supportedPages.map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-2 rounded-lg border border-[#DDE5E3] p-3 text-sm"
            >
              <input
                type="checkbox"
                checked={config.enabled_pages[key] !== false}
                onChange={(e) => toggle(key, e.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold">Header navigation order and labels</h3>
        <div className="mt-3 space-y-2">
          {nav
            .filter((item) => config.enabled_pages[item.page] !== false)
            .map((item) => (
              <div
                key={item.page}
                className="grid items-center gap-2 rounded-lg border border-[#DDE5E3] p-2 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Input
                  value={item.label}
                  onChange={(e) =>
                    changeConfig(
                      "navigation",
                      nav.map((entry) =>
                        entry.page === item.page
                          ? { ...entry, label: e.target.value }
                          : entry,
                      ),
                    )
                  }
                />
                <Input
                  value={item.url}
                  onChange={(e) =>
                    changeConfig(
                      "navigation",
                      nav.map((entry) =>
                        entry.page === item.page
                          ? { ...entry, url: e.target.value }
                          : entry,
                      ),
                    )
                  }
                />
                <div className="flex">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => move(item.page, -1)}
                  >
                    <ArrowUp size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => move(item.page, 1)}
                  >
                    <ArrowDown size={14} />
                  </Button>
                </div>
              </div>
            ))}
        </div>
        <Button
          className="mt-3"
          size="sm"
          variant="outlined"
          onClick={() => changeConfig("footer_navigation", nav)}
        >
          Use this order in footer too
        </Button>
      </div>
      <div>
        <h3 className="font-semibold">Homepage section visibility and order</h3>
        <div className="mt-3 space-y-2">
          {(config.section_order?.length
            ? config.section_order
            : supportedSections.map(([key]) => key)
          ).map((key, index) => {
            const label = supportedSections.find(([candidate]) => candidate === key)?.[1] || key;
            return (
            <div
              key={key}
              className="flex items-center gap-2 rounded-lg border border-[#DDE5E3] p-3 text-sm"
            >
              <label className="flex min-w-0 flex-1 items-center gap-2">
              <input
                type="checkbox"
                checked={config.section_visibility[key] !== false}
                onChange={(e) =>
                  changeConfig("section_visibility", {
                    ...config.section_visibility,
                    [key]: e.target.checked,
                  })
                }
              />
              {label}
              </label>
              <Button size="sm" variant="ghost" onClick={() => moveSection(index, -1)} disabled={index === 0} aria-label={`Move ${label} up`}>
                <ArrowUp size={14} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => moveSection(index, 1)} disabled={index === config.section_order.length - 1} aria-label={`Move ${label} down`}>
                <ArrowDown size={14} />
              </Button>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

function ManualFeaturedProperties({ properties, loading, selected, limit, onChange }) {
  const chosen = selected.map((id) => ({ id, property: properties.find((item) => item.id === id) }));
  const unselected = properties.filter((property) => !selected.includes(property.id));
  function move(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= selected.length) return;
    const next = [...selected];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  return (
    <div className="rounded-xl border border-[#DDE5E3] p-4 sm:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">Manually featured properties</h3>
          <p className="mt-1 text-xs text-[#637079]">Only published, current listings are available. The order below is the website order.</p>
        </div>
        <span className="text-xs font-semibold text-[#496B5A]">{selected.length}/{limit} selected</span>
      </div>
      {loading ? <p className="mt-4 text-sm text-[#637079]">Loading eligible properties…</p> : (
        <>
          <div className="mt-4 space-y-2">
            {chosen.map(({ id, property }, index) => (
              <div key={id} className={`flex items-center gap-2 rounded-lg border p-3 ${property ? "border-[#DDE5E3] bg-[#F8FAFA]" : "border-amber-200 bg-amber-50"}`}>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#496B5A] text-xs font-bold text-white">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{property?.title || `Unavailable property #${id} — remove to save`}</span>
                <Button size="sm" variant="ghost" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${property?.title || id} up`}><ArrowUp size={14} /></Button>
                <Button size="sm" variant="ghost" onClick={() => move(index, 1)} disabled={index === chosen.length - 1} aria-label={`Move ${property?.title || id} down`}><ArrowDown size={14} /></Button>
                <Button size="sm" variant="ghost-danger" onClick={() => onChange(selected.filter((selectedId) => selectedId !== id))}>Remove</Button>
              </div>
            ))}
            {!chosen.length && <p className="rounded-lg bg-[#F8FAFA] p-3 text-sm text-[#637079]">No properties selected yet.</p>}
          </div>
          {unselected.length > 0 && selected.length < limit && (
            <label className="mt-4 block text-sm font-medium">
              Add a property
              <select
                value=""
                onChange={(event) => event.target.value && onChange([...selected, Number(event.target.value)])}
                className="mt-1 h-10 w-full rounded-lg border border-[#DDE5E3] bg-white px-3"
              >
                <option value="">Choose a published property…</option>
                {unselected.map((property) => <option key={property.id} value={property.id}>{property.title} · {property.status.replaceAll("_", " ")}</option>)}
              </select>
            </label>
          )}
          {!properties.length && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Publish and verify at least one current property before using manual selection.</p>}
        </>
      )}
    </div>
  );
}

function MediaField({ kind, label, url, onComplete, onLocalPreview }) {
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [selectedUrl, setSelectedUrl] = useState("");
  async function upload(file) {
    if (!file) return;
    setPending(true);
    setError("");
    try {
      const immediateUrl = await fileAsDataUrl(file);
      setSelectedUrl(immediateUrl);
      onLocalPreview?.(immediateUrl);
      const data = await uploadWebsiteMedia({
        kind,
        file,
        onUploadProgress: (event) =>
          setProgress(
            Math.round((event.loaded * 100) / (event.total || event.loaded)),
          ),
      });
      onComplete(data);
      setSelectedUrl("");
    } catch (requestError) {
      setError(apiError(requestError, "Upload failed."));
    } finally {
      setPending(false);
    }
  }
  async function remove() {
    setPending(true);
    try {
      setSelectedUrl("");
      onLocalPreview?.("");
      onComplete(await removeWebsiteMedia(kind));
    } catch (requestError) {
      setError(apiError(requestError, "Unable to remove image."));
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="rounded-xl border border-[#DDE5E3] p-3">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Image size={14} />
        {label}
      </p>
      <label
        className="mt-2 flex min-h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#B8C6C1] bg-[#F8FAFA]"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          upload(event.dataTransfer.files?.[0]);
        }}
      >
        {selectedUrl || url ? (
          <img
            src={selectedUrl || url}
            alt={`${label} preview`}
            className="h-32 w-full object-contain"
          />
        ) : (
          <span className="px-3 text-center text-xs text-[#637079]">
            <UploadCloud className="mx-auto mb-2" />
            Drop or choose an image
          </span>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/x-icon"
          className="hidden"
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </label>
      {pending && (
        <div className="mt-2 h-1 overflow-hidden rounded bg-[#DDE5E3]">
          <div
            className="h-full bg-[#496B5A]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {url && (
        <Button
          size="sm"
          variant="ghost-danger"
          className="mt-2"
          onClick={remove}
          loading={pending}
        >
          Remove
        </Button>
      )}
    </div>
  );
}

function PartnerLogosField({ paths, urls, onComplete }) {
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  async function upload(file) {
    if (!file) return;
    setPending(true);
    setError("");
    try {
      onComplete(
        await uploadWebsiteMedia({
          kind: "partner_logos",
          file,
          onUploadProgress: (event) =>
            setProgress(
              Math.round((event.loaded * 100) / (event.total || event.loaded)),
            ),
        }),
      );
    } catch (requestError) {
      setError(apiError(requestError, "Unable to upload partner logo."));
    } finally {
      setPending(false);
      setProgress(0);
    }
  }
  async function remove(path) {
    setPending(true);
    setError("");
    try {
      onComplete(await removeWebsiteMedia("partner_logos", path));
    } catch (requestError) {
      setError(apiError(requestError, "Unable to remove partner logo."));
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="rounded-xl border border-[#DDE5E3] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Partner and membership logos</p>
          <p className="text-xs text-[#637079]">Optional · up to 12 logos</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#496B5A] px-3 py-2 text-sm font-semibold text-[#496B5A]">
          <UploadCloud size={15} /> Add logo
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={pending || paths.length >= 12} onChange={(event) => upload(event.target.files?.[0])} />
        </label>
      </div>
      {urls.length ? <div className="mt-4 flex flex-wrap gap-3">{urls.map((url, index) => <div key={`${url}-${index}`} className="relative flex h-20 w-32 items-center justify-center rounded-lg border border-[#DDE5E3] bg-white p-2"><img src={url} alt={`Partner ${index + 1}`} className="max-h-14 max-w-full object-contain" /><button type="button" onClick={() => remove(paths[index])} disabled={pending} className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-red-600 text-white" aria-label={`Remove partner ${index + 1}`}><X size={13} /></button></div>)}</div> : <p className="mt-4 text-sm text-[#637079]">No partner logos added.</p>}
      {pending && <div className="mt-3 h-1 overflow-hidden rounded bg-[#DDE5E3]"><div className="h-full bg-[#496B5A]" style={{ width: `${progress || 35}%` }} /></div>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
function ColorField({ label, value, onChange }) {
  return (
    <label className="text-sm font-medium">
      {label}
      <div className="mt-1 flex items-center gap-3 rounded-lg border border-[#DDE5E3] p-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-9"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
        />
      </div>
    </label>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <label className="text-sm font-medium">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full rounded-lg border border-[#DDE5E3] bg-white px-3"
      >
        {options.map(([key, name]) => (
          <option key={key} value={key}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
function ListEditor({ title, items, maximum, empty, fields, onChange }) {
  function update(index, field, value) {
    onChange(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }
  return (
    <div className="rounded-xl border border-[#DDE5E3] p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-[#637079]">
            {items.length}/{maximum}
          </p>
        </div>
        <Button
          size="sm"
          variant="outlined"
          leftIcon={<Plus size={13} />}
          disabled={items.length >= maximum}
          onClick={() => onChange([...items, { ...empty }])}
        >
          Add
        </Button>
      </div>
      <div className="mt-4 space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-lg bg-[#F8FAFA] p-4 sm:grid-cols-2"
          >
            {fields.map(([field, label, type]) =>
              type === "textarea" ? (
                <div key={field} className="sm:col-span-2">
                  <Textarea
                    label={label}
                    rows={3}
                    value={item[field] || ""}
                    onChange={(e) => update(index, field, e.target.value)}
                  />
                </div>
              ) : (
                <Input
                  key={field}
                  label={label}
                  type={type || "text"}
                  value={item[field] ?? ""}
                  onChange={(e) =>
                    update(
                      index,
                      field,
                      type === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                    )
                  }
                />
              ),
            )}
            <Button
              size="sm"
              variant="ghost-danger"
              leftIcon={<Trash2 size={13} />}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
function normalizeForm(data) {
  const draft = data.website_draft_config || {};
  const supportedPages = new Set(data.template_capabilities?.supported_pages || PAGES.map(([key]) => key));
  const supportedSections = new Set(data.template_capabilities?.supported_sections || SECTIONS.map(([key]) => key));
  const enabledPages = {
    ...DEFAULT_CONFIG.enabled_pages,
    ...(draft.enabled_pages || {}),
  };
  delete enabledPages.portal;
  Object.keys(enabledPages).forEach((key) => {
    if (!supportedPages.has(key)) enabledPages[key] = false;
  });
  const sectionVisibility = {
    ...DEFAULT_CONFIG.section_visibility,
    ...(draft.section_visibility || {}),
  };
  Object.keys(sectionVisibility).forEach((key) => {
    if (!supportedSections.has(key)) sectionVisibility[key] = false;
  });
  return {
    ...data,
    website_draft_config: {
      ...DEFAULT_CONFIG,
      ...draft,
      enabled_pages: enabledPages,
      navigation: (draft.navigation || []).filter((item) => supportedPages.has(item.page)),
      footer_navigation: (draft.footer_navigation || []).filter((item) => supportedPages.has(item.page)),
      section_visibility: sectionVisibility,
      section_order: (draft.section_order || DEFAULT_CONFIG.section_order).filter((key) => supportedSections.has(key)),
      media: {
        ...DEFAULT_CONFIG.media,
        ...(draft.media || {}),
      },
    },
  };
}
function buildPreviewPayload(form, serverState, localMedia) {
  const config = form.website_draft_config || DEFAULT_CONFIG;
  const media = { ...(config.media || {}) };
  Object.entries(serverState.media_urls || {}).forEach(([key, value]) => {
    if (value) media[key] = value;
  });
  Object.entries(localMedia).forEach(([key, value]) => {
    if (value) media[key] = value;
  });
  const websiteConfig = { ...config, media };
  return {
    agency: {
      id: form.id,
      name: websiteConfig.display_name || form.name,
      slug: form.slug,
      license_number: form.license_number,
      website_config: websiteConfig,
      logo: media.logo || "",
      cover_image: media.hero_image || "",
      email: websiteConfig.public_email,
      phone: websiteConfig.public_phone,
      address: websiteConfig.address,
      business_hours: websiteConfig.business_hours,
      primary_color: websiteConfig.primary_color,
      facebook_url: websiteConfig.facebook_url,
      instagram_url: websiteConfig.instagram_url,
      linkedin_url: websiteConfig.linkedin_url,
      youtube_url: websiteConfig.youtube_url,
      tiktok_url: websiteConfig.tiktok_url,
      whatsapp_number: websiteConfig.whatsapp_number,
      viber_number: websiteConfig.viber_number,
    },
  };
}
function fileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Unable to preview this image."));
    reader.readAsDataURL(file);
  });
}
function readLocal(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && Date.now() - value.savedAt < 24 * 60 * 60 * 1000
      ? value
      : null;
  } catch {
    return null;
  }
}
function csv(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
function fontOptions() {
  return [
    ["inter", "Inter"],
    ["manrope", "Manrope"],
    ["poppins", "Poppins"],
    ["lato", "Lato"],
    ["montserrat", "Montserrat"],
    ["playfair-display", "Playfair Display"],
    ["noto-sans-devanagari", "Noto Sans Devanagari"],
  ];
}
function apiError(error, fallback) {
  const data = error.response?.data;
  if (data?.detail) return data.detail;
  const first = data && Object.values(data)[0];
  return Array.isArray(first)
    ? first[0]
    : typeof first === "string"
      ? first
      : fallback;
}
