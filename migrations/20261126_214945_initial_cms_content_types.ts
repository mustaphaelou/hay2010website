import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('developer', 'owner', 'editor');
  CREATE TYPE "public"."enum_media_rights_basis" AS ENUM('company-owned', 'licensed', 'client-supplied', 'unknown');
  CREATE TYPE "public"."enum_media_rights_status" AS ENUM('pending', 'cleared', 'revoked');
  CREATE TYPE "public"."enum_media_release_status" AS ENUM('not-required', 'pending', 'cleared');
  CREATE TYPE "public"."enum_domaines_slug" AS ENUM('eclairage-public', 'installations-electriques', 'infrastructures-reseaux-electriques', 'energies-renouvelables', 'fourniture-equipements');
  CREATE TYPE "public"."enum_domaines_contact_cta_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum_domaines_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__domaines_v_version_slug" AS ENUM('eclairage-public', 'installations-electriques', 'infrastructures-reseaux-electriques', 'energies-renouvelables', 'fourniture-equipements');
  CREATE TYPE "public"."enum__domaines_v_version_contact_cta_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum__domaines_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_jobs_opening_status" AS ENUM('open', 'closed');
  CREATE TYPE "public"."enum_jobs_contract_type" AS ENUM('CDI', 'CDD', 'Stage', 'Alternance');
  CREATE TYPE "public"."enum_jobs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__jobs_v_version_opening_status" AS ENUM('open', 'closed');
  CREATE TYPE "public"."enum__jobs_v_version_contract_type" AS ENUM('CDI', 'CDD', 'Stage', 'Alternance');
  CREATE TYPE "public"."enum__jobs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_communiques_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__communiques_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_homepage_hero_primary_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum_homepage_hero_secondary_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum_homepage_references_teaser_link_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum_homepage_contact_cta_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum_homepage_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_v_version_hero_primary_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum__homepage_v_version_hero_secondary_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum__homepage_v_version_references_teaser_link_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum__homepage_v_version_contact_cta_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum__homepage_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_entreprise_contact_cta_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum_entreprise_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__entreprise_v_version_contact_cta_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum__entreprise_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_metiers_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__metiers_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_realisations_hero_primary_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum_realisations_hero_secondary_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum_realisations_intro_link_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum_realisations_references_link_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum_realisations_contact_cta_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum_realisations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__realisations_v_version_hero_primary_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum__realisations_v_version_hero_secondary_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum__realisations_v_version_intro_link_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum__realisations_v_version_references_link_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum__realisations_v_version_contact_cta_cta_target" AS ENUM('accueil', 'a-propos', 'domaines-activite', 'realisations', 'contact', 'carrieres', 'contact-mailto', 'references-mailto');
  CREATE TYPE "public"."enum__realisations_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_contact_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__contact_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_carrieres_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__carrieres_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_actualites_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__actualites_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"credit" varchar,
  	"rights_basis" "enum_media_rights_basis" DEFAULT 'unknown' NOT NULL,
  	"rights_status" "enum_media_rights_status" DEFAULT 'pending' NOT NULL,
  	"rights_reference" varchar,
  	"people_present" boolean DEFAULT false,
  	"release_status" "enum_media_release_status" DEFAULT 'not-required',
  	"release_reference" varchar,
  	"client_marks" boolean DEFAULT false,
  	"client_permission" boolean DEFAULT false,
  	"client_permission_ref" varchar,
  	"trademark_permission" boolean DEFAULT false,
  	"trademark_permission_ref" varchar,
  	"taken_at" timestamp(3) with time zone,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "domaines_prestations_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "domaines_methods_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "domaines" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" "enum_domaines_slug",
  	"title" varchar,
  	"summary" varchar,
  	"presentation_title" varchar,
  	"presentation_body" jsonb,
  	"prestations_title" varchar,
  	"methods_title" varchar,
  	"contact_cta_title" varchar,
  	"contact_cta_body" jsonb,
  	"contact_cta_cta_label" varchar,
  	"contact_cta_cta_target" "enum_domaines_contact_cta_cta_target",
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_domaines_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_domaines_v_version_prestations_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_domaines_v_version_methods_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_domaines_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" "enum__domaines_v_version_slug",
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_presentation_title" varchar,
  	"version_presentation_body" jsonb,
  	"version_prestations_title" varchar,
  	"version_methods_title" varchar,
  	"version_contact_cta_title" varchar,
  	"version_contact_cta_body" jsonb,
  	"version_contact_cta_cta_label" varchar,
  	"version_contact_cta_cta_target" "enum__domaines_v_version_contact_cta_cta_target",
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__domaines_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "projects_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"location" varchar,
  	"year" numeric,
  	"client_name" varchar,
  	"client_permission" boolean DEFAULT false,
  	"client_permission_ref" varchar,
  	"scope" varchar,
  	"challenge" jsonb,
  	"solution" jsonb,
  	"results" jsonb,
  	"cover_id" integer,
  	"people_release" boolean DEFAULT false,
  	"people_release_ref" varchar,
  	"testimonial" varchar,
  	"testimonial_permission" boolean DEFAULT false,
  	"testimonial_permission_ref" varchar,
  	"evidence_reference" varchar,
  	"featured" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"domaines_id" integer
  );
  
  CREATE TABLE "_projects_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_location" varchar,
  	"version_year" numeric,
  	"version_client_name" varchar,
  	"version_client_permission" boolean DEFAULT false,
  	"version_client_permission_ref" varchar,
  	"version_scope" varchar,
  	"version_challenge" jsonb,
  	"version_solution" jsonb,
  	"version_results" jsonb,
  	"version_cover_id" integer,
  	"version_people_release" boolean DEFAULT false,
  	"version_people_release_ref" varchar,
  	"version_testimonial" varchar,
  	"version_testimonial_permission" boolean DEFAULT false,
  	"version_testimonial_permission_ref" varchar,
  	"version_evidence_reference" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"domaines_id" integer
  );
  
  CREATE TABLE "jobs_responsibilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "jobs_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"opening_status" "enum_jobs_opening_status" DEFAULT 'open',
  	"contract_type" "enum_jobs_contract_type",
  	"location" varchar,
  	"department" varchar,
  	"experience_level" varchar,
  	"summary" varchar,
  	"description" jsonb,
  	"posted_at" timestamp(3) with time zone,
  	"closing_at" timestamp(3) with time zone,
  	"application_email" varchar DEFAULT 'contact@hay2010.ma',
  	"featured" boolean DEFAULT false,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_jobs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_jobs_v_version_responsibilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_jobs_v_version_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_jobs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_opening_status" "enum__jobs_v_version_opening_status" DEFAULT 'open',
  	"version_contract_type" "enum__jobs_v_version_contract_type",
  	"version_location" varchar,
  	"version_department" varchar,
  	"version_experience_level" varchar,
  	"version_summary" varchar,
  	"version_description" jsonb,
  	"version_posted_at" timestamp(3) with time zone,
  	"version_closing_at" timestamp(3) with time zone,
  	"version_application_email" varchar DEFAULT 'contact@hay2010.ma',
  	"version_featured" boolean DEFAULT false,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__jobs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "communiques" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"published_at" timestamp(3) with time zone,
  	"cover_id" integer,
  	"body" jsonb,
  	"legal_reviewed" boolean DEFAULT false,
  	"legal_review_ref" varchar,
  	"featured" boolean DEFAULT false,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_communiques_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_communiques_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_cover_id" integer,
  	"version_body" jsonb,
  	"version_legal_reviewed" boolean DEFAULT false,
  	"version_legal_review_ref" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__communiques_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"domaines_id" integer,
  	"projects_id" integer,
  	"jobs_id" integer,
  	"communiques_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "homepage_engagements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar,
  	"hero_subtitle" varchar,
  	"hero_image_id" integer,
  	"hero_primary_cta_label" varchar,
  	"hero_primary_cta_target" "enum_homepage_hero_primary_cta_target",
  	"hero_secondary_cta_label" varchar,
  	"hero_secondary_cta_target" "enum_homepage_hero_secondary_cta_target",
  	"intro_body" jsonb,
  	"services_band_title" varchar,
  	"references_teaser_fallback_text" jsonb,
  	"references_teaser_body" varchar,
  	"references_teaser_link_label" varchar,
  	"references_teaser_link_target" "enum_homepage_references_teaser_link_target",
  	"contact_cta_title" varchar,
  	"contact_cta_body" jsonb,
  	"contact_cta_cta_label" varchar,
  	"contact_cta_cta_target" "enum_homepage_contact_cta_cta_target",
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_og_image_id" integer,
  	"_status" "enum_homepage_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_homepage_v_version_engagements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_title" varchar,
  	"version_hero_subtitle" varchar,
  	"version_hero_image_id" integer,
  	"version_hero_primary_cta_label" varchar,
  	"version_hero_primary_cta_target" "enum__homepage_v_version_hero_primary_cta_target",
  	"version_hero_secondary_cta_label" varchar,
  	"version_hero_secondary_cta_target" "enum__homepage_v_version_hero_secondary_cta_target",
  	"version_intro_body" jsonb,
  	"version_services_band_title" varchar,
  	"version_references_teaser_fallback_text" jsonb,
  	"version_references_teaser_body" varchar,
  	"version_references_teaser_link_label" varchar,
  	"version_references_teaser_link_target" "enum__homepage_v_version_references_teaser_link_target",
  	"version_contact_cta_title" varchar,
  	"version_contact_cta_body" jsonb,
  	"version_contact_cta_cta_label" varchar,
  	"version_contact_cta_cta_target" "enum__homepage_v_version_contact_cta_cta_target",
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version__status" "enum__homepage_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "entreprise_chapters_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "entreprise_chapters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "entreprise" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar,
  	"intro_body" jsonb,
  	"contact_cta_title" varchar,
  	"contact_cta_body" jsonb,
  	"contact_cta_cta_label" varchar,
  	"contact_cta_cta_target" "enum_entreprise_contact_cta_cta_target",
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_og_image_id" integer,
  	"_status" "enum_entreprise_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_entreprise_v_version_chapters_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_entreprise_v_version_chapters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_entreprise_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_title" varchar,
  	"version_intro_body" jsonb,
  	"version_contact_cta_title" varchar,
  	"version_contact_cta_body" jsonb,
  	"version_contact_cta_cta_label" varchar,
  	"version_contact_cta_cta_target" "enum__entreprise_v_version_contact_cta_cta_target",
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version__status" "enum__entreprise_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "metiers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro_body" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_og_image_id" integer,
  	"_status" "enum_metiers_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_metiers_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar,
  	"version_intro_body" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version__status" "enum__metiers_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "realisations_references_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "realisations_documentation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "realisations_method_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "realisations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_title" varchar,
  	"hero_subtitle" varchar,
  	"hero_primary_cta_label" varchar,
  	"hero_primary_cta_target" "enum_realisations_hero_primary_cta_target",
  	"hero_secondary_cta_label" varchar,
  	"hero_secondary_cta_target" "enum_realisations_hero_secondary_cta_target",
  	"intro_body" jsonb,
  	"intro_link_label" varchar,
  	"intro_link_target" "enum_realisations_intro_link_target",
  	"services_band_title" varchar,
  	"qualifications_title" varchar,
  	"references_title" varchar,
  	"references_fallback_text" jsonb,
  	"references_body" varchar,
  	"references_link_label" varchar,
  	"references_link_target" "enum_realisations_references_link_target",
  	"documentation_title" varchar,
  	"method_title" varchar,
  	"contact_cta_title" varchar,
  	"contact_cta_body" jsonb,
  	"contact_cta_cta_label" varchar,
  	"contact_cta_cta_target" "enum_realisations_contact_cta_cta_target",
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_og_image_id" integer,
  	"_status" "enum_realisations_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_realisations_v_version_references_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_realisations_v_version_documentation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_realisations_v_version_method_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_realisations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar,
  	"version_hero_title" varchar,
  	"version_hero_subtitle" varchar,
  	"version_hero_primary_cta_label" varchar,
  	"version_hero_primary_cta_target" "enum__realisations_v_version_hero_primary_cta_target",
  	"version_hero_secondary_cta_label" varchar,
  	"version_hero_secondary_cta_target" "enum__realisations_v_version_hero_secondary_cta_target",
  	"version_intro_body" jsonb,
  	"version_intro_link_label" varchar,
  	"version_intro_link_target" "enum__realisations_v_version_intro_link_target",
  	"version_services_band_title" varchar,
  	"version_qualifications_title" varchar,
  	"version_references_title" varchar,
  	"version_references_fallback_text" jsonb,
  	"version_references_body" varchar,
  	"version_references_link_label" varchar,
  	"version_references_link_target" "enum__realisations_v_version_references_link_target",
  	"version_documentation_title" varchar,
  	"version_method_title" varchar,
  	"version_contact_cta_title" varchar,
  	"version_contact_cta_body" jsonb,
  	"version_contact_cta_cta_label" varchar,
  	"version_contact_cta_cta_target" "enum__realisations_v_version_contact_cta_cta_target",
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version__status" "enum__realisations_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "contact_sections_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "contact_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "contact" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro_body" jsonb,
  	"contact_cta_title" varchar,
  	"contact_cta_body" jsonb,
  	"sections_title" varchar,
  	"steps_title" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_og_image_id" integer,
  	"_status" "enum_contact_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_contact_v_version_sections_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_v_version_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar,
  	"version_intro_body" jsonb,
  	"version_contact_cta_title" varchar,
  	"version_contact_cta_body" jsonb,
  	"version_sections_title" varchar,
  	"version_steps_title" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version__status" "enum__contact_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "carrieres" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar,
  	"hero_subtitle" varchar,
  	"intro_body" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_og_image_id" integer,
  	"_status" "enum_carrieres_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_carrieres_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_title" varchar,
  	"version_hero_subtitle" varchar,
  	"version_intro_body" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version__status" "enum__carrieres_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "actualites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar,
  	"hero_subtitle" varchar,
  	"intro_body" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_og_image_id" integer,
  	"_status" "enum_actualites_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_actualites_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_title" varchar,
  	"version_hero_subtitle" varchar,
  	"version_intro_body" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version__status" "enum__actualites_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "domaines_prestations_items" ADD CONSTRAINT "domaines_prestations_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."domaines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "domaines_methods_items" ADD CONSTRAINT "domaines_methods_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."domaines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "domaines" ADD CONSTRAINT "domaines_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_domaines_v_version_prestations_items" ADD CONSTRAINT "_domaines_v_version_prestations_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_domaines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_domaines_v_version_methods_items" ADD CONSTRAINT "_domaines_v_version_methods_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_domaines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_domaines_v" ADD CONSTRAINT "_domaines_v_parent_id_domaines_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."domaines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_domaines_v" ADD CONSTRAINT "_domaines_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_domaines_fk" FOREIGN KEY ("domaines_id") REFERENCES "public"."domaines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_domaines_fk" FOREIGN KEY ("domaines_id") REFERENCES "public"."domaines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs_responsibilities" ADD CONSTRAINT "jobs_responsibilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs_requirements" ADD CONSTRAINT "jobs_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v_version_responsibilities" ADD CONSTRAINT "_jobs_v_version_responsibilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_jobs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v_version_requirements" ADD CONSTRAINT "_jobs_v_version_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_jobs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_parent_id_jobs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "communiques" ADD CONSTRAINT "communiques_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "communiques" ADD CONSTRAINT "communiques_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_communiques_v" ADD CONSTRAINT "_communiques_v_parent_id_communiques_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."communiques"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_communiques_v" ADD CONSTRAINT "_communiques_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_communiques_v" ADD CONSTRAINT "_communiques_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_domaines_fk" FOREIGN KEY ("domaines_id") REFERENCES "public"."domaines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_communiques_fk" FOREIGN KEY ("communiques_id") REFERENCES "public"."communiques"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_engagements" ADD CONSTRAINT "homepage_engagements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_engagements" ADD CONSTRAINT "_homepage_v_version_engagements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entreprise_chapters_items" ADD CONSTRAINT "entreprise_chapters_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."entreprise_chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "entreprise_chapters" ADD CONSTRAINT "entreprise_chapters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."entreprise"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "entreprise" ADD CONSTRAINT "entreprise_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_entreprise_v_version_chapters_items" ADD CONSTRAINT "_entreprise_v_version_chapters_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_entreprise_v_version_chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_entreprise_v_version_chapters" ADD CONSTRAINT "_entreprise_v_version_chapters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_entreprise_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_entreprise_v" ADD CONSTRAINT "_entreprise_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "metiers" ADD CONSTRAINT "metiers_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_metiers_v" ADD CONSTRAINT "_metiers_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "realisations_references_items" ADD CONSTRAINT "realisations_references_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."realisations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "realisations_documentation_items" ADD CONSTRAINT "realisations_documentation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."realisations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "realisations_method_items" ADD CONSTRAINT "realisations_method_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."realisations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "realisations" ADD CONSTRAINT "realisations_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_realisations_v_version_references_items" ADD CONSTRAINT "_realisations_v_version_references_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_realisations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_realisations_v_version_documentation_items" ADD CONSTRAINT "_realisations_v_version_documentation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_realisations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_realisations_v_version_method_items" ADD CONSTRAINT "_realisations_v_version_method_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_realisations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_realisations_v" ADD CONSTRAINT "_realisations_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_sections_items" ADD CONSTRAINT "contact_sections_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_steps_items" ADD CONSTRAINT "contact_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact" ADD CONSTRAINT "contact_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_v_version_sections_items" ADD CONSTRAINT "_contact_v_version_sections_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_v_version_steps_items" ADD CONSTRAINT "_contact_v_version_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_v" ADD CONSTRAINT "_contact_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "carrieres" ADD CONSTRAINT "carrieres_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_carrieres_v" ADD CONSTRAINT "_carrieres_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "actualites" ADD CONSTRAINT "actualites_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_actualites_v" ADD CONSTRAINT "_actualites_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_rights_status_idx" ON "media" USING btree ("rights_status");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "domaines_prestations_items_order_idx" ON "domaines_prestations_items" USING btree ("_order");
  CREATE INDEX "domaines_prestations_items_parent_id_idx" ON "domaines_prestations_items" USING btree ("_parent_id");
  CREATE INDEX "domaines_methods_items_order_idx" ON "domaines_methods_items" USING btree ("_order");
  CREATE INDEX "domaines_methods_items_parent_id_idx" ON "domaines_methods_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "domaines_slug_idx" ON "domaines" USING btree ("slug");
  CREATE INDEX "domaines_seo_seo_og_image_idx" ON "domaines" USING btree ("seo_og_image_id");
  CREATE INDEX "domaines_updated_at_idx" ON "domaines" USING btree ("updated_at");
  CREATE INDEX "domaines_created_at_idx" ON "domaines" USING btree ("created_at");
  CREATE INDEX "domaines__status_idx" ON "domaines" USING btree ("_status");
  CREATE INDEX "_domaines_v_version_prestations_items_order_idx" ON "_domaines_v_version_prestations_items" USING btree ("_order");
  CREATE INDEX "_domaines_v_version_prestations_items_parent_id_idx" ON "_domaines_v_version_prestations_items" USING btree ("_parent_id");
  CREATE INDEX "_domaines_v_version_methods_items_order_idx" ON "_domaines_v_version_methods_items" USING btree ("_order");
  CREATE INDEX "_domaines_v_version_methods_items_parent_id_idx" ON "_domaines_v_version_methods_items" USING btree ("_parent_id");
  CREATE INDEX "_domaines_v_parent_idx" ON "_domaines_v" USING btree ("parent_id");
  CREATE INDEX "_domaines_v_version_version_slug_idx" ON "_domaines_v" USING btree ("version_slug");
  CREATE INDEX "_domaines_v_version_seo_version_seo_og_image_idx" ON "_domaines_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_domaines_v_version_version_updated_at_idx" ON "_domaines_v" USING btree ("version_updated_at");
  CREATE INDEX "_domaines_v_version_version_created_at_idx" ON "_domaines_v" USING btree ("version_created_at");
  CREATE INDEX "_domaines_v_version_version__status_idx" ON "_domaines_v" USING btree ("version__status");
  CREATE INDEX "_domaines_v_created_at_idx" ON "_domaines_v" USING btree ("created_at");
  CREATE INDEX "_domaines_v_updated_at_idx" ON "_domaines_v" USING btree ("updated_at");
  CREATE INDEX "_domaines_v_latest_idx" ON "_domaines_v" USING btree ("latest");
  CREATE INDEX "projects_gallery_order_idx" ON "projects_gallery" USING btree ("_order");
  CREATE INDEX "projects_gallery_parent_id_idx" ON "projects_gallery" USING btree ("_parent_id");
  CREATE INDEX "projects_gallery_image_idx" ON "projects_gallery" USING btree ("image_id");
  CREATE INDEX "projects_cover_idx" ON "projects" USING btree ("cover_id");
  CREATE INDEX "projects_seo_seo_og_image_idx" ON "projects" USING btree ("seo_og_image_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_domaines_id_idx" ON "projects_rels" USING btree ("domaines_id");
  CREATE INDEX "_projects_v_version_gallery_order_idx" ON "_projects_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_projects_v_version_gallery_parent_id_idx" ON "_projects_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_gallery_image_idx" ON "_projects_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_cover_idx" ON "_projects_v" USING btree ("version_cover_id");
  CREATE INDEX "_projects_v_version_seo_version_seo_og_image_idx" ON "_projects_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_domaines_id_idx" ON "_projects_v_rels" USING btree ("domaines_id");
  CREATE INDEX "jobs_responsibilities_order_idx" ON "jobs_responsibilities" USING btree ("_order");
  CREATE INDEX "jobs_responsibilities_parent_id_idx" ON "jobs_responsibilities" USING btree ("_parent_id");
  CREATE INDEX "jobs_requirements_order_idx" ON "jobs_requirements" USING btree ("_order");
  CREATE INDEX "jobs_requirements_parent_id_idx" ON "jobs_requirements" USING btree ("_parent_id");
  CREATE INDEX "jobs_seo_seo_og_image_idx" ON "jobs" USING btree ("seo_og_image_id");
  CREATE INDEX "jobs_updated_at_idx" ON "jobs" USING btree ("updated_at");
  CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");
  CREATE INDEX "jobs__status_idx" ON "jobs" USING btree ("_status");
  CREATE INDEX "_jobs_v_version_responsibilities_order_idx" ON "_jobs_v_version_responsibilities" USING btree ("_order");
  CREATE INDEX "_jobs_v_version_responsibilities_parent_id_idx" ON "_jobs_v_version_responsibilities" USING btree ("_parent_id");
  CREATE INDEX "_jobs_v_version_requirements_order_idx" ON "_jobs_v_version_requirements" USING btree ("_order");
  CREATE INDEX "_jobs_v_version_requirements_parent_id_idx" ON "_jobs_v_version_requirements" USING btree ("_parent_id");
  CREATE INDEX "_jobs_v_parent_idx" ON "_jobs_v" USING btree ("parent_id");
  CREATE INDEX "_jobs_v_version_seo_version_seo_og_image_idx" ON "_jobs_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_jobs_v_version_version_updated_at_idx" ON "_jobs_v" USING btree ("version_updated_at");
  CREATE INDEX "_jobs_v_version_version_created_at_idx" ON "_jobs_v" USING btree ("version_created_at");
  CREATE INDEX "_jobs_v_version_version__status_idx" ON "_jobs_v" USING btree ("version__status");
  CREATE INDEX "_jobs_v_created_at_idx" ON "_jobs_v" USING btree ("created_at");
  CREATE INDEX "_jobs_v_updated_at_idx" ON "_jobs_v" USING btree ("updated_at");
  CREATE INDEX "_jobs_v_latest_idx" ON "_jobs_v" USING btree ("latest");
  CREATE INDEX "communiques_cover_idx" ON "communiques" USING btree ("cover_id");
  CREATE INDEX "communiques_seo_seo_og_image_idx" ON "communiques" USING btree ("seo_og_image_id");
  CREATE INDEX "communiques_updated_at_idx" ON "communiques" USING btree ("updated_at");
  CREATE INDEX "communiques_created_at_idx" ON "communiques" USING btree ("created_at");
  CREATE INDEX "communiques__status_idx" ON "communiques" USING btree ("_status");
  CREATE INDEX "_communiques_v_parent_idx" ON "_communiques_v" USING btree ("parent_id");
  CREATE INDEX "_communiques_v_version_version_cover_idx" ON "_communiques_v" USING btree ("version_cover_id");
  CREATE INDEX "_communiques_v_version_seo_version_seo_og_image_idx" ON "_communiques_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_communiques_v_version_version_updated_at_idx" ON "_communiques_v" USING btree ("version_updated_at");
  CREATE INDEX "_communiques_v_version_version_created_at_idx" ON "_communiques_v" USING btree ("version_created_at");
  CREATE INDEX "_communiques_v_version_version__status_idx" ON "_communiques_v" USING btree ("version__status");
  CREATE INDEX "_communiques_v_created_at_idx" ON "_communiques_v" USING btree ("created_at");
  CREATE INDEX "_communiques_v_updated_at_idx" ON "_communiques_v" USING btree ("updated_at");
  CREATE INDEX "_communiques_v_latest_idx" ON "_communiques_v" USING btree ("latest");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_domaines_id_idx" ON "payload_locked_documents_rels" USING btree ("domaines_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("jobs_id");
  CREATE INDEX "payload_locked_documents_rels_communiques_id_idx" ON "payload_locked_documents_rels" USING btree ("communiques_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "homepage_engagements_order_idx" ON "homepage_engagements" USING btree ("_order");
  CREATE INDEX "homepage_engagements_parent_id_idx" ON "homepage_engagements" USING btree ("_parent_id");
  CREATE INDEX "homepage_hero_hero_image_idx" ON "homepage" USING btree ("hero_image_id");
  CREATE INDEX "homepage_seo_seo_og_image_idx" ON "homepage" USING btree ("seo_og_image_id");
  CREATE INDEX "homepage__status_idx" ON "homepage" USING btree ("_status");
  CREATE INDEX "_homepage_v_version_engagements_order_idx" ON "_homepage_v_version_engagements" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_engagements_parent_id_idx" ON "_homepage_v_version_engagements" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_hero_version_hero_image_idx" ON "_homepage_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_homepage_v_version_seo_version_seo_og_image_idx" ON "_homepage_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_homepage_v_version_version__status_idx" ON "_homepage_v" USING btree ("version__status");
  CREATE INDEX "_homepage_v_created_at_idx" ON "_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_v_latest_idx" ON "_homepage_v" USING btree ("latest");
  CREATE INDEX "entreprise_chapters_items_order_idx" ON "entreprise_chapters_items" USING btree ("_order");
  CREATE INDEX "entreprise_chapters_items_parent_id_idx" ON "entreprise_chapters_items" USING btree ("_parent_id");
  CREATE INDEX "entreprise_chapters_order_idx" ON "entreprise_chapters" USING btree ("_order");
  CREATE INDEX "entreprise_chapters_parent_id_idx" ON "entreprise_chapters" USING btree ("_parent_id");
  CREATE INDEX "entreprise_seo_seo_og_image_idx" ON "entreprise" USING btree ("seo_og_image_id");
  CREATE INDEX "entreprise__status_idx" ON "entreprise" USING btree ("_status");
  CREATE INDEX "_entreprise_v_version_chapters_items_order_idx" ON "_entreprise_v_version_chapters_items" USING btree ("_order");
  CREATE INDEX "_entreprise_v_version_chapters_items_parent_id_idx" ON "_entreprise_v_version_chapters_items" USING btree ("_parent_id");
  CREATE INDEX "_entreprise_v_version_chapters_order_idx" ON "_entreprise_v_version_chapters" USING btree ("_order");
  CREATE INDEX "_entreprise_v_version_chapters_parent_id_idx" ON "_entreprise_v_version_chapters" USING btree ("_parent_id");
  CREATE INDEX "_entreprise_v_version_seo_version_seo_og_image_idx" ON "_entreprise_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_entreprise_v_version_version__status_idx" ON "_entreprise_v" USING btree ("version__status");
  CREATE INDEX "_entreprise_v_created_at_idx" ON "_entreprise_v" USING btree ("created_at");
  CREATE INDEX "_entreprise_v_updated_at_idx" ON "_entreprise_v" USING btree ("updated_at");
  CREATE INDEX "_entreprise_v_latest_idx" ON "_entreprise_v" USING btree ("latest");
  CREATE INDEX "metiers_seo_seo_og_image_idx" ON "metiers" USING btree ("seo_og_image_id");
  CREATE INDEX "metiers__status_idx" ON "metiers" USING btree ("_status");
  CREATE INDEX "_metiers_v_version_seo_version_seo_og_image_idx" ON "_metiers_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_metiers_v_version_version__status_idx" ON "_metiers_v" USING btree ("version__status");
  CREATE INDEX "_metiers_v_created_at_idx" ON "_metiers_v" USING btree ("created_at");
  CREATE INDEX "_metiers_v_updated_at_idx" ON "_metiers_v" USING btree ("updated_at");
  CREATE INDEX "_metiers_v_latest_idx" ON "_metiers_v" USING btree ("latest");
  CREATE INDEX "realisations_references_items_order_idx" ON "realisations_references_items" USING btree ("_order");
  CREATE INDEX "realisations_references_items_parent_id_idx" ON "realisations_references_items" USING btree ("_parent_id");
  CREATE INDEX "realisations_documentation_items_order_idx" ON "realisations_documentation_items" USING btree ("_order");
  CREATE INDEX "realisations_documentation_items_parent_id_idx" ON "realisations_documentation_items" USING btree ("_parent_id");
  CREATE INDEX "realisations_method_items_order_idx" ON "realisations_method_items" USING btree ("_order");
  CREATE INDEX "realisations_method_items_parent_id_idx" ON "realisations_method_items" USING btree ("_parent_id");
  CREATE INDEX "realisations_seo_seo_og_image_idx" ON "realisations" USING btree ("seo_og_image_id");
  CREATE INDEX "realisations__status_idx" ON "realisations" USING btree ("_status");
  CREATE INDEX "_realisations_v_version_references_items_order_idx" ON "_realisations_v_version_references_items" USING btree ("_order");
  CREATE INDEX "_realisations_v_version_references_items_parent_id_idx" ON "_realisations_v_version_references_items" USING btree ("_parent_id");
  CREATE INDEX "_realisations_v_version_documentation_items_order_idx" ON "_realisations_v_version_documentation_items" USING btree ("_order");
  CREATE INDEX "_realisations_v_version_documentation_items_parent_id_idx" ON "_realisations_v_version_documentation_items" USING btree ("_parent_id");
  CREATE INDEX "_realisations_v_version_method_items_order_idx" ON "_realisations_v_version_method_items" USING btree ("_order");
  CREATE INDEX "_realisations_v_version_method_items_parent_id_idx" ON "_realisations_v_version_method_items" USING btree ("_parent_id");
  CREATE INDEX "_realisations_v_version_seo_version_seo_og_image_idx" ON "_realisations_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_realisations_v_version_version__status_idx" ON "_realisations_v" USING btree ("version__status");
  CREATE INDEX "_realisations_v_created_at_idx" ON "_realisations_v" USING btree ("created_at");
  CREATE INDEX "_realisations_v_updated_at_idx" ON "_realisations_v" USING btree ("updated_at");
  CREATE INDEX "_realisations_v_latest_idx" ON "_realisations_v" USING btree ("latest");
  CREATE INDEX "contact_sections_items_order_idx" ON "contact_sections_items" USING btree ("_order");
  CREATE INDEX "contact_sections_items_parent_id_idx" ON "contact_sections_items" USING btree ("_parent_id");
  CREATE INDEX "contact_steps_items_order_idx" ON "contact_steps_items" USING btree ("_order");
  CREATE INDEX "contact_steps_items_parent_id_idx" ON "contact_steps_items" USING btree ("_parent_id");
  CREATE INDEX "contact_seo_seo_og_image_idx" ON "contact" USING btree ("seo_og_image_id");
  CREATE INDEX "contact__status_idx" ON "contact" USING btree ("_status");
  CREATE INDEX "_contact_v_version_sections_items_order_idx" ON "_contact_v_version_sections_items" USING btree ("_order");
  CREATE INDEX "_contact_v_version_sections_items_parent_id_idx" ON "_contact_v_version_sections_items" USING btree ("_parent_id");
  CREATE INDEX "_contact_v_version_steps_items_order_idx" ON "_contact_v_version_steps_items" USING btree ("_order");
  CREATE INDEX "_contact_v_version_steps_items_parent_id_idx" ON "_contact_v_version_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_contact_v_version_seo_version_seo_og_image_idx" ON "_contact_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_contact_v_version_version__status_idx" ON "_contact_v" USING btree ("version__status");
  CREATE INDEX "_contact_v_created_at_idx" ON "_contact_v" USING btree ("created_at");
  CREATE INDEX "_contact_v_updated_at_idx" ON "_contact_v" USING btree ("updated_at");
  CREATE INDEX "_contact_v_latest_idx" ON "_contact_v" USING btree ("latest");
  CREATE INDEX "carrieres_seo_seo_og_image_idx" ON "carrieres" USING btree ("seo_og_image_id");
  CREATE INDEX "carrieres__status_idx" ON "carrieres" USING btree ("_status");
  CREATE INDEX "_carrieres_v_version_seo_version_seo_og_image_idx" ON "_carrieres_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_carrieres_v_version_version__status_idx" ON "_carrieres_v" USING btree ("version__status");
  CREATE INDEX "_carrieres_v_created_at_idx" ON "_carrieres_v" USING btree ("created_at");
  CREATE INDEX "_carrieres_v_updated_at_idx" ON "_carrieres_v" USING btree ("updated_at");
  CREATE INDEX "_carrieres_v_latest_idx" ON "_carrieres_v" USING btree ("latest");
  CREATE INDEX "actualites_seo_seo_og_image_idx" ON "actualites" USING btree ("seo_og_image_id");
  CREATE INDEX "actualites__status_idx" ON "actualites" USING btree ("_status");
  CREATE INDEX "_actualites_v_version_seo_version_seo_og_image_idx" ON "_actualites_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_actualites_v_version_version__status_idx" ON "_actualites_v" USING btree ("version__status");
  CREATE INDEX "_actualites_v_created_at_idx" ON "_actualites_v" USING btree ("created_at");
  CREATE INDEX "_actualites_v_updated_at_idx" ON "_actualites_v" USING btree ("updated_at");
  CREATE INDEX "_actualites_v_latest_idx" ON "_actualites_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "domaines_prestations_items" CASCADE;
  DROP TABLE "domaines_methods_items" CASCADE;
  DROP TABLE "domaines" CASCADE;
  DROP TABLE "_domaines_v_version_prestations_items" CASCADE;
  DROP TABLE "_domaines_v_version_methods_items" CASCADE;
  DROP TABLE "_domaines_v" CASCADE;
  DROP TABLE "projects_gallery" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_version_gallery" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "jobs_responsibilities" CASCADE;
  DROP TABLE "jobs_requirements" CASCADE;
  DROP TABLE "jobs" CASCADE;
  DROP TABLE "_jobs_v_version_responsibilities" CASCADE;
  DROP TABLE "_jobs_v_version_requirements" CASCADE;
  DROP TABLE "_jobs_v" CASCADE;
  DROP TABLE "communiques" CASCADE;
  DROP TABLE "_communiques_v" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "homepage_engagements" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "_homepage_v_version_engagements" CASCADE;
  DROP TABLE "_homepage_v" CASCADE;
  DROP TABLE "entreprise_chapters_items" CASCADE;
  DROP TABLE "entreprise_chapters" CASCADE;
  DROP TABLE "entreprise" CASCADE;
  DROP TABLE "_entreprise_v_version_chapters_items" CASCADE;
  DROP TABLE "_entreprise_v_version_chapters" CASCADE;
  DROP TABLE "_entreprise_v" CASCADE;
  DROP TABLE "metiers" CASCADE;
  DROP TABLE "_metiers_v" CASCADE;
  DROP TABLE "realisations_references_items" CASCADE;
  DROP TABLE "realisations_documentation_items" CASCADE;
  DROP TABLE "realisations_method_items" CASCADE;
  DROP TABLE "realisations" CASCADE;
  DROP TABLE "_realisations_v_version_references_items" CASCADE;
  DROP TABLE "_realisations_v_version_documentation_items" CASCADE;
  DROP TABLE "_realisations_v_version_method_items" CASCADE;
  DROP TABLE "_realisations_v" CASCADE;
  DROP TABLE "contact_sections_items" CASCADE;
  DROP TABLE "contact_steps_items" CASCADE;
  DROP TABLE "contact" CASCADE;
  DROP TABLE "_contact_v_version_sections_items" CASCADE;
  DROP TABLE "_contact_v_version_steps_items" CASCADE;
  DROP TABLE "_contact_v" CASCADE;
  DROP TABLE "carrieres" CASCADE;
  DROP TABLE "_carrieres_v" CASCADE;
  DROP TABLE "actualites" CASCADE;
  DROP TABLE "_actualites_v" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_media_rights_basis";
  DROP TYPE "public"."enum_media_rights_status";
  DROP TYPE "public"."enum_media_release_status";
  DROP TYPE "public"."enum_domaines_slug";
  DROP TYPE "public"."enum_domaines_contact_cta_cta_target";
  DROP TYPE "public"."enum_domaines_status";
  DROP TYPE "public"."enum__domaines_v_version_slug";
  DROP TYPE "public"."enum__domaines_v_version_contact_cta_cta_target";
  DROP TYPE "public"."enum__domaines_v_version_status";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum_jobs_opening_status";
  DROP TYPE "public"."enum_jobs_contract_type";
  DROP TYPE "public"."enum_jobs_status";
  DROP TYPE "public"."enum__jobs_v_version_opening_status";
  DROP TYPE "public"."enum__jobs_v_version_contract_type";
  DROP TYPE "public"."enum__jobs_v_version_status";
  DROP TYPE "public"."enum_communiques_status";
  DROP TYPE "public"."enum__communiques_v_version_status";
  DROP TYPE "public"."enum_homepage_hero_primary_cta_target";
  DROP TYPE "public"."enum_homepage_hero_secondary_cta_target";
  DROP TYPE "public"."enum_homepage_references_teaser_link_target";
  DROP TYPE "public"."enum_homepage_contact_cta_cta_target";
  DROP TYPE "public"."enum_homepage_status";
  DROP TYPE "public"."enum__homepage_v_version_hero_primary_cta_target";
  DROP TYPE "public"."enum__homepage_v_version_hero_secondary_cta_target";
  DROP TYPE "public"."enum__homepage_v_version_references_teaser_link_target";
  DROP TYPE "public"."enum__homepage_v_version_contact_cta_cta_target";
  DROP TYPE "public"."enum__homepage_v_version_status";
  DROP TYPE "public"."enum_entreprise_contact_cta_cta_target";
  DROP TYPE "public"."enum_entreprise_status";
  DROP TYPE "public"."enum__entreprise_v_version_contact_cta_cta_target";
  DROP TYPE "public"."enum__entreprise_v_version_status";
  DROP TYPE "public"."enum_metiers_status";
  DROP TYPE "public"."enum__metiers_v_version_status";
  DROP TYPE "public"."enum_realisations_hero_primary_cta_target";
  DROP TYPE "public"."enum_realisations_hero_secondary_cta_target";
  DROP TYPE "public"."enum_realisations_intro_link_target";
  DROP TYPE "public"."enum_realisations_references_link_target";
  DROP TYPE "public"."enum_realisations_contact_cta_cta_target";
  DROP TYPE "public"."enum_realisations_status";
  DROP TYPE "public"."enum__realisations_v_version_hero_primary_cta_target";
  DROP TYPE "public"."enum__realisations_v_version_hero_secondary_cta_target";
  DROP TYPE "public"."enum__realisations_v_version_intro_link_target";
  DROP TYPE "public"."enum__realisations_v_version_references_link_target";
  DROP TYPE "public"."enum__realisations_v_version_contact_cta_cta_target";
  DROP TYPE "public"."enum__realisations_v_version_status";
  DROP TYPE "public"."enum_contact_status";
  DROP TYPE "public"."enum__contact_v_version_status";
  DROP TYPE "public"."enum_carrieres_status";
  DROP TYPE "public"."enum__carrieres_v_version_status";
  DROP TYPE "public"."enum_actualites_status";
  DROP TYPE "public"."enum__actualites_v_version_status";`)
}
