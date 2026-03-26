
Root-cause assessment (from current code) and fix plan:

1) Why badges are still getting cut
- The clipping is now likely happening inside the badge text box, not from card/container overflow.
- In `QuotePreview.tsx`, badges use very tight typography:
  - `fontSize: 10px`
  - `lineHeight: "1"`
  - `minHeight: 18px`
  - bold white text on dark background
- This is fragile for `html2canvas`: tiny bold text + tight line box + rasterization can shift baseline by ~1px and visually cut descenders.
- Export uses JPEG (`toDataURL("image/jpeg")`) for JPG and PDF image insertion, which further degrades tiny white text on colored badges and can make the cut look worse.
- Capture also runs without explicitly waiting for fonts (`document.fonts.ready`), so metric mismatch can occur during render.

2) Concrete changes to implement
- Badge rendering hardening (`QuotePreview.tsx`)
  - Replace the current badge base style with deterministic text metrics:
    - explicit `height` (not `minHeight`)
    - matching `lineHeight` to height
    - slight vertical padding or larger height (20–22px)
    - remove `lineHeight: "1"`
    - keep `whiteSpace: "nowrap"` and `display: inline-block` (avoid flex text-centering quirks in canvas renderers)
- Capture hardening (`QuoteGenerator.tsx`)
  - Before capture: `await document.fonts.ready`.
  - Capture with explicit dimensions from the preview element (`scrollWidth/scrollHeight`) so html2canvas doesn’t infer clipped bounds.
  - Keep high scale (2–3) and white background.
- Export format adjustments
  - For PDF image embedding, use PNG instead of JPEG to preserve small badge typography.
  - Keep JPG export for user requirement, but generate from high-res source canvas to reduce artifacts.

3) Secondary safeguard (if needed)
- If any clipping remains in PDF specifically, move to section-based PDF placement (`data-pdf-section` per block) so sections are never sliced at arbitrary boundaries.

4) Validation checklist
- Test the same quote in all outputs: JPG, PDF, Print, Clipboard.
- Confirm dark green “Ahorro” and red “Más producto…” badges have full text height (no bottom clipping) at 100% and zoomed view.
- Test both ES/EN and long savings amounts.
