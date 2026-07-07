// Google Analytics 4 (GA4) Integration Utility
// Handles user interactions, section visibility, scroll depth, and loading state tracking.
// Guarantees zero PII leakage and graceful degradation if GA is blocked by ad-blockers.

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

const trackedSections = new Set();
const trackedScrollDepths = new Set();

/**
 * Dynamically initializes Google Analytics 4 using the Measurement ID from environment.
 * If the Measurement ID is missing, analytics initialization is skipped completely.
 */
export function initializeAnalytics() {
  if (typeof window === 'undefined') return;
  if (!GA_MEASUREMENT_ID) {
    console.warn('VITE_GA_MEASUREMENT_ID is missing. Analytics tracking is disabled.');
    return;
  }

  // Prevent duplicate script injection
  if (document.getElementById('google-analytics-script')) return;

  // Initialize dataLayer and gtag synchronously so calls can queue immediately
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false // Manual tracking in App.jsx to avoid double-counting
  });

  // Inject the gtag script tag asynchronously
  const script = document.createElement('script');
  script.id = 'google-analytics-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

/**
 * Safely calls window.gtag if it is defined (graceful failure when GA is blocked).
 */
function safeGtag(...args) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

/**
 * Tracks the initial page view.
 */
export function trackPageView() {
  safeGtag('event', 'page_view', {
    page_path: window.location.pathname,
    page_title: document.title
  });
}

/**
 * Tracks when a specific section is viewed (only once per session per section).
 * @param {string} sectionName Capitalized name of the section (e.g. 'Hero', 'About')
 */
export function trackSectionView(sectionName) {
  const eventName = `${sectionName} Viewed`;
  if (trackedSections.has(eventName)) return;
  trackedSections.add(eventName);

  safeGtag('event', eventName, {
    event_category: 'Section View',
    event_label: eventName
  });
}

/**
 * Tracks scroll depth thresholds (25%, 50%, 75%, 100%) exactly once per session.
 * @param {number} depth Scroll depth percentage threshold
 */
export function trackScrollDepth(depth) {
  if (trackedScrollDepths.has(depth)) return;
  trackedScrollDepths.add(depth);

  safeGtag('event', 'Scroll Depth', {
    event_category: 'Engagement',
    event_action: 'Scroll',
    event_label: `${depth}%`,
    value: depth
  });
}

/**
 * Tracks session duration milestones (30s, 60s, 120s).
 * @param {number} seconds Time elapsed in seconds
 */
export function trackSessionDuration(seconds) {
  safeGtag('event', 'Session Duration', {
    event_category: 'Engagement',
    event_action: 'Time Spent',
    event_label: `${seconds}s`,
    value: seconds
  });
}

/**
 * Tracks when the resume modal is opened and viewed.
 */
export function trackResumeViewed() {
  safeGtag('event', 'Resume Viewed', {
    event_category: 'Resume',
    event_action: 'View',
    event_label: 'Resume Modal'
  });
}

/**
 * Tracks when the resume is downloaded.
 */
export function trackResumeDownload() {
  safeGtag('event', 'Resume Downloaded', {
    event_category: 'Resume',
    event_action: 'Download',
    event_label: 'Resume PDF'
  });
}

/**
 * Tracks project clicks (Open, Live Demo, GitHub Repository).
 * @param {string} projectTitle Name of the project
 * @param {string} type 'Open' | 'Live Demo' | 'GitHub Repository'
 */
export function trackProjectClick(projectTitle, type) {
  const cleanTitle = projectTitle.replace(/[^a-zA-Z0-9\s-_]/g, '').trim(); // Basic sanitization

  if (type === 'Open') {
    safeGtag('event', 'Project Opened', {
      event_category: 'Projects',
      event_action: 'Open',
      event_label: cleanTitle
    });
  } else {
    safeGtag('event', 'click', {
      event_category: 'Projects',
      event_action: `${type} Click`,
      event_label: cleanTitle
    });
  }
}

/**
 * Tracks navbar clicks.
 * @param {string} targetSection Section that was clicked
 */
export function trackNavigationClick(targetSection) {
  safeGtag('event', 'Navigation Click', {
    event_category: 'Navigation',
    event_action: 'Click',
    event_label: targetSection
  });
}

/**
 * Tracks LinkedIn link clicks.
 * @param {string} location Where the link was clicked (e.g. 'Resume Modal', 'Hero')
 */
export function trackLinkedInClick(location) {
  safeGtag('event', 'LinkedIn Click', {
    event_category: 'Contact',
    event_action: 'Click',
    event_label: location
  });
}

/**
 * Tracks GitHub link clicks.
 * @param {string} location Where the link was clicked (e.g. 'Resume Modal', 'Hero')
 */
export function trackGitHubClick(location) {
  safeGtag('event', 'GitHub Click', {
    event_category: 'Contact',
    event_action: 'Click',
    event_label: location
  });
}

/**
 * Tracks Email link clicks.
 * @param {string} location Where the link was clicked (e.g. 'Resume Modal')
 */
export function trackEmailClick(location) {
  safeGtag('event', 'Email Click', {
    event_category: 'Contact',
    event_action: 'Click',
    event_label: location
  });
}

/**
 * Tracks outbound link clicks.
 * @param {string} url Destination URL
 */
export function trackOutboundLink(url) {
  // Sanitize: strip out any query params to protect query/user token strings
  const sanitizedUrl = url.split('?')[0];

  safeGtag('event', 'click', {
    event_category: 'Outbound Link',
    event_action: 'Click',
    event_label: sanitizedUrl,
    transport_type: 'beacon'
  });
}

/**
 * Tracks when custom loading screens begin.
 */
export function trackLoadingStarted() {
  safeGtag('event', 'Loading Started', {
    event_category: 'System',
    event_action: 'Load'
  });
}

/**
 * Tracks when custom loading screens complete.
 */
export function trackLoadingCompleted() {
  safeGtag('event', 'Loading Completed', {
    event_category: 'System',
    event_action: 'Load'
  });
}
