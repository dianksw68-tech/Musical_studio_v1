/**
 * Uploads a file to Cloudinary via our backend endpoint
 * 
 * @param file The File object from an <input type="file"> event
 * @returns Object containing the Cloudinary secure_url and public_id
 */
export async function uploadToCloudinary(file: File): Promise<{ url: string; public_id: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}
