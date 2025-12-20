/**
 * Generate SVG certificate dynamically with student and course information
 */

export interface CertificateData {
    studentName: string;
    studentAddress: string;
    courseName: string;
    instructorAddress: string;
    completionDate: string; // Format: "December 20, 2025"
    courseId: string;
}

/**
 * Generate SVG certificate as a string
 */
export function generateCertificateSVG(data: CertificateData): string {
    const svgWidth = 1200;
    const svgHeight = 900;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Gradient -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#ffed4e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffd700;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Main Background -->
  <rect width="${svgWidth}" height="${svgHeight}" fill="url(#bgGradient)"/>
  
  <!-- Border -->
  <rect x="40" y="40" width="${svgWidth - 80}" height="${svgHeight - 80}" 
        fill="none" stroke="url(#borderGradient)" stroke-width="8" rx="15"/>
  <rect x="60" y="60" width="${svgWidth - 120}" height="${svgHeight - 120}" 
        fill="none" stroke="#ffffff" stroke-width="2" rx="10"/>
  
  <!-- Decorative Elements -->
  <circle cx="600" cy="100" r="40" fill="#ffffff" opacity="0.1"/>
  <circle cx="200" cy="800" r="30" fill="#ffffff" opacity="0.1"/>
  <circle cx="1000" cy="700" r="35" fill="#ffffff" opacity="0.1"/>
  
  <!-- Header -->
  <text x="600" y="150" font-family="Georgia, serif" font-size="48" 
        font-weight="bold" fill="#ffffff" text-anchor="middle">
    CERTIFICATE
  </text>
  <text x="600" y="190" font-family="Arial, sans-serif" font-size="24" 
        fill="#ffffff" text-anchor="middle" opacity="0.9">
    OF COMPLETION
  </text>
  
  <!-- Decorative Line -->
  <line x1="350" y1="220" x2="850" y2="220" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
  
  <!-- Main Content -->
  <text x="600" y="280" font-family="Arial, sans-serif" font-size="20" 
        fill="#ffffff" text-anchor="middle" opacity="0.8">
    This is to certify that
  </text>
  
  <!-- Student Name -->
  <text x="600" y="350" font-family="Georgia, serif" font-size="42" 
        font-weight="bold" fill="#ffd700" text-anchor="middle">
    ${escapeXml(data.studentName)}
  </text>
  
  <!-- Student Address -->
  <text x="600" y="390" font-family="Monaco, monospace" font-size="14" 
        fill="#ffffff" text-anchor="middle" opacity="0.7">
    ${data.studentAddress}
  </text>
  
  <!-- Course Name -->
  <text x="600" y="460" font-family="Arial, sans-serif" font-size="20" 
        fill="#ffffff" text-anchor="middle" opacity="0.8">
    has successfully completed the course
  </text>
  
  <text x="600" y="520" font-family="Georgia, serif" font-size="36" 
        font-weight="bold" fill="#ffffff" text-anchor="middle">
    ${escapeXml(data.courseName)}
  </text>
  
  <!-- Bottom Section -->
  <text x="600" y="600" font-family="Arial, sans-serif" font-size="18" 
        fill="#ffffff" text-anchor="middle" opacity="0.8">
    Issued on ${data.completionDate}
  </text>
  
  <!-- Instructor -->
  <text x="300" y="720" font-family="Arial, sans-serif" font-size="16" 
        fill="#ffffff" text-anchor="middle" opacity="0.8">
    Instructor
  </text>
  <line x1="200" y1="735" x2="400" y2="735" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  <text x="300" y="760" font-family="Monaco, monospace" font-size="12" 
        fill="#ffffff" text-anchor="middle" opacity="0.7">
    ${data.instructorAddress.substring(0, 10)}...
  </text>
  
  <!-- Course ID -->
  <text x="900" y="720" font-family="Arial, sans-serif" font-size="16" 
        fill="#ffffff" text-anchor="middle" opacity="0.8">
    Course ID
  </text>
  <line x1="800" y1="735" x2="1000" y2="735" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  <text x="900" y="760" font-family="Monaco, monospace" font-size="14" 
        fill="#ffffff" text-anchor="middle" opacity="0.7">
    #${data.courseId}
  </text>
  
  <!-- Footer Badge -->
  <circle cx="600" cy="820" r="30" fill="#ffd700"/>
  <text x="600" y="830" font-family="Arial, sans-serif" font-size="24" 
        font-weight="bold" fill="#764ba2" text-anchor="middle">
    ✓
  </text>
</svg>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Convert SVG string to Blob
 */
export function svgToBlob(svgString: string): Blob {
    return new Blob([svgString], { type: 'image/svg+xml' });
}

/**
 * Convert SVG Blob to File for IPFS upload
 */
export function svgToFile(svgString: string, filename: string = 'certificate.svg'): File {
    const blob = svgToBlob(svgString);
    return new File([blob], filename, { type: 'image/svg+xml' });
}
