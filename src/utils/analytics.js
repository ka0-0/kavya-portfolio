// Google Analytics 4 (GA4) Utility Module

/**
 * Safely calls window.gtag if it is initialized, preventing console errors
 * if Google Analytics is blocked by an ad-blocker or fails to load.
 */
function safeGtag(...args) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag(...args);
    } catch {
      // Fail silently and let the portfolio function normally
    }
  }
}

/**
 * Tracks a page view event.
 * @param {string} pagePath
 * @param {string} pageTitle
 */
export function trackPageView(pagePath = window.location.pathname, pageTitle = document.title) {
  safeGtag('event', 'page_view', {
    page_title: pageTitle,
    page_location: window.location.href,
    page_path: pagePath
  });
}

/**
 * Tracks when a specific section is viewed (only once per session for each section).
 */
const trackedSections = new Set();
export function trackSectionView(sectionName) {
  // Strip any potential personal info from sectionName
  const cleanSection = String(sectionName).replace(/[^\w\s-]/g, '').trim();
  const eventName = `${cleanSection.toLowerCase().replace(/[\s-]+/g, '_')}_viewed`;
  
  if (trackedSections.has(eventName)) return;
  trackedSections.add(eventName);

  safeGtag('event', eventName, {
    event_category: 'Section View',
    event_label: eventName
  });
}

/**
 * Tracks scroll depth thresholds (only once per threshold per session).
 */
const trackedScrollDepths = new Set();
export function trackScrollDepth(depth) {
  if (trackedScrollDepths.has(depth)) return;
  trackedScrollDepths.add(depth);

  safeGtag('event', 'scroll_depth', {
    event_category: 'Engagement',
    event_action: 'Scroll',
    event_label: `${depth}%`,
    value: depth
  });
}

/**
 * Tracks engagement duration milestones.
 */
export function trackSessionDuration(seconds) {
  safeGtag('event', 'session_duration', {
    event_category: 'Engagement',
    event_action: 'Time Spent',
    event_label: `${seconds}s`,
    value: seconds
  });
}

/**
 * Tracks resume modal viewer open events.
 */
export function trackResumeViewed() {
  safeGtag('event', 'resume_viewed', {
    event_category: 'Resume',
    event_action: 'View',
    event_label: 'Resume Modal'
  });
}

/**
 * Tracks resume download event.
 */
export function trackResumeDownload() {
  safeGtag('event', 'resume_downloaded', {
    event_category: 'Resume',
    event_action: 'Download',
    event_label: 'Resume PDF'
  });
}

/**
 * Tracks project interaction clicks (Open, Live Demo, GitHub Repository).
 * Privacy Safe: Only contains project title label (static metadata).
 */
export function trackProjectClick(projectTitle, interactionType) {
  const cleanTitle = String(projectTitle).replace(/[^\w\s-]/g, '').trim();
  const cleanType = String(interactionType).replace(/[^\w\s-]/g, '').trim();

  if (cleanType === 'Open') {
    safeGtag('event', 'project_opened', {
      event_category: 'Projects',
      event_action: 'Open',
      event_label: cleanTitle
    });
  } else {
    safeGtag('event', 'click', {
      event_category: 'Projects',
      event_action: `${cleanType} Click`,
      event_label: cleanTitle
    });
  }
}

/**
 * Tracks contact button clicks.
 * Privacy Safe: Never sends the actual email addresses or personal input.
 * Only sends the location context of the click (e.g. 'Resume Modal' or 'Navbar').
 */
export function trackEmailClick(locationContext) {
  safeGtag('event', 'email_click', {
    event_category: 'Contact',
    event_action: 'Click',
    event_label: String(locationContext).replace(/[^\w\s-]/g, '').trim()
  });
}

export function trackLinkedInClick(locationContext) {
  safeGtag('event', 'linkedin_click', {
    event_category: 'Contact',
    event_action: 'Click',
    event_label: String(locationContext).replace(/[^\w\s-]/g, '').trim()
  });
}

export function trackGitHubClick(locationContext) {
  safeGtag('event', 'github_click', {
    event_category: 'Contact',
    event_action: 'Click',
    event_label: String(locationContext).replace(/[^\w\s-]/g, '').trim()
  });
}

/**
 * Tracks navigation menu clicks.
 */
export function trackNavigationClick(targetSection) {
  safeGtag('event', 'navigation_click', {
    event_category: 'Navigation',
    event_action: 'Click',
    event_label: String(targetSection).replace(/[^\w\s-]/g, '').trim()
  });
}

/**
 * Tracks outbound link clicks automatically.
 */
export function trackOutboundLink(url) {
  // Privacy protection: clean URL query parameters to avoid sending potential personal codes/tokens
  try {
    const parsedUrl = new URL(url);
    const cleanUrl = `${parsedUrl.origin}${parsedUrl.pathname}`;
    safeGtag('event', 'click', {
      event_category: 'Outbound Link',
      event_action: 'Click',
      event_label: cleanUrl,
      transport_type: 'beacon'
    });
  } catch {
    // If not a valid URL structure, send the raw string safely truncated/cleansed
    const cleanUrl = String(url).split('?')[0].replace(/[^\w\s-/:.]/g, '').substring(0, 100);
    safeGtag('event', 'click', {
      event_category: 'Outbound Link',
      event_action: 'Click',
      event_label: cleanUrl,
      transport_type: 'beacon'
    });
  }
}

/**
 * Tracks loading screen events.
 */
export function trackLoadingStarted() {
  safeGtag('event', 'loading_started', {
    event_category: 'System',
    event_action: 'Start'
  });
}

export function trackLoadingCompleted() {
  safeGtag('event', 'loading_completed', {
    event_category: 'System',
    event_action: 'Complete'
  });
}

/**
 * Custom button tracking wrapper.
 */
export function trackButtonClick(buttonName, category = 'Button Click', label = '') {
  safeGtag('event', 'click', {
    event_category: category,
    event_action: 'Click',
    event_label: label || buttonName
  });
}
