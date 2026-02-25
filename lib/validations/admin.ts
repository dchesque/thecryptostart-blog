import { z } from "zod";
import { PostStatus, ContentType, Difficulty, SchemaType, AdDensity } from "@prisma/client";

export const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    description: z.string().optional().nullable(),
    icon: z.string().default("📚"),
    color: z.string().optional().nullable(),
    order: z.coerce.number().int().default(0)
});

export const authorSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    bio: z.string().optional().nullable(),
    avatar: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
    socialLinks: z.any().optional().nullable()
});

export const postSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    excerpt: z.string().min(1, "Excerpt is required"),
    content: z.string().min(1, "Content is required"),
    body: z.string().optional().nullable(),
    featuredImageUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
    featuredImageAlt: z.string().optional().nullable(),
    featuredImageWidth: z.coerce.number().int().optional().nullable(),
    featuredImageHeight: z.coerce.number().int().optional().nullable(),
    status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT),
    authorId: z.string().min(1, "Author is required"),
    categoryId: z.string().min(1, "Category is required"),

    // SEO Block
    seoTitle: z.string().optional().nullable(),
    seoDescription: z.string().optional().nullable(),
    seoImageUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
    seoNoindex: z.boolean().default(false),
    targetKeyword: z.string().optional().nullable(),
    secondaryKeywords: z.array(z.string()).default([]),

    // Classifications
    isFeatured: z.boolean().default(false),
    contentType: z.nativeEnum(ContentType).default(ContentType.ARTICLE),
    difficulty: z.nativeEnum(Difficulty).default(Difficulty.BEGINNER),
    schemaType: z.nativeEnum(SchemaType).default(SchemaType.ARTICLE),

    canonicalUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
    tags: z.array(z.string()).default([]),

    // Structured Data
    faq: z.any().optional().nullable(),
    howToSteps: z.any().optional().nullable(),
    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),

    // Linking
    relatedPostsSlugs: z.array(z.string()).default([]),
    pillarPageSlug: z.string().optional().nullable(),
    internalLinks: z.any().optional().nullable(),

    // Monetization
    adDensity: z.nativeEnum(AdDensity).default(AdDensity.NORMAL),
    monetizationDisabled: z.boolean().default(false),
    sponsoredBy: z.string().optional().nullable()
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type AuthorInput = z.infer<typeof authorSchema>;
export type PostInput = z.infer<typeof postSchema>;
