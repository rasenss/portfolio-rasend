"use client";

/**
 * Copies text, and says whether it worked. Browsers only allow the modern clipboard on
 * secure pages (https or localhost) while the page has focus, so it falls back to the
 * older select-and-copy way, which also works when the site is opened by its network
 * address (http://192.168.…) or inside in-app browsers.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the older way */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    // off-screen, and big enough text that iPhones don't zoom in on it
    area.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0;font-size:16px";
    document.body.appendChild(area);
    const active = document.activeElement as HTMLElement | null;
    area.select();
    area.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    active?.focus?.({ preventScroll: true });
    return ok;
  } catch {
    return false;
  }
}
