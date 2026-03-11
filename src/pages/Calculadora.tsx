import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Copy, RotateCcw, Printer } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrintableCard from "@/components/calculator/PrintableCard";
import { presets, type Preset } from "@/data/calculator-presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DoseRow {
  id: string;
  dose: number;
}

const LS_KEY = "alchem-calc-state";

const newId = () => crypto.randomUUID();

const defaultState = () => ({
  presetName: "" as string,
  productName: "",
  massMg: 0,
  diluentMl: 0,
  massMode: "preset" as "preset" | "custom",
  doseRows: [{ id: newId(), dose: 0 }] as DoseRow[],
});

type State = ReturnType<typeof defaultState>;

const loadState = (): State => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch {}
  return defaultState();
};

const formatMl = (val: number): string => {
  if (!isFinite(val) || isNaN(val)) return "—";
  return parseFloat(val.toFixed(2)).toString();
};

const Calculadora = () => {
  const [state, setState] = useState<State>(loadState);

  const { presetName, productName, massMg, diluentMl, massMode, doseRows } = state;

  const activePreset: Preset | undefined = presets.find((p) => p.name === presetName);
  const concentration = diluentMl > 0 ? massMg / diluentMl : 0;

  // Persist
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  const update = useCallback((patch: Partial<State>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  // Preset selection
  const handlePreset = (name: string) => {
    if (name === "__custom") {
      update({
        presetName: "",
        productName: "",
        massMg: 0,
        diluentMl: 0,
        massMode: "custom",
        doseRows: [{ id: newId(), dose: 0 }],
      });
      return;
    }
    const preset = presets.find((p) => p.name === name);
    if (!preset) return;
    const mass = preset.massOptions[0];
    const diluent = preset.defaultDiluents[0];
    update({
      presetName: name,
      productName: name,
      massMg: mass,
      diluentMl: diluent,
      massMode: "preset",
      doseRows: preset.doses.map((d) => ({ id: newId(), dose: d })),
    });
  };

  // Mass preset selection
  const handleMassPreset = (val: string) => {
    if (val === "__custom") {
      update({ massMode: "custom", massMg: 0 });
      return;
    }
    const mass = Number(val);
    if (!activePreset) return;
    const idx = activePreset.massOptions.indexOf(mass);
    const diluent = idx >= 0 ? activePreset.defaultDiluents[idx] : diluentMl;
    update({ massMode: "preset", massMg: mass, diluentMl: diluent });
  };

  // Dose row helpers
  const updateDoseRow = (id: string, dose: number) => {
    update({ doseRows: doseRows.map((r) => (r.id === id ? { ...r, dose } : r)) });
  };
  const removeRow = (id: string) => {
    if (doseRows.length <= 1) return;
    update({ doseRows: doseRows.filter((r) => r.id !== id) });
  };
  const duplicateRow = (id: string) => {
    const row = doseRows.find((r) => r.id === id);
    if (!row) return;
    const idx = doseRows.indexOf(row);
    const copy = { ...row, id: newId() };
    const next = [...doseRows];
    next.splice(idx + 1, 0, copy);
    update({ doseRows: next });
  };
  const addRow = () => {
    update({ doseRows: [...doseRows, { id: newId(), dose: 0 }] });
  };

  const resetForm = () => {
    const fresh = defaultState();
    setState(fresh);
    localStorage.removeItem(LS_KEY);
  };

  const numVal = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) || n < 0 ? 0 : n;
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10 md:px-6 lg:px-8 print:p-0 print:m-0">
        {/* Page header — hidden on print */}
        <div className="mb-8 print:hidden">
          <h1 className="text-3xl font-bold font-display text-foreground">
            Calculadora de Dosificación
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-body">
            Calcula concentraciones y volúmenes de inyección para péptidos liofilizados.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 print:grid-cols-1">
          {/* LEFT: Controls */}
          <div className="space-y-6 print:hidden">
            {/* Preset selector */}
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                Preset
              </Label>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <Button
                    key={p.name}
                    size="sm"
                    variant={presetName === p.name ? "default" : "outline"}
                    onClick={() => handlePreset(p.name)}
                    className="font-body"
                  >
                    {p.name}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant={presetName === "" ? "default" : "outline"}
                  onClick={() => handlePreset("__custom")}
                  className="font-body"
                >
                  Personalizado
                </Button>
              </div>
            </div>

            {/* Product name */}
            <div className="space-y-2">
              <Label htmlFor="product-name" className="font-body">Nombre del producto</Label>
              <Input
                id="product-name"
                value={productName}
                onChange={(e) => update({ productName: e.target.value })}
                placeholder="Ej: Tirzepatide"
                className="font-body"
              />
            </div>

            {/* Mass */}
            <div className="space-y-2">
              <Label className="font-body">Masa (mg)</Label>
              {activePreset ? (
                <div className="space-y-2">
                  <Select
                    value={massMode === "preset" ? String(massMg) : "__custom"}
                    onValueChange={handleMassPreset}
                  >
                    <SelectTrigger className="font-body">
                      <SelectValue placeholder="Seleccionar masa" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePreset.massOptions.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {m} mg
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom">Otro (personalizado)</SelectItem>
                    </SelectContent>
                  </Select>
                  {massMode === "custom" && (
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={massMg || ""}
                      onChange={(e) => update({ massMg: numVal(e.target.value) })}
                      placeholder="Ingresa masa en mg"
                      className="font-body"
                    />
                  )}
                </div>
              ) : (
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={massMg || ""}
                  onChange={(e) => update({ massMg: numVal(e.target.value) })}
                  placeholder="Ingresa masa en mg"
                  className="font-body"
                />
              )}
            </div>

            {/* Diluent */}
            <div className="space-y-2">
              <Label htmlFor="diluent" className="font-body">Diluyente (mL)</Label>
              <Input
                id="diluent"
                type="number"
                min={0}
                step="any"
                value={diluentMl || ""}
                onChange={(e) => update({ diluentMl: numVal(e.target.value) })}
                placeholder="Ej: 3"
                className="font-body"
              />
            </div>

            {/* Concentration display */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                Concentración
              </p>
              <p className="mt-1 text-2xl font-bold font-display text-primary">
                {concentration > 0 ? `${formatMl(concentration)} mg/mL` : "—"}
              </p>
            </div>

            {/* Dose rows */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                  Filas de dosis
                </Label>
                <Button size="sm" variant="outline" onClick={addRow} className="font-body gap-1">
                  <Plus className="h-3.5 w-3.5" /> Agregar
                </Button>
              </div>

              {doseRows.map((row) => {
                const vol = concentration > 0 ? row.dose / concentration : NaN;
                return (
                  <div key={row.id} className="flex items-center gap-2 rounded-md border border-border bg-card p-3">
                    {/* Dose input */}
                    <div className="flex-1">
                      {activePreset ? (
                        <Select
                          value={activePreset.doses.includes(row.dose) ? String(row.dose) : "__custom"}
                          onValueChange={(v) => {
                            if (v === "__custom") return;
                            updateDoseRow(row.id, Number(v));
                          }}
                        >
                          <SelectTrigger className="font-body h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {activePreset.doses.map((d) => (
                              <SelectItem key={d} value={String(d)}>
                                {d} mg
                              </SelectItem>
                            ))}
                            <SelectItem value="__custom">Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : null}
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={row.dose || ""}
                        onChange={(e) => updateDoseRow(row.id, numVal(e.target.value))}
                        placeholder="mg"
                        className={`font-body h-9 text-sm ${activePreset ? "mt-1" : ""}`}
                      />
                    </div>

                    {/* Result */}
                    <div className="w-24 text-right font-mono text-sm font-semibold text-foreground">
                      {formatMl(vol)} mL
                    </div>

                    {/* Actions */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0"
                      onClick={() => duplicateRow(row.id)}
                      title="Duplicar"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 text-destructive"
                      onClick={() => removeRow(row.id)}
                      title="Eliminar"
                      disabled={doseRows.length <= 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetForm} className="font-body gap-2">
                <RotateCcw className="h-4 w-4" /> Reiniciar
              </Button>
              <Button onClick={() => window.print()} className="font-body gap-2">
                <Printer className="h-4 w-4" /> Imprimir
              </Button>
            </div>
          </div>

          {/* RIGHT: Live preview / printable card */}
          <div>
            <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground font-body print:hidden">
              Vista previa de tarjeta
            </p>
            <PrintableCard
              productName={productName}
              massMg={massMg}
              diluentMl={diluentMl}
              concentration={concentration}
              doseRows={doseRows}
            />
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </main>
  );
};

export default Calculadora;
