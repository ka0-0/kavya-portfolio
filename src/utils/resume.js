// Shared Resume Utility Module
// Centralizes resume download generation and fires respective GA4 tracking.

import { trackResumeDownload } from './analytics';

/**
 * Triggers the browser-native file download for the mock portfolio resume
 * and logs the Resume Downloaded event in Google Analytics.
 */
export function downloadResume() {
  // Fire analytics event
  trackResumeDownload();

  // Compile mock resume text content
  const resumeText = `KAVYA MAKHAN
Mechanical Engineer & AI Algorithms Developer
Location: India | GitHub: github.com/kavya-makhan | Email: kavya.makhan@example.com

EDUCATION:
- Bachelor of Mechanical Engineering, Minor in Artificial Intelligence
  GPA: 3.9/4.0 | Focus: Cyber-Physical Systems, Robotic Controller Optimization

TECHNICAL SKILLS:
- Languages & Frameworks: Python (PyTorch, TensorFlow, FastAPI), ROS2, C++, React.js, Tailwind
- Mechanical Systems: SolidWorks (CSWP - Certified Professional, Finite Element Analysis (FEA), CFD)

SELECTED PROJECTS:
1. Cybernetic Neural Robotic Controller:
   Designed a neural network to stabilize a 3-DOF arm; modeled in SolidWorks, simulated in ROS2.
2. High-Performance Thermal Dissipation Rack:
   FEA/CFD analysis of heat sink assemblies in SolidWorks for high-power desktop AI servers.
3. Autonomous Pathfinder Obstacle Avoidance Drone:
   Path planning algorithms implemented on embedded ARM microcontrollers.

CERTIFICATIONS:
- AWS Certified Machine Learning - Specialty
- Certified SolidWorks Professional (CSWP)`;

  const blob = new Blob([resumeText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Kavya_Makhan_Resume.txt';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
