import bpc157 from "@/assets/bpc-157.png";
import ghkCu from "@/assets/ghk-cu.png";
import nad from "@/assets/nad.png";
import retatrutide from "@/assets/retatrutide.png";
import sermorelin from "@/assets/sermorelin.png";
import tb500 from "@/assets/tb-500.png";
import tesamorelin from "@/assets/tesamorelin.png";
import tirzepatide from "@/assets/tirzepatide.png";

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  pricePerMg: number;
  totalMg: number;
  category: string;
  badge?: string;
}

export const products: Product[] = [
  {
    id: "tirzepatide",
    name: "Tirzepatide",
    subtitle: "Liofilizado para reconstitución",
    description: "Agonista dual GIP/GLP-1 de última generación. Eficacia clínica superior en el manejo metabólico con resultados comprobados.",
    image: tirzepatide,
    pricePerMg: 25,
    totalMg: 120,
    category: "Metabolismo",
    badge: "Más Vendido",
  },
  {
    id: "retatrutide",
    name: "Retatrutide",
    subtitle: "Liofilizado para reconstitución",
    description: "Triple agonista GIP/GLP-1/Glucagón. Innovación de vanguardia en el campo de los péptidos metabólicos.",
    image: retatrutide,
    pricePerMg: 38,
    totalMg: 60,
    category: "Metabolismo",
    badge: "Nuevo",
  },
  {
    id: "tesamorelin",
    name: "Tesamorelin",
    subtitle: "Liofilizado para reconstitución",
    description: "Análogo de GHRH aprobado clínicamente. Estimula la secreción natural de hormona de crecimiento.",
    image: tesamorelin,
    pricePerMg: 90,
    totalMg: 2,
    category: "Hormona de Crecimiento",
  },
  {
    id: "sermorelin",
    name: "Sermorelin",
    subtitle: "Liofilizado para reconstitución",
    description: "Péptido liberador de hormona de crecimiento con perfil de seguridad bien establecido.",
    image: sermorelin,
    pricePerMg: 18,
    totalMg: 5,
    category: "Hormona de Crecimiento",
  },
  {
    id: "bpc-157",
    name: "BPC-157",
    subtitle: "Liofilizado para reconstitución",
    description: "Pentadecapéptido derivado de proteína gástrica con propiedades regenerativas documentadas en múltiples estudios.",
    image: bpc157,
    pricePerMg: 15,
    totalMg: 10,
    category: "Regeneración",
  },
  {
    id: "tb-500",
    name: "TB-500",
    subtitle: "Liofilizado para reconstitución",
    description: "Fragmento de Timosina Beta-4. Péptido clave en procesos de reparación y recuperación tisular.",
    image: tb500,
    pricePerMg: 12,
    totalMg: 10,
    category: "Regeneración",
  },
  {
    id: "ghk-cu",
    name: "GHK-Cu",
    subtitle: "Liofilizado para reconstitución",
    description: "Tripéptido de cobre con más de 100 estudios publicados. Potente señalizador celular.",
    image: ghkCu,
    pricePerMg: 8,
    totalMg: 50,
    category: "Antienvejecimiento",
  },
  {
    id: "nad",
    name: "NAD+",
    subtitle: "Liofilizado para reconstitución",
    description: "Coenzima esencial para el metabolismo celular y la producción de energía. Clave en longevidad celular.",
    image: nad,
    pricePerMg: 4,
    totalMg: 500,
    category: "Antienvejecimiento",
  },
];
