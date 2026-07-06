/**
 * Converts a standard Google Drive sharing link into a direct, embeddable image link.
 * Supports file paths like /file/d/FILE_ID/view and query parameters like ?id=FILE_ID.
 */
export function getDirectGoogleDriveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // If it's already a direct Google user content link or not Google Drive at all, return it
  if (url.includes('lh3.googleusercontent.com')) {
    return url;
  }

  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    // 1. Match standard file view/edit path: /file/d/FILE_ID/...
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
    }
    
    // 2. Match open/uc query parameter: ?id=FILE_ID or &id=FILE_ID
    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${idParamMatch[1]}`;
    }
  }
  
  return url;
}

/**
 * Perform a fetch request and parse the response safely.
 * Returns the parsed JSON or throws a clean, descriptive error.
 */
export async function safeFetchJson<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const text = await response.text();
  
  let data: any;
  let isJson = true;
  try {
    data = JSON.parse(text);
  } catch (err) {
    isJson = false;
  }

  if (!response.ok) {
    const errorMsg = (isJson && data?.error) || text || `Server Error (${response.status})`;
    // Clean up HTML tags if any to make it readable
    const cleanMsg = errorMsg.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    // Limit error message length to keep UI clean
    const truncatedMsg = cleanMsg.length > 150 ? cleanMsg.substring(0, 150) + '...' : cleanMsg;
    throw new Error(truncatedMsg || `Terjadi kesalahan (Status ${response.status})`);
  }

  if (!isJson) {
    throw new Error('Respon dari server tidak valid (Bukan JSON). Silakan coba lagi.');
  }

  return data as T;
}

