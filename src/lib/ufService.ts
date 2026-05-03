import type { UFMetadata } from "@/types/finance";
import defaults from "@/data/defaultAssumptions.json";

const CORS_PROXY = "https://corsproxy.io/?url=";
const MINDICADOR_UF_API = "https://mindicador.cl/api/uf";

function buildSIIUrl(year: number): string {
  return `https://www.sii.cl/valores_y_fechas/uf/uf${year}.htm`;
}

function parseChileanNumber(raw: string): number {
  return parseFloat(raw.replace(/\./g, "").replace(",", "."));
}

function formatDateKey(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

function formatIsoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

async function fetchUFFromMindicador(): Promise<UFMetadata> {
  const response = await fetch(MINDICADOR_UF_API, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const payload = await response.json() as {
    serie?: Array<{ fecha: string; valor: number }>;
  };

  const latest = payload.serie?.[0];
  if (!latest || !Number.isFinite(latest.valor)) {
    throw new Error("Could not parse UF value from mindicador.cl");
  }

  return {
    valueCLP: latest.valor,
    date: latest.fecha.split("T")[0],
    source: "Mindicador",
    sourceUrl: MINDICADOR_UF_API,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchUFFromSII(date: Date): Promise<UFMetadata> {
  const year = date.getFullYear();
  const siiUrl = buildSIIUrl(year);
  const url = `${CORS_PROXY}${encodeURIComponent(siiUrl)}`;

  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const html = await response.text();

  // SII table rows have day numbers and UF values separated by spaces
  // Pattern: ">DD<" near ">40.160,14<"
  const day = date.getDate();
  const month = date.getMonth() + 1;

  // Try to find a table cell with the day number and extract the UF on the same row
  // The SII table has months as columns and days as rows
  // Row pattern: <tr>...<td>day</td>...<td>uf_value</td>...
  const dayStr = String(day);
  const regex = new RegExp(
    `<td[^>]*>\\s*${dayStr}\\s*<\\/td>(?:[^<]*<[^/][^>]*>[^<]*<\\/[^>]+>)*?[^<]*<td[^>]*>\\s*([\\d.,]+)\\s*<\\/td>`,
    "i"
  );

  // Alternative: search by month offset in column
  // Build a simpler search: find all td values in the row containing the day
  const rowRegex = new RegExp(
    `<tr[^>]*>(?:(?!<\\/tr>)[\\s\\S])*?<td[^>]*>\\s*${dayStr}\\s*<\\/td>(?:(?!<\\/tr>)[\\s\\S])*?<\\/tr>`,
    "i"
  );
  const rowMatch = html.match(rowRegex);
  if (rowMatch) {
    const cells = [...rowMatch[0].matchAll(/<td[^>]*>\s*([\d.,]+)\s*<\/td>/gi)];
    // month - 1 index (0-based, skip first cell which is the day number)
    const ufCell = cells[month - 1];
    if (ufCell) {
      const value = parseChileanNumber(ufCell[1]);
      if (!isNaN(value) && value > 30000 && value < 60000) {
        return {
          valueCLP: value,
          date: formatDateKey(date),
          source: "SII",
          sourceUrl: siiUrl,
          fetchedAt: new Date().toISOString(),
        };
      }
    }
  }

  // Fallback search: look for the pattern with regex
  const match = html.match(regex);
  if (match) {
    const value = parseChileanNumber(match[1]);
    if (!isNaN(value) && value > 30000 && value < 60000) {
      return {
        valueCLP: value,
        date: formatDateKey(date),
        source: "SII",
        sourceUrl: siiUrl,
        fetchedAt: new Date().toISOString(),
      };
    }
  }

  throw new Error("Could not parse UF value from SII page");
}

export async function getUFValue(manualOverride?: number): Promise<UFMetadata> {
  if (manualOverride != null && manualOverride > 0) {
    return {
      valueCLP: manualOverride,
      date: formatIsoDate(new Date()),
      source: "Manual",
    };
  }

  try {
    return await fetchUFFromMindicador();
  } catch {
    // Fall through to the official SII source.
  }

  try {
    return await fetchUFFromSII(new Date());
  } catch {
    return {
      valueCLP: defaults.ufFallbackCLP,
      date: defaults.ufFallbackDate,
      source: "Fallback",
      sourceUrl: buildSIIUrl(new Date().getFullYear()),
    };
  }
}
