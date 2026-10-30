import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { mapProject, type Inquiry, type Project } from "@/lib/portfolio";

const ADMIN_PASSWORD = "admin123";

function assertAdmin(password: string) {
  if (password !== ADMIN_PASSWORD) {
    throw new Error("That key does not open the studio desk.");
  }
}

function safeImage(value: string) {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("..")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const imageUrl = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(safeImage, "Use a studio plate or an https image link.");

const projectFields = z.object({
  password: z.string(),
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(60),
  location: z.string().trim().min(2).max(80),
  year: z.number().int().min(1990).max(2100),
  description: z.string().trim().min(12).max(2000),
  short_description: z.string().trim().min(8).max(220),
  status: z.enum(["Completed", "Ongoing"]),
  image_url: imageUrl,
  featured: z.boolean(),
});

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return base || "project";
}

export const listProjects = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<Project>`
    select id, slug, title, category, location, year, description,
           short_description, status, image_url, featured
    from projects
    order by featured desc, sort_order asc, year desc, id desc
  `;
  return rows.map(mapProject);
});

export const getProject = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().trim().min(1).max(80) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<Project>`
      select id, slug, title, category, location, year, description,
             short_description, status, image_url, featured
      from projects
      where slug = ${data.slug}
      limit 1
    `;
    return rows[0] ? mapProject(rows[0]) : null;
  });

export const saveProject = createServerFn({ method: "POST" })
  .validator(projectFields)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const sql = await getSql();
    if (data.id) {
      const rows = await sql<Project>`
        update projects set
          title = ${data.title},
          category = ${data.category},
          location = ${data.location},
          year = ${data.year},
          description = ${data.description},
          short_description = ${data.short_description},
          status = ${data.status},
          image_url = ${data.image_url},
          featured = ${data.featured}
        where id = ${data.id}
        returning id, slug, title, category, location, year, description,
                  short_description, status, image_url, featured
      `;
      if (!rows[0]) throw new Error("That project is no longer on the boards.");
      return mapProject(rows[0]);
    }

    let slug = slugify(data.title);
    const taken = await sql<{ slug: string }>`
      select slug from projects where slug = ${slug} or slug like ${`${slug}-%`}
    `;
    if (taken.some((row) => row.slug === slug)) {
      slug = `${slug}-${taken.length + 1}`;
    }
    const rows = await sql<Project>`
      insert into projects (
        slug, title, category, location, year, description, short_description,
        status, image_url, featured, sort_order
      )
      values (
        ${slug},
        ${data.title},
        ${data.category},
        ${data.location},
        ${data.year},
        ${data.description},
        ${data.short_description},
        ${data.status},
        ${data.image_url},
        ${data.featured},
        (select coalesce(max(sort_order), 0) + 1 from projects)
      )
      returning id, slug, title, category, location, year, description,
                short_description, status, image_url, featured
    `;
    if (!rows[0]) throw new Error("The project could not be added.");
    return mapProject(rows[0]);
  });

export const removeProject = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string(), id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      delete from projects where id = ${data.id} returning id
    `;
    if (!rows[0]) throw new Error("That project is no longer on the boards.");
    return { ok: true as const };
  });

export const submitInquiry = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().trim().min(2).max(80),
      email: z
        .string()
        .trim()
        .max(120)
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email."),
      interest: z.string().trim().max(80).optional(),
      message: z.string().trim().min(10).max(2000),
      botcheck: z.string().max(200).optional(),
    }),
  )
  .handler(async ({ data }) => {
    if (data.botcheck && data.botcheck.trim()) return { ok: true as const };
    const sql = await getSql();
    await sql`
      insert into inquiries (name, email, interest, message)
      values (${data.name}, ${data.email}, ${data.interest ?? ""}, ${data.message})
    `;
    return { ok: true as const };
  });

export const listInquiries = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const sql = await getSql();
    return sql<Inquiry>`
      select id,
             name,
             email,
             interest,
             message,
             to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
      from inquiries
      order by created_at desc
      limit 100
    `;
  });
