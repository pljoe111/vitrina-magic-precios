import logo from "@/assets/logo.png";

interface DoseRow {
  id: string;
  dose: number;
}

interface PrintableCardProps {
  productName: string;
  massMg: number;
  diluentMl: number;
  concentration: number;
  doseRows: DoseRow[];
}

const formatMl = (val: number): string => {
  if (!isFinite(val) || isNaN(val)) return "—";
  return parseFloat(val.toFixed(2)).toString();
};

const PrintableCard = ({ productName, massMg, diluentMl, concentration, doseRows }: PrintableCardProps) => {
  return (
    <div className="printable-card mx-auto max-w-lg border-2 border-foreground bg-background p-8 font-body print:border-black print:max-w-full">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 border-b-2 border-foreground pb-4 print:border-black">
        <img src={logo} alt="Alchem" className="h-10 w-10" />
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground print:text-gray-600">
            Alchem · Certified Pure
          </p>
        </div>
      </div>

      {/* Product name */}
      <h2 className="mt-5 text-center text-2xl font-bold font-display text-foreground print:text-black">
        {productName || "Péptido"}
      </h2>

      {/* Summary row */}
      <div className="mt-4 flex justify-center gap-8 text-sm text-muted-foreground print:text-gray-700">
        <span>
          <strong className="text-foreground print:text-black">{massMg || 0}</strong> mg
        </span>
        <span>
          <strong className="text-foreground print:text-black">{diluentMl || 0}</strong> mL diluyente
        </span>
      </div>

      {/* Concentration */}
      <div className="mt-4 rounded border border-foreground py-3 text-center print:border-black">
        <p className="text-xs uppercase tracking-wider text-muted-foreground print:text-gray-600">
          Concentración
        </p>
        <p className="mt-1 text-3xl font-bold font-display text-foreground print:text-black">
          {isFinite(concentration) && concentration > 0
            ? `${formatMl(concentration)} mg/mL`
            : "—"}
        </p>
      </div>

      {/* Dose table */}
      <table className="mt-5 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-foreground print:border-black">
            <th className="py-2 text-left font-semibold text-foreground print:text-black">Dosis</th>
            <th className="py-2 text-right font-semibold text-foreground print:text-black">Volumen</th>
          </tr>
        </thead>
        <tbody>
          {doseRows.map((row) => {
            const vol = concentration > 0 ? row.dose / concentration : NaN;
            return (
              <tr key={row.id} className="border-b border-border print:border-gray-300">
                <td className="py-2 text-foreground print:text-black">{row.dose} mg</td>
                <td className="py-2 text-right font-mono text-foreground print:text-black">
                  {formatMl(vol)} mL
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer disclaimer */}
      <p className="mt-6 text-center text-[10px] leading-tight text-muted-foreground print:text-gray-500">
        La preparación, dilución y administración debe ser realizada únicamente por profesionales de salud
        cualificados utilizando técnica estéril apropiada.
      </p>
    </div>
  );
};

export default PrintableCard;
