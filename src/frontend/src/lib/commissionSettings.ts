export interface CommissionSettings {
  defaultCommission: number;
  repOverrides: Record<number, number>;
}

const STORAGE_KEY = 'consignflow_commission_settings';

const DEFAULT_SETTINGS: CommissionSettings = {
  defaultCommission: 30,
  repOverrides: {},
};

export function getCommissionSettings(): CommissionSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load commission settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export function saveCommissionSettings(settings: CommissionSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save commission settings:', error);
  }
}

export function setDefaultCommission(percentage: number): void {
  const settings = getCommissionSettings();
  settings.defaultCommission = percentage;
  saveCommissionSettings(settings);
}

export function setRepCommissionOverride(repId: number, percentage: number | null): void {
  const settings = getCommissionSettings();
  if (percentage === null) {
    delete settings.repOverrides[repId];
  } else {
    settings.repOverrides[repId] = percentage;
  }
  saveCommissionSettings(settings);
}
