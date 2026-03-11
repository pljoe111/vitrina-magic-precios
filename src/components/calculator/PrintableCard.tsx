import logo from "@/assets/logo.png";

interface DoseRow {
  id: string;
  dose: number;
  volume: number;
}

interface PrintableCardProps {
  productName: string;
  massMg: number;
  diluentMl: number;
  concentration: number;
  doseRows: DoseRow[];
}

const PrintableCard = ({ productName, massMg, diluentMl, concentration, doseRows }: PrintableCardProps) => {
  const validRows = doseRows.filter((r) => r.dose > 0 && isFinite(r.volume));

  const formatMl = (v: number) => {
    if (!isFinite(v)) return "—";
    const s = v.toFixed(2);
    return parseFloat(s).toString();
  };

  return (
    <div className="printable-card border-2 border-foreground rounded-lg p-8 max-w-lg mx-auto bg-background font-body">
      {/* Header */}
      <div className="text-center border-b-2 border-foreground pb-4 mb-4">
        <img src={logo} alt="Alchem" className="h-8 mx-auto mb-3" />
        <h2 className="text-2xl font-bold tracking-wide uppercase font-display text-foreground">
          {productName || "Peptide"}
        </h2>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
          Reconstitution Reference Card
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 border-b border-foreground/30 pb-3 mb-3 text-sm">
        <div>
          <span className="text-muted-foreground">Mass:</span>{" "}
          <span className="font-semibold text-foreground">{massMg} mg</span>
        </div>
        <div className="text-right">
          <span className="text-muted-foreground">Diluent:</span>{" "}
          <span className="font-semibold text-foreground">{diluentMl} mL</span>
        </div>
      </div>

      {/* Concentration */}
      <div className="text-center py-4 border-b border-foreground/30 mb-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Concentration</p>
        <p className="text-3xl font-bold font-display text-foreground">
          {isFinite(concentration) ? formatMl(concentration) : "—"} mg/mL
        </p>
      </div>

      {/* Dose table */}
      {validRows.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-foreground">
              <th className="text-left py-2 font-semibold text-foreground">Dose (mg)</th>
              <th className="text-right py-2 font-semibold text-foreground">Volume (mL)</th>
            </tr>
          </thead>
          <tbody>
            {validRows.map((row) => (
              <tr key={row.id} className="border-b border-foreground/20">
                <td className="py-2 text-foreground">{row.dose}</td>
                <td className="py-2 text-right font-mono font-semibold text-foreground">{formatMl(row.volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Footer disclaimer */}
      <div className="mt-6 pt-4 border-t border-foreground/30">
        <p className="text-[10px] text-muted-foreground text-center leading-tight italic">
          Preparation, dilution, and administration should only be performed by qualified healthcare professionals
          using appropriate sterile technique.
        </p>
      </div>
    </div>
  );
};

export default PrintableCard;
