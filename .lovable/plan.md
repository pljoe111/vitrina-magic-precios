

## Problem

The OG image URLs in `index.html` point to `https://vitrina-magic-precios.lovable.app/og-preview.png` — a Lovable domain. When WhatsApp (or any platform) fetches the preview, it shows the Lovable-hosted image/URL. Additionally, the `og-preview.png` file itself may contain Lovable branding.

## Plan

### 1. Update OG image URLs to use relative paths
Change the `og:image` and `twitter:image` meta tags to use a relative path (`/og-preview.png`) instead of the full `lovable.app` URL. **However**, OG images require absolute URLs to work properly. Since the site is published at `vitrina-magic-precios.lovable.app`, the URLs technically need to stay absolute — but the domain itself says "lovable".

**Question for you**: Do you have a custom domain connected (like `alchem.is`)? If so, I'll update the OG URLs to use that domain instead. If not, relative paths won't work for OG previews — you'd need to connect a custom domain first to fully remove the Lovable reference from the URL.

### 2. Remove the TODO comment
Line 6 has a Lovable-generated TODO comment — will remove it.

### 3. Replace `og-preview.png`
The current `og-preview.png` may have Lovable branding. You'll need to **upload a new OG preview image** with Alchem branding (recommended size: 1200×630px). I can then set it as the OG image.

### 4. Add `og:url` meta tag
Add an `og:url` property pointing to your actual domain to ensure previews resolve correctly.

### Summary of changes
- **`index.html`**: Update OG/Twitter image URLs to your custom domain (if available), remove TODO comment, add `og:url`
- **`public/og-preview.png`**: Needs replacement — please upload a new branded image

