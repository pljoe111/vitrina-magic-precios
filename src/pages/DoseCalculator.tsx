import { useState, useEffect, useCallback, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { presets, type Preset } from "@/data/calculator-presets";
import PrintableCard from "@/components/calculator/PrintableCard";
import Navbar from "@/components/Navbar";
import { Plus, Copy, Trash2, RotateCcw, Printer } from "lucide-react";

const STORAGE_KEY = "alchem-dose-calc";

interface DoseRow {
  id: string;
  dose: number;
  customDose: boolean;
}

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

const DoseCalculator = () => {
  const saved = loadState();

  const [productName, setProductName] = useState<string>(saved?.productName ?? "");
  const [activePreset, setActivePreset] = useState<Preset | null>(
    saved?.presetName ? presets.find((p) => p.name === saved.presetName) ?? null : null
  );
  const [massMg, setMassMg] = useState<string>(saved?.massMg ?? "");
  const [isCustomMass, setIsCustomMass] = useState<boolean>(saved?.isCustomMass ?? false);
  const [diluentMl, setDiluentMl] = useState<string>(saved?.diluentMl ?? "");
  const [doseRows, setDoseRows] = useState<DoseRow[]>(
    saved?.doseRows ?? [{ id: genId(), dose: 0, customDose: false }]
  );

  // Persist to localStorage
  useEffect(() => {
    const data = {
      productName,
      presetName: activePreset?.name ?? null,
      massMg,
      isCustomMass,
      diluentMl,
      doseRows,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [productName, activePreset, massMg, isCustomMass, diluentMl, doseRows]);

  const massNum = parseFloat(massMg) || 0;
  const diluentNum = parseFloat(diluentMl) || 0;
  const concentration = diluentNum > 0 ? massNum / diluentNum : 0;

  const calcVolume = (doseMg: number) => {
    if (concentration <= 0) return 0;
    return doseMg / concentration;
  };

  const formatMl = (v: number) => {
    if (!isFinite(v) || v === 0) return "—";
    return parseFloat(v.toFixed(2)).toString();
  };

  // Preset selection
  const handlePresetSelect = (presetName: string) => {
    const preset = presets.find((p) => p.name === presetName);
    if (!preset) return;
    setActivePreset(preset);
    setProductName(preset.name);
    setIsCustomMass(false);
    // Set first mass option by default
    const firstMass = preset.massOptions[0];
    setMassMg(String(firstMass));
    setDiluentMl(String(preset.defaultMlMap[firstMass]));
    // Reset dose rows with first dose option
    setDoseRows([{ id: genId(), dose: preset.doseOptions[0], customDose: false }]);
  };

  const handleMassPresetSelect = (val: string) => {
    if (val === "custom") {
      setIsCustomMass(true);
      setMassMg("");
      return;
    }
    setIsCustomMass(false);
    const num = parseFloat(val);
    setMassMg(val);
    if (activePreset && activePreset.defaultMlMap[num] !== undefined) {
      setDiluentMl(String(activePreset.defaultMlMap[num]));
    }
  };

  // Dose row handlers
  const addRow = () => setDoseRows((r) => [...r, { id: genId(), dose: 0, customDose: false }]);

  const removeRow = (id: string) =>
    setDoseRows((r) => (r.length > 1 ? r.filter((row) => row.id !== id) : r));

  const duplicateRow = (id: string) =>
    setDoseRows((r) => {
      const idx = r.findIndex((row) => row.id === id);
      if (idx === -1) return r;
      const copy = { ...r[idx], id: genId() };
      const next = [...r];
      next.splice(idx + 1, 0, copy);
      return next;
    });

  const updateRowDose = (id: string, dose: number, customDose = false) =>
    setDoseRows((r) => r.map((row) => (row.id === id ? { ...row, dose, customDose } : row)));

  const resetForm = () => {
    setProductName("");
    setActivePreset(null);
    setMassMg("");
    setIsCustomMass(false);
    setDiluentMl("");
    setDoseRows([{ id: genId(), dose: 0, customDose: false }]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const computedRows = doseRows.map((r) => ({
    id: r.id,
    dose: r.dose,
    volume: calcVolume(r.dose),
  }));

  const massInvalid = massMg !== "" && (massNum <= 0 || isNaN(Number(massMg)));
  const diluentInvalid = diluentMl !== "" && (diluentNum <= 0 || isNaN(Number(diluentMl)));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">Peptide Dose Calculator</h1>
            <p className="text-muted-foreground text-sm mt-1 font-body">
              Calculate reconstitution volumes for precise dosing.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={resetForm} className="gap-2 no-print">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT: Controls */}
          <div className="space-y-6 no-print">
            {/* Preset selector */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                    Preset
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {presets.map((p) => (
                      <Button
                        key={p.name}
                        variant={activePreset?.name === p.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePresetSelect(p.name)}
                      >
                        {p.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Product name */}
                <div>
                  <Label htmlFor="productName" className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                    Product Name
                  </Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Tirzepatide"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mass & Diluent */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* Mass */}
                <div>
                  <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                    Mass (mg)
                  </Label>
                  {activePreset && !isCustomMass ? (
                    <Select
                      value={massMg}
                      onValueChange={handleMassPresetSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mass" />
                      </SelectTrigger>
                      <SelectContent>
                        {activePreset.massOptions.map((m) => (
                          <SelectItem key={m} value={String(m)}>
                            {m} mg
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom…</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={massMg}
                        onChange={(e) => setMassMg(e.target.value)}
                        placeholder="Enter mass in mg"
                        className={massInvalid ? "border-destructive" : ""}
                      />
                      {activePreset && isCustomMass && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsCustomMass(false);
                            const first = activePreset.massOptions[0];
                            setMassMg(String(first));
                            setDiluentMl(String(activePreset.defaultMlMap[first]));
                          }}
                          className="shrink-0 text-xs"
                        >
                          Presets
                        </Button>
                      )}
                    </div>
                  )}
                  {massInvalid && (
                    <p className="text-xs text-destructive mt-1">Enter a valid positive number.</p>
                  )}
                </div>

                {/* Diluent */}
                <div>
                  <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                    Diluent (mL)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={diluentMl}
                    onChange={(e) => setDiluentMl(e.target.value)}
                    placeholder="Enter diluent in mL"
                    className={diluentInvalid ? "border-destructive" : ""}
                  />
                  {diluentInvalid && (
                    <p className="text-xs text-destructive mt-1">Enter a valid positive number.</p>
                  )}
                </div>

                {/* Concentration result */}
                <div className="rounded-lg bg-secondary p-4 text-center">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Concentration</p>
                  <p className="text-2xl font-bold font-display text-foreground">
                    {concentration > 0 ? formatMl(concentration) : "—"}{" "}
                    <span className="text-sm font-normal text-muted-foreground">mg/mL</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dose Rows */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                    Dose Rows
                  </Label>
                  <Button variant="outline" size="sm" onClick={addRow} className="gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Add Row
                  </Button>
                </div>

                {doseRows.map((row) => (
                  <div key={row.id} className="flex items-center gap-2 group">
                    {/* Dose input */}
                    {activePreset && !row.customDose ? (
                      <Select
                        value={row.dose > 0 ? String(row.dose) : ""}
                        onValueChange={(v) => {
                          if (v === "custom") {
                            updateRowDose(row.id, 0, true);
                          } else {
                            updateRowDose(row.id, parseFloat(v), false);
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Dose" />
                        </SelectTrigger>
                        <SelectContent>
                          {activePreset.doseOptions.map((d) => (
                            <SelectItem key={d} value={String(d)}>
                              {d} mg
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom…</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={row.dose || ""}
                        onChange={(e) => updateRowDose(row.id, parseFloat(e.target.value) || 0, true)}
                        placeholder="mg"
                        className="w-32"
                      />
                    )}

                    {/* Arrow */}
                    <span className="text-muted-foreground text-sm">→</span>

                    {/* Calculated mL */}
                    <div className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono font-semibold text-foreground min-w-[80px] text-center">
                      {row.dose > 0 && concentration > 0
                        ? `${formatMl(calcVolume(row.dose))} mL`
                        : "— mL"}
                    </div>

                    {/* Actions */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-50 hover:opacity-100"
                      onClick={() => duplicateRow(row.id)}
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-50 hover:opacity-100 hover:text-destructive"
                      onClick={() => removeRow(row.id)}
                      title="Remove"
                      disabled={doseRows.length === 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Print button */}
            <Button onClick={() => window.print()} className="w-full gap-2">
              <Printer className="h-4 w-4" /> Print Dosing Card
            </Button>
          </div>

          {/* RIGHT: Live preview */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-body no-print">
              Live Preview
            </p>
            <PrintableCard
              productName={productName}
              massMg={massNum}
              diluentMl={diluentNum}
              concentration={concentration}
              doseRows={computedRows}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoseCalculator;
