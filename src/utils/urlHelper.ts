/**
 * Clean and normalize Google Apps Script Web App URLs
 */
export function cleanGoogleScriptUrl(url: string): string {
  if (!url) return '';
  let clean = url.trim();
  
  // Transform Workspace Org restricted path /a/macros/<domain>/s/ to standard /macros/s/
  clean = clean.replace(/\/a\/macros\/[^\/]+\/s\//, '/macros/s/');
  
  // Replace script editor URL ending /edit with /exec
  if (clean.includes('script.google.com') && clean.includes('/edit')) {
    clean = clean.replace(/\/edit.*$/, '/exec');
  }
  
  return clean;
}
