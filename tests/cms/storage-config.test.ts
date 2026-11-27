/**
 * Object-storage configuration checks (no database, no network).
 *
 * The S3 plugin must map the deployment-decision §6.2 environment to Cloudflare
 * R2, and fall back to Payload's local disk when `S3_BUCKET` is unset. The
 * schema must NOT depend on that switch: `alwaysInsertFields` keeps
 * `_objectkey` in every environment, which is what makes the committed
 * migration identical in dev (local disk), CI and production (R2).
 */
import { describe, expect, it } from "vitest"

import { isObjectStorageEnabled, s3StorageOptions } from "../../lib/payload/storage"

/** Minimal `collection` argument of `generateFileURL` (it is unused by our mapper). */
const COLLECTION = {} as never

describe("object storage configuration", () => {
  it("falls back to the local disk without S3_BUCKET", () => {
    const options = s3StorageOptions({})
    expect(isObjectStorageEnabled({})).toBe(false)
    expect(options.enabled).toBe(false)
    // Constant schema in every environment (see lib/payload/storage.ts).
    expect(options.alwaysInsertFields).toBe(true)
  })

  it("maps the R2 environment to the S3 plugin", () => {
    const env = {
      S3_BUCKET: "hay2010-media",
      S3_PUBLIC_URL: "https://media.hay2010.ma/",
      S3_ENDPOINT: "https://account.r2.cloudflarestorage.com",
      S3_REGION: "auto",
      S3_ACCESS_KEY_ID: "access-key",
      S3_SECRET_ACCESS_KEY: "secret-key",
    }
    const options = s3StorageOptions(env)

    expect(isObjectStorageEnabled(env)).toBe(true)
    expect(options.enabled).toBe(true)
    expect(options.bucket).toBe("hay2010-media")
    expect(options.config.region).toBe("auto")
    expect(options.config.forcePathStyle).toBe(true)
    expect(options.config.endpoint).toBe("https://account.r2.cloudflarestorage.com")
    expect(options.config.credentials).toEqual({
      accessKeyId: "access-key",
      secretAccessKey: "secret-key",
    })

    const media = options.collections.media
    if (!media || media === true) throw new Error("media storage options must be configured")
    expect(media.disablePayloadAccessControl).toBe(true)
    expect(
      media.generateFileURL?.({ collection: COLLECTION, filename: "photo.png", prefix: "hero" })
    ).toBe("https://media.hay2010.ma/hero/photo.png")
  })
})
