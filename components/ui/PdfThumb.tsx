"use client";

import { useEffect, useState } from "react";
import { pdfPreview } from "@/lib/pdf-preview";

type Props = {
  /** web address of the PDF */
  src: string;
  alt: string;
  size?: "small" | "large";
  /** shown while the page is being drawn */
  loading: React.ReactNode;
  /** shown if the PDF can't be drawn (defaults to the loading view) */
  failed?: React.ReactNode;
};

/** The first page of a PDF as a picture, filling its (positioned) parent */
export function PdfThumb({ src, alt, size = "small", loading, failed }: Props) {
  const [state, setState] = useState<{ src: string; url: string | null; failed: boolean }>({ src, url: null, failed: false });

  useEffect(() => {
    let alive = true;
    pdfPreview(src, size)
      .then((url) => alive && setState({ src, url, failed: false }))
      .catch(() => alive && setState({ src, url: null, failed: true }));
    return () => {
      alive = false;
    };
  }, [src, size]);

  // a different PDF than the one drawn: show the loading view until it's ready
  if (state.src !== src || (!state.url && !state.failed)) return <>{loading}</>;
  if (state.failed || !state.url) return <>{failed ?? loading}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={state.url} alt={alt} className="absolute inset-0 h-full w-full bg-white object-contain" />;
}
