import { db } from "./db";

export const SETTING_KEYS = [
  "legal", "trading", "tagline", "reg", "address", "phone", "email", "website", "brand",
  "bankAccountName", "bankName", "bankAccountNumber", "bankAccountType", "terms", "validDays",
] as const;
export type Settings = Record<(typeof SETTING_KEYS)[number], string>;

const e = (k: string, d = "") => process.env[k] || d;

function defaults(): Settings {
  return {
    legal: e("COMPANY_LEGAL_NAME", "REAGALEANO INVESTMENT"),
    trading: e("COMPANY_TRADING_NAME", "REAGALEANO"),
    tagline: e("COMPANY_TAGLINE", "CONSTRUCTION | MAINTENANCE | AUTOMATION | LOGISTICS"),
    reg: e("COMPANY_REG", "2016/524578/07"),
    address: e("COMPANY_ADDRESS", "301 Columbine Avenue, Mondeor, Johannesburg, 2091"),
    phone: e("COMPANY_PHONE", "061 511 5194"),
    email: e("COMPANY_EMAIL", "admin@reagaleano.co.za"),
    website: e("COMPANY_WEBSITE", "www.reagaleano.co.za"),
    brand: "#12355b",
    bankAccountName: e("BANK_ACCOUNT_NAME"),
    bankName: e("BANK_NAME"),
    bankAccountNumber: e("BANK_ACCOUNT_NUMBER"),
    bankAccountType: e("BANK_ACCOUNT_TYPE"),
    terms:
      "Pricing is based on the stated scope and quantities.\nAny additional materials or work identified after inspection of the existing installation will be quoted separately.\nEquipment remains the property of Reagaleano until paid in full.",
    validDays: "14",
  };
}

// Settings saved by the owner (Settings page) override the environment defaults.
export function company(): Settings {
  const d = defaults() as Record<string, string>;
  const rows = db().prepare("SELECT key,value FROM settings").all() as { key: string; value: string }[];
  for (const r of rows) if ((SETTING_KEYS as readonly string[]).includes(r.key)) d[r.key] = r.value;
  return d as Settings;
}
