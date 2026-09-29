import { trackResumeDownload } from './analytics';

/**
 * Triggers the download of Kavya Makhan's Resume PDF document, recording the event in analytics.
 */
export function downloadResume() {
  // Track download event
  trackResumeDownload();

  const link = document.createElement('a');
  link.href = '/KAVYA%20MAKHAN%20RESUME.pdf';
  link.download = 'KAVYA MAKHAN RESUME.pdf';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
