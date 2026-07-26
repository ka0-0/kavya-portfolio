import { trackResumeDownload } from './analytics';

/**
 * Triggers the download of Kavya Makhan's CV PDF document, recording the event in analytics.
 */
export function downloadResume() {
  // Track download event
  trackResumeDownload();

  const link = document.createElement('a');
  link.href = '/KAVYA_MAKHAN_CV.pdf';
  link.download = 'KAVYA_MAKHAN_CV.pdf';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
