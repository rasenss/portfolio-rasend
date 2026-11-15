"use client";

import { useEffect, useState } from "react";

/*
 * "New since your last visit": the browser remembers which certificates, design pieces and
 * jobs a visitor has already seen (in this browser only, nothing is sent anywhere). Next
 * time they come back, anything you've added since is marked "new", so returning visitors
 * see straight away what changed.
 *
 * First visit: nothing is marked (everything is new to them anyway).
 */

const results = new Map<string, Set<string>>();

function compute(scope: string, ids: string[]): Set<string> {
  const known = results.get(scope);
  if (known) return known;
  const key = `rk-seen:${scope}`;
  let fresh = new Set<string>();
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const seen = new Set<string>(JSON.parse(raw));
      fresh = new Set(ids.filter((id) => !seen.has(id)));
      ids.forEach((id) => seen.add(id));
      localStorage.setItem(key, JSON.stringify(Array.from(seen)));
    } else {
      localStorage.setItem(key, JSON.stringify(ids));
    }
  } catch {
    /* storage blocked (private mode): just don't mark anything */
  }
  // worked out once per page load, so every part of the page agrees
  results.set(scope, fresh);
  return fresh;
}

/** The ids in `ids` this visitor hasn't seen before (empty until the page is in the browser) */
export function useNewSince(scope: string, ids: string[]): Set<string> {
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());
  const signature = ids.join("\n");
  useEffect(() => {
    setFresh(compute(scope, signature ? signature.split("\n") : []));
  }, [scope, signature]);
  return fresh;
}
