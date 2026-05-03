import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CMF_SIMULATOR_URL = "https://servicios.cmfchile.cl/simuladorhipotecario/aplicacion";
const OUTPUT_FILE = path.resolve("src/data/bankPresets.json");
const DEFAULT_QUERY = {
  indice: "101.2.3",
  maxuf: "20000",
  minuf: "100",
  maxpeso: "803202800",
  minpeso: "4016014",
  paso: "2",
  template: "entidades",
  tipomoneda: "1",
  monto: "1000",
  tipocredito: "3",
  tipotasa: "1",
  plazo: "17",
  inst: "OK",
  marcados: ["1", "9", "14", "16", "37", "39", "51", "672"],
};

const DEFAULT_TERMS = [15, 20, 25, 30];
const BANK_ID_ALIASES = {
  "Banco Santander-Chile": "santander",
  "Banco de Chile": "bancochile",
  "Banco de Credito e Inversiones": "bci",
  "Banco de Credito e Inversiones (BCI)": "bci",
  "BancoEstado": "bancoestado",
  "Scotiabank Chile": "scotiabank",
  "Itau Corpbanca": "itau",
  "Banco Internacional": "bancointernacional",
  "Banco Falabella": "bancofalabella",
  "Coopeuch": "coopeuch",
};

function buildCmfUrl(query = DEFAULT_QUERY) {
  const url = new URL(CMF_SIMULATOR_URL);
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, item);
      }
      continue;
    }
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&aacute;/gi, "\u00e1")
    .replace(/&eacute;/gi, "\u00e9")
    .replace(/&iacute;/gi, "\u00ed")
    .replace(/&oacute;/gi, "\u00f3")
    .replace(/&uacute;/gi, "\u00fa")
    .replace(/&uuml;/gi, "\u00fc")
    .replace(/&ntilde;/gi, "\u00f1")
    .replace(/&Aacute;/g, "\u00c1")
    .replace(/&Eacute;/g, "\u00c9")
    .replace(/&Iacute;/g, "\u00cd")
    .replace(/&Oacute;/g, "\u00d3")
    .replace(/&Uacute;/g, "\u00da")
    .replace(/&Ntilde;/g, "\u00d1");
}

function stripTags(html) {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(div|li|p|h\d|ul|tr|td|th)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n+/g, "\n")
    .trim();
}

function normalizeText(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDecimal(raw) {
  const cleaned = raw.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  return Number.parseFloat(cleaned);
}

function parseInteger(raw) {
  const cleaned = raw.replace(/[^\d-]/g, "");
  return Number.parseInt(cleaned, 10);
}

function round(value, decimals = 4) {
  return Number(value.toFixed(decimals));
}

function slugifyBankId(name) {
  const normalized = normalizeText(name);
  return (
    BANK_ID_ALIASES[normalized] ??
    normalized
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
  );
}

function toIsoDate(raw) {
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return new Date().toISOString().slice(0, 10);
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

function parseUfValueFromHtml(html) {
  const summaryMatch = html.match(/Monto:\s*([\d.]+)\s*UF\s*\(equivale a \$\s*([\d.]+)\)/i);
  if (!summaryMatch) {
    throw new Error("Could not extract the UF value from the CMF summary.");
  }

  const montoUf = parseInteger(summaryMatch[1]);
  const montoClp = parseInteger(summaryMatch[2]);
  const ufValue = montoClp / montoUf;

  if (!Number.isFinite(ufValue) || ufValue <= 0) {
    throw new Error("The CMF page returned an invalid UF value.");
  }

  return ufValue;
}

function extractRows(html) {
  const tableMatch = html.match(/<div[^>]+id="simuladorCreditoHipotecario"[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i);
  if (!tableMatch) {
    throw new Error("Could not find the CMF result table.");
  }

  return [...tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((rowMatch) => {
    const rowHtml = rowMatch[1];
    const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cellMatch) =>
      stripTags(cellMatch[1]).replace(/\s+/g, " ").trim()
    );
    const modalId = rowHtml.match(/data-target="#([^"]+)"/i)?.[1];
    return { cells, modalId };
  });
}

function extractModals(html) {
  const modalMap = new Map();
  const modalRegex = /<div class="modal" id="(myModal\d+)">([\s\S]*?)(?=<div class="modal" id="myModal\d+"|<\/body>)/gi;

  for (const match of html.matchAll(modalRegex)) {
    modalMap.set(match[1], match[2]);
  }

  return modalMap;
}

function extractFirstNumber(text, pattern) {
  const match = text.match(pattern);
  return match ? parseDecimal(match[1]) : undefined;
}

function parseModalDetails(modalHtml, fallbackMonthlyDividendClp, ufValueClp) {
  const plainText = normalizeText(stripTags(modalHtml));

  const baseDividendUf = extractFirstNumber(
    plainText,
    /dividendo mensual sin seguros[\s\S]*?valor en unidades de fomento : uf\s*([0-9.,]+)/i
  );
  const desgravamenUf = extractFirstNumber(
    plainText,
    /seguro de desgravamen[\s\S]*?valor en unidades de fomento : uf\s*([0-9.,]+)/i
  );
  const incendioUf = extractFirstNumber(
    plainText,
    /seguro de incendio[\s\S]*?valor en unidades de fomento : uf\s*([0-9.,]+)/i
  );
  const incendioSismoUf = extractFirstNumber(
    plainText,
    /seguro de incendio mas sismo[\s\S]*?valor en unidades de fomento : uf\s*([0-9.,]+)/i
  );
  const updatedAt = plainText.match(/fecha de actualizacion : (\d{2}\/\d{2}\/\d{4})/i)?.[1];
  const note = plainText.match(/nota:\s*(.+?)(?:\s+cerrar|$)/i)?.[1];

  let monthlyInsuranceUf;
  if (desgravamenUf != null && incendioUf != null) {
    monthlyInsuranceUf = round(desgravamenUf + incendioUf, 4);
  } else if (desgravamenUf != null && incendioSismoUf != null) {
    monthlyInsuranceUf = round(desgravamenUf + incendioSismoUf, 4);
  } else if (baseDividendUf != null) {
    monthlyInsuranceUf = round(fallbackMonthlyDividendClp / ufValueClp - baseDividendUf, 4);
  }

  return {
    monthlyInsuranceUf: monthlyInsuranceUf ?? 0,
    updatedAt: updatedAt ? toIsoDate(updatedAt) : new Date().toISOString().slice(0, 10),
    notes: note,
  };
}

function parseBankPresets(html, sourceUrl) {
  const ufValueClp = parseUfValueFromHtml(html);
  const rows = extractRows(html);
  const modals = extractModals(html);

  return rows
    .map(({ cells, modalId }) => {
      if (cells.length < 7 || !modalId) {
        return null;
      }

      const [bankName, creditType, monthlyDividendRaw, currency, rateType, loanRateRaw, caeRaw] = cells;
      const modalHtml = modals.get(modalId);
      if (!modalHtml) {
        return null;
      }

      const monthlyDividendClp = parseInteger(monthlyDividendRaw);
      const loanRatePct = parseDecimal(loanRateRaw);
      const caePct = parseDecimal(caeRaw);
      const modalDetails = parseModalDetails(modalHtml, monthlyDividendClp, ufValueClp);
      const normalizedBankName = stripTags(bankName);

      return {
        bankId: slugifyBankId(normalizedBankName),
        bankName: normalizedBankName,
        productName: `${creditType} ${currency} tasa ${rateType.toLowerCase()}`,
        baseAnnualRatePct: round(loanRatePct, 2),
        caePct: round(caePct, 2),
        monthlyInsuranceUF: modalDetails.monthlyInsuranceUf,
        maxFinancingPct: 80,
        maxDividendIncomeRatioPct: 25,
        availableTermsYears: DEFAULT_TERMS,
        source: "CMF Simulador Hipotecario",
        sourceUrl,
        lastUpdated: modalDetails.updatedAt,
        ...(modalDetails.notes ? { notes: modalDetails.notes } : {}),
      };
    })
    .filter(Boolean);
}

async function loadExistingManualPreset() {
  try {
    const existing = JSON.parse(await readFile(OUTPUT_FILE, "utf8"));
    const manualPreset = existing.find((preset) => preset.bankId === "manual");
    if (manualPreset) {
      return manualPreset;
    }
  } catch {
    // Ignore read/parse errors and fall back to the default manual preset.
  }

  return {
    bankId: "manual",
    bankName: "Ingreso manual",
    productName: "Parametros personalizados",
    baseAnnualRatePct: 4.85,
    caePct: 5.42,
    monthlyInsuranceUF: 1.2,
    maxFinancingPct: 80,
    maxDividendIncomeRatioPct: 25,
    availableTermsYears: DEFAULT_TERMS,
    source: "Manual",
    sourceUrl: "",
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}

async function fetchCmfHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 compraCasa-simulator updater",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`CMF request failed with HTTP ${response.status}`);
  }

  return response.text();
}

async function updateBankPresets() {
  const sourceUrl = buildCmfUrl();
  const html = await fetchCmfHtml(sourceUrl);
  const manualPreset = await loadExistingManualPreset();
  const presets = parseBankPresets(html, sourceUrl);
  const payload = [manualPreset, ...presets];

  await writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Updated ${presets.length} CMF bank presets in ${OUTPUT_FILE}`);
}

await updateBankPresets();
