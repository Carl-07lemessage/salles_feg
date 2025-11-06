/**
 * Converts a Google Drive sharing URL to a direct image URL
 * @param url - The image URL (can be Google Drive or regular URL)
 * @returns Direct image URL that can be used in <img> tags
 */
export function getDirectImageUrl(url: string): string {
  if (!url) return "/salle-de-r-union-moderne.jpg"

  // Check if it's a Google Drive URL
  if (url.includes("drive.google.com")) {
    // Extract file ID from various Google Drive URL formats
    let fileId = ""

    // Format: https://drive.google.com/file/d/{FILE_ID}/view
    const fileMatch = url.match(/\/file\/d\/([^/]+)/)
    if (fileMatch) {
      fileId = fileMatch[1]
    }

    // Format: https://drive.google.com/open?id={FILE_ID}
    const openMatch = url.match(/[?&]id=([^&]+)/)
    if (openMatch) {
      fileId = openMatch[1]
    }

    // Convert to direct image URL
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`
    }
  }

  // Return original URL if not a Google Drive link
  return url
}
