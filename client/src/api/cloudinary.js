/**
 * Uploads a file directly to Cloudinary from the browser using an unsigned preset.
 * Returns the secure URL.
 * Falls back to null if env vars are not set (local dev uses server disk).
 */
export async function uploadToCloudinary(file) {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD;
  const preset = import.meta.env.VITE_CLOUDINARY_PRESET;

  if (!cloud || !preset) return null; // local dev — let server handle it

  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', preset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: 'POST',
    body: fd,
  });

  if (!res.ok) throw new Error('Cloudinary upload failed');
  const data = await res.json();
  return data.secure_url;
}
