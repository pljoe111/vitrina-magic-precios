export interface Preset {
  name: string;
  massOptions: number[];
  defaultMlMap: Record<number, number>;
  doseOptions: number[];
}

export const presets: Preset[] = [
  {
    name: "Tirzepatide",
    massOptions: [10, 20, 30, 60, 120],
    defaultMlMap: { 10: 1, 20: 1, 30: 3, 60: 3, 120: 4 },
    doseOptions: [2.5, 5, 7.5, 10, 12.5, 15],
  },
  {
    name: "Retatrutide",
    massOptions: [30, 60],
    defaultMlMap: { 30: 3, 60: 3 },
    doseOptions: [1, 2, 4, 6, 8, 10, 12],
  },
  {
    name: "GHK-Cu",
    massOptions: [50],
    defaultMlMap: { 50: 2.5 },
    doseOptions: [1, 2, 3, 4, 5],
  },
];
