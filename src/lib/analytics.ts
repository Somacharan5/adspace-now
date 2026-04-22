// Deterministic simulated analytics — produces realistic numbers from a seed
// so the same campaign always shows the same metrics.

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function rand(seed: string, min: number, max: number) {
  const v = (hash(seed) % 10000) / 10000;
  return Math.round(min + v * (max - min));
}

export type BannerAnalytics = {
  todayImpressions: number;
  totalImpressions: number;
  expectedTotal: number;
  reach: number;
  frequency: number;
  ctr: number;
  cac: number;
  daysElapsed: number;
  totalDays: number;
  daily: { day: number; impressions: number }[];
};

export function computeBannerAnalytics(args: {
  bannerId: string;
  pricePerDay: number;
  startDate: string;
  durationDays: number;
  status: string;
}): BannerAnalytics {
  const { bannerId, pricePerDay, startDate, durationDays, status } = args;
  const start = new Date(startDate);
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const elapsed = Math.max(0, Math.min(durationDays, Math.floor((now.getTime() - start.getTime()) / msPerDay)));
  const daysElapsed = status === "live" ? elapsed : 0;

  const baseDaily = rand(bannerId + "d", Math.round(pricePerDay / 4), Math.round(pricePerDay / 2));
  const todayImpressions = status === "live" ? rand(bannerId + now.toDateString(), Math.round(baseDaily * 0.8), Math.round(baseDaily * 1.2)) : 0;
  const totalImpressions = baseDaily * daysElapsed + Math.round(todayImpressions * 0.5);
  const expectedTotal = baseDaily * durationDays;
  const reach = Math.round(totalImpressions * 0.78);
  const frequency = totalImpressions > 0 ? +(totalImpressions / Math.max(1, reach)).toFixed(2) : 0;
  const ctr = +(rand(bannerId + "ctr", 18, 42) / 10).toFixed(1);
  const totalSpend = pricePerDay * Math.max(1, daysElapsed);
  const conversions = Math.max(1, Math.round(totalImpressions * (ctr / 100) * 0.05));
  const cac = Math.round(totalSpend / conversions);

  const daily = Array.from({ length: Math.max(daysElapsed, 0) }, (_, i) => ({
    day: i + 1,
    impressions: rand(bannerId + "day" + i, Math.round(baseDaily * 0.7), Math.round(baseDaily * 1.3)),
  }));

  return { todayImpressions, totalImpressions, expectedTotal, reach, frequency, ctr, cac, daysElapsed, totalDays: durationDays, daily };
}

export function aggregateCampaignAnalytics(banners: BannerAnalytics[]): BannerAnalytics {
  if (banners.length === 0) {
    return { todayImpressions: 0, totalImpressions: 0, expectedTotal: 0, reach: 0, frequency: 0, ctr: 0, cac: 0, daysElapsed: 0, totalDays: 0, daily: [] };
  }
  const sum = (k: keyof BannerAnalytics) => banners.reduce((s, b) => s + (b[k] as number), 0);
  const totalImpressions = sum("totalImpressions");
  const reach = Math.round(sum("reach") * 0.92);
  return {
    todayImpressions: sum("todayImpressions"),
    totalImpressions,
    expectedTotal: sum("expectedTotal"),
    reach,
    frequency: totalImpressions > 0 ? +(totalImpressions / Math.max(1, reach)).toFixed(2) : 0,
    ctr: +(banners.reduce((s, b) => s + b.ctr, 0) / banners.length).toFixed(1),
    cac: Math.round(banners.reduce((s, b) => s + b.cac, 0) / banners.length),
    daysElapsed: Math.max(...banners.map((b) => b.daysElapsed)),
    totalDays: Math.max(...banners.map((b) => b.totalDays)),
    daily: [],
  };
}
