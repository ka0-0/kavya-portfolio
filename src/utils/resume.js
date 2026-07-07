import { trackResumeDownload } from './analytics';

/**
 * Generates the mock portfolio CV text document, triggers a local browser download,
 * and records the event in Google Analytics.
 */
export function downloadResume() {
  // Track download event
  trackResumeDownload();

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
  
  // Revoke object URL after click to release browser memory
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}
