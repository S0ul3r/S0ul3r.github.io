/** YouTube watch / embed / youtu.be — captures 11-char video id */
const YOUTUBE_VIDEO_ID_RE =
  /(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?[^#]*v=))([\w-]{11})/;

/**
 * @param {string | null | undefined} url
 * @returns {string | null}
 */
export function extractYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = YOUTUBE_VIDEO_ID_RE.exec(url);
  return match?.[1] ?? null;
}

/**
 * @param {string} videoId
 * @param {Record<string, string | number | boolean>} params
 * @returns {string}
 */
export function buildYouTubeEmbedUrl(videoId, params = {}) {
  const base = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    search.set(k, String(v));
  }
  const q = search.toString();
  return q ? `${base}?${q}` : base;
}
