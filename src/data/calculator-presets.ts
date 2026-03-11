export interface Preset {
  name: string;
  massOptions: number[];
  defaultDiluents: number[];
  doses: number[];
}

export const presets: Preset[] = [
  {
    name: "Tirzepatide",
    massOptions: [10, 20, 30, 60, 120],
    defaultDiluents: [1, 1, 3, 3, 4],
    doses: [2.5, 5, 7.5, 10, 12.5, 15],
  },
  {
    name: "Retatrutide",
    massOptions: [30, 60],
    defaultDiluents: [3, 3],
    doses: [1, 2, 4, 6, 8, 10, 12],
  },
  {
    name: "GHK-Cu",
    massOptions: [50],
    defaultDiluents: [2.5],
    doses: [1, 2, 3, 4, 5],
  },
];
