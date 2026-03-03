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
  {
    id: "tr-002",
    productId: "tirzepatide",
    productName: "Tirzepatide 120mg",
    batchNumber: "TZP-120-LYO-B260126",
    lotNumber: "TZP-120-LYO-B260126",
    testDate: "2026-02-23",
    expDate: "02/2031",
    purity: 99.8,
    potency: "143.3mg (119.4%)",
    contaminants: "None detected",
    sterility: "Pass",
    endotoxins: "<0.05 EU/ml",
    certificates: [
      {
        label: "Purity/Potency (BTLabs)",
        link: "/certificates/COA-Tirzepatide-TZP-120-LYO-B260126.pdf",
      },
    ],
    labPartnerUrl: "https://btlabtesting.com/",
  },
  {
    id: "tr-003",
    productId: "tirzepatide",
    productName: "Tirzepatide 60mg",
    batchNumber: "TZP-60-LYO-B260115",
    lotNumber: "TZP-60-LYO-B260115",
    testDate: "2026-02-23",
    expDate: "02/2031",
    purity: 99.8,
    potency: "63.8mg (106.4%)",
    contaminants: "None detected",
    sterility: "Pass",
    endotoxins: "<0.05 EU/ml",
    certificates: [
      {
        label: "Purity/Potency (BTLabs)",
        link: "/certificates/COA-Tirzepatide-TZP-60-LYO-B260115.pdf",
      },
    ],
    labPartnerUrl: "https://btlabtesting.com/",
  },
  {
    id: "tr-004",
    productId: "tirzepatide",
    productName: "Tirzepatide 30mg",
    batchNumber: "TZP-30-LYO-B260112",
    lotNumber: "TZP-30-LYO-B260112",
    testDate: "2026-02-23",
    expDate: "02/2031",
    purity: 99.8,
    potency: "31.2mg (104.1%)",
    contaminants: "None detected",
    sterility: "Pass",
    endotoxins: "<0.05 EU/ml",
    certificates: [
      {
        label: "Purity/Potency (BTLabs)",
        link: "/certificates/COA-Tirzepatide-TZP-30-LYO-B260112.pdf",
      },
    ],
    labPartnerUrl: "https://btlabtesting.com/",
  },
  {
    id: "tr-005",
    productId: "bpc-157",
    productName: "BPC-157 10mg",
    batchNumber: "BPC-10-LYO-B260126",
    lotNumber: "BPC-10-LYO-B260126",
    testDate: "2026-02-23",
    expDate: "02/2031",
    purity: 99.8,
    potency: "13.8mg (137.6%)",
    contaminants: "None detected",
    sterility: "Pass",
    endotoxins: "<0.05 EU/ml",
    certificates: [
      {
        label: "Purity/Potency (BTLabs)",
        link: "/certificates/COA-BPC-157-BPC-10-LYO-B260126.pdf",
      },
    ],
    labPartnerUrl: "https://btlabtesting.com/",
  },
  {
    id: "tr-006",
    productId: "tesamorelin",
    productName: "Tesamorelin 2mg",
    batchNumber: "TSM-2-LYO-251230",
    lotNumber: "TSM-2-LYO-251230",
    testDate: "2026-02-23",
    expDate: "02/2031",
    purity: 99.7,
    potency: "2.4mg (118.2%)",
    contaminants: "None detected",
    sterility: "Pass",
    endotoxins: "<0.05 EU/ml",
    certificates: [
      {
        label: "Purity/Potency (BTLabs)",
        link: "/certificates/COA-Tesamorelin-TSM-2-LYO-251230.pdf",
      },
    ],
    labPartnerUrl: "https://btlabtesting.com/",
  },
  {
    id: "tr-007",
    productId: "tb-500",
    productName: "TB-500 10mg",
    batchNumber: "TB-10-LYO-B260204",
    lotNumber: "TB-10-LYO-B260204",
    testDate: "2026-02-23",
    expDate: "02/2031",
    purity: 99.7,
    potency: "10.3mg (102.9%)",
    contaminants: "None detected",
    sterility: "Pass",
    endotoxins: "<0.05 EU/ml",
    certificates: [
      {
        label: "Purity/Potency (BTLabs)",
        link: "/certificates/COA-TB-500-TB-10-LYO-B260204.pdf",
      },
    ],
    labPartnerUrl: "https://btlabtesting.com/",
  },
  {
    id: "tr-008",
    productId: "ghk-cu",
    productName: "GHK-Cu 50mg",
    batchNumber: "GHK-50-LYO-B260204",
    lotNumber: "GHK-50-LYO-B260204",
    testDate: "2026-02-23",
    expDate: "02/2031",
    purity: 99.7,
    potency: "48.7mg (97.4%)",
    contaminants: "None detected",
    sterility: "Pass",
    endotoxins: "<0.05 EU/ml",
    certificates: [
      {
        label: "Purity/Potency (BTLabs)",
        link: "/certificates/COA-GHK-Cu-GHK-50-LYO-B260204.pdf",
      },
    ],
    labPartnerUrl: "https://btlabtesting.com/",
  },
  {
    id: "tr-009",
    productId: "sermorelin",
    productName: "Sermorelin 5mg",
    batchNumber: "SRM-5-LYO-B251216",
    lotNumber: "SRM-5-LYO-B251216",
    testDate: "2026-02-23",
    expDate: "02/2031",
    purity: 99.4,
    potency: "5.8mg (115.2%)",
    contaminants: "None detected",
    sterility: "Pass",
    endotoxins: "<0.05 EU/ml",
    certificates: [
      {
        label: "Purity/Potency (BTLabs)",
        link: "/certificates/COA-Sermorelin-SRM-5-LYO-B251216.pdf",
      },
    ],
    labPartnerUrl: "https://btlabtesting.com/",
  },
];
