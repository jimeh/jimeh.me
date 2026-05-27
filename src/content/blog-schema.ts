import { z } from "astro/zod";
import { isReservedBlogArchiveSlug } from "../utils/blog-archive";
import { BLOG_POST_SLUG_PATTERN } from "../utils/blog-route";

/** Accepts string or YAML-parsed Date, normalizes to YYYY-MM-DD. */
export const blogRuntimeDate = z
  .union([z.iso.date(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v));

/** JSON Schema friendly date field for blog frontmatter authoring. */
export const blogFrontmatterDate = z.iso
  .date()
  .describe("Date in YYYY-MM-DD format.");

const percentageStr = z
  .string()
  .regex(/^\d+(?:\.\d+)?%$/, "Must be a percentage like '90%'")
  .describe("Percentage value like '90%'.");
const thumbnailFrame = z
  .union([
    z.boolean(),
    z.strictObject({
      light: z
        .boolean()
        .default(false)
        .describe("Draw the thumbnail frame in light mode."),
      dark: z
        .boolean()
        .default(false)
        .describe("Draw the thumbnail frame in dark mode."),
    }),
  ])
  .describe(
    "Draw the thumbnail inside a bordered background. Use a boolean for " +
      "both themes, or light/dark keys for color-mode-specific framing.",
  );

const tagSlug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .describe("Lowercase slug string.");

const postSlug = z
  .string()
  .regex(BLOG_POST_SLUG_PATTERN)
  .describe("Lowercase post slug. Slash-separated segments are allowed.");

interface BlogFrontmatterSchemaOptions<ImageSchema extends z.ZodType> {
  date: z.ZodType<string>;
  image: () => ImageSchema;
}

/** Creates the blog frontmatter schema used by Astro and JSON Schema output. */
export function createBlogFrontmatterSchema<ImageSchema extends z.ZodType>({
  date,
  image,
}: BlogFrontmatterSchemaOptions<ImageSchema>) {
  const imageSchema = image();
  const imageSource = z.union([
    imageSchema,
    z.strictObject({
      light: imageSchema,
      dark: imageSchema.optional(),
    }),
  ]);

  return z
    .strictObject({
      title: z.string().describe("Post title."),
      description: z
        .string()
        .describe("Short summary for listings and metadata."),
      date,
      slug: postSlug.describe("Canonical URL slug."),
      updatedDate: date
        .optional()
        .describe("Later revision date; must not be earlier than date."),
      tags: z.array(tagSlug).optional().describe("Blog tag slugs."),
      archive: z
        .union([
          z.boolean(),
          z
            .string()
            .min(1)
            .refine((archive) => !isReservedBlogArchiveSlug(archive), {
              message: "Archive name uses a reserved route slug.",
            }),
        ])
        .optional()
        .describe("Archive marker, or archive source name."),
      image: z
        .strictObject({
          src: imageSource.describe(
            "Local relative image, remote HTTPS image, or light/dark sources.",
          ),
          alt: z
            .string()
            .default("")
            .describe("Accessible text; empty string is allowed."),
          caption: z.string().optional().describe("Visible caption."),
          size: z
            .union([z.enum(["default", "wide", "full"]), percentageStr])
            .default("default")
            .describe("Rendered image width."),
          position: z
            .enum(["center", "left", "right"])
            .default("center")
            .describe("Image alignment or float position."),
          flush: z
            .boolean()
            .optional()
            .describe(
              "Remove top margin so the image sits flush with content.",
            ),
          noLightbox: z
            .boolean()
            .optional()
            .describe("Disable the Fancybox lightbox for this image."),
          gallery: z
            .string()
            .optional()
            .describe("Lightbox gallery group name."),
          aspect: z
            .string()
            .optional()
            .describe("CSS aspect-ratio for the displayed image box."),
          objectPosition: z
            .string()
            .default("center")
            .describe("CSS object-position when aspect is set."),
          credit: z
            .strictObject({
              text: z.string().describe("Attribution text."),
              href: z.url().optional().describe("Attribution URL."),
              position: z
                .enum(["left", "center", "right"])
                .default("center")
                .describe("Credit line alignment."),
            })
            .optional()
            .describe("Attribution / credit line shown below the caption."),
          hidden: z
            .boolean()
            .default(false)
            .describe("Hide from automatic rendering at the top of the post."),
          thumbnail: z
            .strictObject({
              src: imageSource
                .optional()
                .describe("Thumbnail-specific source; defaults to image.src."),
              fill: z
                .enum(["fill", "fit"])
                .default("fill")
                .describe("How the thumbnail fills the thumbnail container."),
              objectPosition: z
                .string()
                .optional()
                .describe("CSS object-position for cropped thumbnail images."),
              frame: thumbnailFrame.optional(),
              size: percentageStr
                .default("100%")
                .describe("Image size within thumbnail boxes."),
            })
            .optional()
            .describe("Listing thumbnail controls."),
        })
        .optional()
        .describe("Primary image rendered above the post unless hidden."),
    })
    .superRefine((data, ctx) => {
      if (data.updatedDate && data.updatedDate < data.date) {
        ctx.addIssue({
          code: "custom",
          message: "updatedDate must not be earlier than date.",
          path: ["updatedDate"],
        });
      }
    });
}
