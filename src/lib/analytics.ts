import posthog from "posthog-js";

type EventProperties = Record<string, string | number | boolean | null | undefined>;

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

export const isAnalyticsEnabled = () => Boolean(import.meta.env.PROD && POSTHOG_KEY);

export const isPublicRoute = (pathname: string) => !pathname.startsWith("/admin");

export const initAnalytics = () => {
  if (!isAnalyticsEnabled()) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    capture_pageleave: true,
    person_profiles: "identified_only",
  });
};

export const trackEvent = (eventName: string, properties?: EventProperties) => {
  if (!isAnalyticsEnabled()) return;

  posthog.capture(eventName, properties);
};

export const trackPageView = (pathname: string, search = "") => {
  if (!isPublicRoute(pathname)) return;

  trackEvent("$pageview", {
    $current_url: `${window.location.origin}${pathname}${search}`,
    path: pathname,
  });
};
