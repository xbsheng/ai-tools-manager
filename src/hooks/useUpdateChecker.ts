import { useState, useEffect, useCallback } from "react";
import { getVersion } from "@tauri-apps/api/app";

interface UpdateState {
  checking: boolean;
  latestVersion: string | null;
  currentVersion: string | null;
  hasUpdate: boolean;
  releaseUrl: string | null;
  error: string | null;
}

const REPO = "xbsheng/ai-tools-manager";

function compareVersions(current: string, latest: string): boolean {
  const parse = (v: string) => v.replace(/^v/, "").split(".").map(Number);
  const c = parse(current);
  const l = parse(latest);
  for (let i = 0; i < Math.max(c.length, l.length); i++) {
    const cv = c[i] ?? 0;
    const lv = l[i] ?? 0;
    if (lv > cv) return true;
    if (lv < cv) return false;
  }
  return false;
}

export function useUpdateChecker() {
  const [state, setState] = useState<UpdateState>({
    checking: false,
    latestVersion: null,
    currentVersion: null,
    hasUpdate: false,
    releaseUrl: null,
    error: null,
  });

  const checkNow = useCallback(async () => {
    setState((prev) => ({ ...prev, checking: true, error: null }));

    try {
      const currentVersion = await getVersion().catch(() => "0.0.0");

      const res = await fetch(
        `https://api.github.com/repos/${REPO}/releases/latest`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const latestVersion = (data.tag_name as string).replace(/^v/, "");
      const hasUpdate = compareVersions(currentVersion, latestVersion);

      setState({
        checking: false,
        currentVersion,
        latestVersion,
        hasUpdate,
        releaseUrl: data.html_url as string,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        checking: false,
        error: "failed",
      }));
    }
  }, []);

  useEffect(() => {
    checkNow();
  }, [checkNow]);

  return { ...state, checkNow };
}
