/**
 * Object storage for media — Cloudflare R2 through the S3 API
 * (`docs/hosting/deployment-decision.md` §6.2, content model §7.3).
 *
 * The plugin is configured from the environment and falls back to Payload's
 * local-disk upload when `S3_BUCKET` is unset (dev, the merge gate and the
 * disposable-Postgres CMS verification never need object storage).
 *
 * `alwaysInsertFields: true` is deliberate: it keeps the `_objectkey` column in
 * the generated schema whether or not S3 is enabled, so the committed
 * migrations are identical in every environment. Without it, a database
 * migrated without the plugin fails at runtime with
 * `column "_objectkey" does not exist` as soon as `S3_BUCKET` is set
 * (verified in the #29 research).
 */
import type { S3StorageOptions } from "@payloadcms/storage-s3"

/** Is object storage configured for this process? */
export function isObjectStorageEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.S3_BUCKET?.trim())
}

/** Public base URL of the bucket (custom domain, no trailing slash). */
function publicBaseUrl(env: NodeJS.ProcessEnv): string {
  return (env.S3_PUBLIC_URL?.trim() ?? "").replace(/\/+$/, "")
}

/** Key of an upload inside the bucket: `prefix` folds into the object key. */
function objectKey(filename: string, prefix?: string | null): string {
  return prefix ? `${prefix}/${filename}` : filename
}

/**
 * The exact `s3Storage()` options for this environment.
 *
 * R2 specifics (deployment decision §6.2): `region: 'auto'`, `forcePathStyle`,
 * uploads through `S3_ENDPOINT`, public reads through `S3_PUBLIC_URL`; R2
 * buckets are private, so the adapter must not serve through the Payload route
 * (`disablePayloadAccessControl: true`) but generate the public CDN URL.
 */
export function s3StorageOptions(env: NodeJS.ProcessEnv = process.env): S3StorageOptions {
  const bucket = env.S3_BUCKET?.trim() ?? ""
  const baseUrl = publicBaseUrl(env)

  return {
    enabled: Boolean(bucket),
    // Constant schema in every environment — see the file header.
    alwaysInsertFields: true,
    bucket,
    collections: {
      media: {
        disablePayloadAccessControl: true,
        generateFileURL: ({ filename, prefix }) =>
          baseUrl ? `${baseUrl}/${objectKey(filename, prefix)}` : objectKey(filename, prefix),
      },
    },
    config: {
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID?.trim() ?? "",
        secretAccessKey: env.S3_SECRET_ACCESS_KEY?.trim() ?? "",
      },
      region: env.S3_REGION?.trim() || "auto",
      endpoint: env.S3_ENDPOINT?.trim() || undefined,
      forcePathStyle: true,
    },
  }
}
