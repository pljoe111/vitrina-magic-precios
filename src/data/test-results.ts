export interface Certificate {
  label: string;
  link: string;
}

export interface TestResult {
  id: string;
  productId: string;
  productName: string;
  batchNumber: string;
  lotNumber: string;
  testDate: string;
  expDate: string;
  purity: number;
  potency: string;
  contaminants: string;
  sterility: string;
  endotoxins: string;
  certificates: Certificate[];
  labPartnerUrl: string;
}

export const testResults: TestResult[] = [
  {
    id: "tr-001",
    productId: "retatrutide",
    productName: "Retatrutide 60mg",
    batchNumber: "RT-60-LYO-B251214",
    lotNumber: "RT-60-LYO-B251214",
    testDate: "2026-02-23",
    expDate: "02/2031",
    purity: 99.7,
    potency: "66.4mg (110.7%)",
    contaminants: "None detected",
    sterility: "Pass",
    endotoxins: "<0.05 EU/ml",
    certificates: [
      {
        label: "Purity/Potency (BTLabs)",
        link: "/certificates/COA-Retatrutide-RT-60-LYO-B251214.pdf",
      },
    ],
    labPartnerUrl: "https://btlabtesting.com/",
  },
];
