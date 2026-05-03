import bankPresetsRaw from "@/data/bankPresets.json";
import type { BankPreset } from "@/types/finance";

export const bankPresets = bankPresetsRaw as BankPreset[];
export const firstBankPreset = bankPresets.find((preset) => preset.bankId !== "manual") ?? bankPresets[0];
