import { APP_NAME } from "@/shared/constants";
import { COLORS } from "@/shared/theme/colors";

export interface EmailContent {
  /** Shown after the subject in the inbox list. */
  preview: string;
  heading: string;
  greeting: string;
  paragraphs: string[];
  action?: { label: string; url: string };
  /** Where the footer's "manage" link goes (the profile). */
  profileUrl: string;
}

// The card and its border, a step lighter than the page (gray-800 and gray-700)
const CARD = { background: "#1f2937", border: "#374151", text: "#d1d5db" };
const FONT = "Arial, Helvetica, sans-serif";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Every value that goes into the HTML (names, notification text, URLs) passes through here. */
export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);

// Email clients ignore stylesheets and modern layout, so this is tables with inline styles.
// Next.js doesn't allow react-dom/server in route code, so the HTML is a plain template.
function renderHtml(content: EmailContent): string {
  const paragraph = (text: string) =>
    `<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:${CARD.text}">${escapeHtml(text)}</p>`;

  const button = content.action
    ? `<a href="${escapeHtml(content.action.url)}" style="display:inline-block;padding:12px 20px;border-radius:6px;background-color:${COLORS.primary};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none">${escapeHtml(content.action.label)}</a>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(content.heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.background}">
<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(content.preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.background};padding:32px 16px">
<tr><td>
<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background-color:${CARD.background};border:1px solid ${CARD.border};border-radius:8px">
<tr><td style="padding:24px 32px 0;font-family:${FONT};font-size:18px;font-weight:700;color:${COLORS.primary}">${APP_NAME}</td></tr>
<tr><td style="padding:8px 32px 32px;font-family:${FONT}">
<h1 style="margin:16px 0;font-size:22px;line-height:30px;color:${COLORS.text}">${escapeHtml(content.heading)}</h1>
${paragraph(content.greeting)}
${content.paragraphs.map(paragraph).join("\n")}
${button}
</td></tr>
</table>
<p style="max-width:520px;margin:16px auto 0;font-family:${FONT};font-size:12px;line-height:18px;color:${COLORS.muted};text-align:center">You get this email because you have a ${APP_NAME} account. <a href="${escapeHtml(content.profileUrl)}" style="color:${COLORS.muted}">Manage your account</a>. Payments run in Stripe test mode; no real money is charged.</p>
</td></tr>
</table>
</body>
</html>`;
}

/** The email as HTML and as plain text with the same words. */
export function renderEmail(content: EmailContent): { html: string; text: string } {
  const text = [
    content.heading,
    content.greeting,
    ...content.paragraphs,
    content.action && `${content.action.label}: ${content.action.url}`,
    `-- ${APP_NAME}. Manage your account: ${content.profileUrl}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { html: renderHtml(content), text };
}
