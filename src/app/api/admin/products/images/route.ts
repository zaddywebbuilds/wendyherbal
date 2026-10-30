import { NextResponse } from "next/server";
import {
  saveImage, sniffImageType, imageUploadAvailable, imageStorageKind,
  ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES,
} from "@/lib/image-store";

/**
 * Takes a photograph from the admin product form, straight from a phone
 * camera or the gallery, and returns the URL to store on the product.
 *
 * The file is checked rather than trusted: size first, then the declared type,
 * then the actual bytes. These routes sit behind one shared password, so a
 * forged content type should not be enough to put arbitrary content on the
 * shop.
 */
export async function POST(req: Request) {
  if (!imageUploadAvailable()) {
    return NextResponse.json(
      {
        error:
          "Photo upload is not set up for this deployment. Add a Blob store in Vercel and set " +
          "BLOB_READ_WRITE_TOKEN, then uploading starts working.",
      },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Could not read the upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was attached." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "That file is empty." }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_BYTES) {
    const mb = Math.round(MAX_IMAGE_BYTES / (1024 * 1024));
    return NextResponse.json(
      { error: `That photograph is larger than ${mb}MB. Please use a smaller one.` },
      { status: 413 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniffImageType(bytes);

  if (!sniffed) {
    return NextResponse.json(
      { error: "That file is not a photograph we can use. Use a JPEG, PNG, WebP or AVIF." },
      { status: 415 }
    );
  }

  if (!ALLOWED_IMAGE_TYPES[sniffed]) {
    return NextResponse.json({ error: `Unsupported image type: ${sniffed}.` }, { status: 415 });
  }

  try {
    // The sniffed type wins over the declared one.
    const url = await saveImage(bytes, sniffed, file.name || "photo");
    return NextResponse.json({ url, storage: imageStorageKind() }, { status: 201 });
  } catch (err) {
    console.error("Image upload failed:", err);
    return NextResponse.json({ error: "Could not save the photograph. Please try again." }, { status: 500 });
  }
}
