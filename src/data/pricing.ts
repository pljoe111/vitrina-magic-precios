export interface PricingTier {
  totalMg: number;
  priceVial: number;
  priceMayoreoN1: number;
  priceMayoreoN2: number;
}

export interface ProductPricing {
  productId: string;
  tiers: PricingTier[];
}

export const productPricing: ProductPricing[] = [
  {
    productId: "retatrutide",
    tiers: [
      { totalMg: 30, priceVial: 3780, priceMayoreoN1: 3024, priceMayoreoN2: 2700 },
      { totalMg: 60, priceVial: 6120, priceMayoreoN1: 4896, priceMayoreoN2: 4371 },
    ],
  },
  {
    productId: "tirzepatide",
    tiers: [
      { totalMg: 10, priceVial: 1224, priceMayoreoN1: 979, priceMayoreoN2: 874 },
      { totalMg: 20, priceVial: 1710, priceMayoreoN1: 1368, priceMayoreoN2: 1221 },
      { totalMg: 30, priceVial: 2160, priceMayoreoN1: 1728, priceMayoreoN2: 1543 },
      { totalMg: 60, priceVial: 3780, priceMayoreoN1: 3024, priceMayoreoN2: 2700 },
      { totalMg: 120, priceVial: 5940, priceMayoreoN1: 4752, priceMayoreoN2: 4243 },
    ],
  },
  {
    productId: "nad",
    tiers: [
      { totalMg: 500, priceVial: 1710, priceMayoreoN1: 1368, priceMayoreoN2: 1221 },
    ],
  },
  {
    productId: "bpc-157",
    tiers: [
      { totalMg: 10, priceVial: 1170, priceMayoreoN1: 936, priceMayoreoN2: 836 },
    ],
  },
  {
    productId: "ghk-cu",
    tiers: [
      { totalMg: 50, priceVial: 666, priceMayoreoN1: 533, priceMayoreoN2: 476 },
      { totalMg: 100, priceVial: 1134, priceMayoreoN1: 907, priceMayoreoN2: 810 },
    ],
  },
  {
    productId: "tb-500",
    tiers: [
      { totalMg: 5, priceVial: 1530, priceMayoreoN1: 1224, priceMayoreoN2: 1093 },
      { totalMg: 10, priceVial: 2970, priceMayoreoN1: 2376, priceMayoreoN2: 2121 },
    ],
  },
  {
    productId: "sermorelin",
    tiers: [
      { totalMg: 10, priceVial: 2700, priceMayoreoN1: 2160, priceMayoreoN2: 1929 },
    ],
  },
  {
    productId: "tesamorelin",
    tiers: [
      { totalMg: 2, priceVial: 1044, priceMayoreoN1: 835, priceMayoreoN2: 746 },
      { totalMg: 10, priceVial: 3780, priceMayoreoN1: 3024, priceMayoreoN2: 2700 },
    ],
  },
];
