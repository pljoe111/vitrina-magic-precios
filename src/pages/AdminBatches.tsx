import { useState, useCallback, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Power, Trash2, Pencil, Upload, FileText, Eye, EyeOff } from "lucide-react";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";

type Batch = {
  id: string;
  product_id: string;
  product_name: string;
  batch_number: string;
  lot_number: string;
  test_date: string | null;
  exp_date: string | null;
  purity: number | null;
  potency: string | null;
  contaminants: string | null;
  sterility: string | null;
  endotoxins: string | null;
  coa_url: string | null;
  coa_label: string | null;
  lab_partner_url: string | null;
  status: "pending" | "published" | "disabled";
  created_at: string;
};

type Filter = "all" | "pending" | "published" | "disabled";

const emptyForm: Partial<Batch> = {
  product_id: "",
  product_name: "",
  batch_number: "",
  lot_number: "",
  test_date: null,
  exp_date: "",
  purity: null,
  potency: "",
  contaminants: "None detected",
  sterility: "Pass",
  endotoxins: "Pass",
  coa_url: "",
  coa_label: "Purity/Potency (BTLabs)",
  lab_partner_url: "https://btlabtesting.com/",
};

const AdminBatches = () => {
  const [params] = useSearchParams();
  const [username, setUsername] = useState(params.get("u") || "");
  const [password, setPassword] = useState(params.get("p") || "");
  const [authed, setAuthed] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Batch | null>(null);
  const [form, setForm] = useState<Partial<Batch>>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const apiCall = useCallback(
    async (action: string, p: Record<string, unknown> = {}) => {
      const { data, error } = await supabase.functions.invoke("admin-manage-codes", {
        body: { action, username, password, ...p },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    [username, password]
  );

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiCall("list_batches");
      setBatches(data.batches || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      await apiCall("login");
      setAuthed(true);
      const data = await apiCall("list_batches");
      setBatches(data.batches || []);
    } catch {
      toast({ title: "Credenciales incorrectas", variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    if (username && password && !authed) handleLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (b: Batch) => {
    setEditing(b);
    setForm({ ...b });
    setDialogOpen(true);
  };

  const handleProductSelect = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    setForm((f) => ({
      ...f,
      product_id: productId,
      product_name: p ? `${p.name} ${p.totalMg}mg` : f.product_name,
    }));
  };

  const handleUpload = async (file: File) => {
    if (!form.batch_number) {
      toast({ title: "Captura primero el batch number", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const path = `${form.batch_number}-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("coa-pdfs")
        .upload(path, file, { contentType: "application/pdf", upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("coa-pdfs").getPublicUrl(path);
      setForm((f) => ({ ...f, coa_url: pub.publicUrl }));
      toast({ title: "PDF subido" });
    } catch (e: any) {
      toast({ title: "Error al subir", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.product_id || !form.product_name || !form.batch_number) {
      toast({ title: "Producto y batch son requeridos", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        lot_number: form.lot_number || form.batch_number,
        purity: form.purity === null || form.purity === undefined || (form.purity as any) === "" ? null : Number(form.purity),
        test_date: form.test_date || null,
        coa_url: form.coa_url || null,
      };
      if (editing) {
        await apiCall("update_batch", { id: editing.id, patch: payload });
        toast({ title: "Batch actualizado" });
      } else {
        await apiCall("create_batch", { batch: payload });
        toast({ title: "Batch creado" });
      }
      setDialogOpen(false);
      await fetchBatches();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDisable = async (b: Batch) => {
    const next = b.status === "disabled" ? (b.coa_url ? "published" : "pending") : "disabled";
    try {
      await apiCall("set_batch_status", { id: b.id, status: next });
      await fetchBatches();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (b: Batch) => {
    if (!confirm(`¿Eliminar permanentemente el batch ${b.batch_number}?`)) return;
    try {
      await apiCall("delete_batch", { id: b.id });
      toast({ title: "Batch eliminado" });
      await fetchBatches();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const filtered = useMemo(
    () => (filter === "all" ? batches : batches.filter((b) => b.status === filter)),
    [batches, filter]
  );

  if (!authed) {
    return (
      <div className="admin-selectable min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center text-foreground">Admin · Batches</h1>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <div className="relative">
                <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={loginLoading}>
              {loginLoading ? "Verificando..." : "Entrar"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="admin-selectable min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/alchem-admin"><ArrowLeft className="h-4 w-4 mr-2" />Volver</Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Análisis · Batches & CoAs</h1>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nuevo batch</Button>
        </div>

        <div className="flex gap-2">
          {(["all", "pending", "published", "disabled"] as Filter[]).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
              {f === "all" ? "Todos" : f === "pending" ? "Pendientes" : f === "published" ? "Publicados" : "Deshabilitados"}
            </Button>
          ))}
          <span className="ml-auto text-sm text-muted-foreground self-center">
            {filtered.length} batch{filtered.length !== 1 ? "es" : ""}
          </span>
        </div>

        <Card>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Sin batches</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pureza</TableHead>
                  <TableHead>Fecha prueba</TableHead>
                  <TableHead>CoA</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.product_name}</TableCell>
                    <TableCell className="font-mono text-xs">{b.batch_number}</TableCell>
                    <TableCell>
                      {b.status === "published" ? (
                        <Badge className="bg-green-600 hover:bg-green-700">Publicado</Badge>
                      ) : b.status === "pending" ? (
                        <Badge variant="secondary">Pendiente</Badge>
                      ) : (
                        <Badge variant="destructive">Deshabilitado</Badge>
                      )}
                    </TableCell>
                    <TableCell>{b.purity ? `${b.purity}%` : "—"}</TableCell>
                    <TableCell>{b.test_date || "—"}</TableCell>
                    <TableCell>
                      {b.coa_url ? (
                        <a href={b.coa_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs">
                          PDF
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(b)} title="Editar"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleToggleDisable(b)} title={b.status === "disabled" ? "Habilitar" : "Deshabilitar"}>
                        <Power className={cn("h-4 w-4", b.status !== "disabled" ? "text-green-500" : "text-muted-foreground")} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(b)} title="Eliminar">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar batch" : "Nuevo batch"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Producto *</Label>
              <Select value={form.product_id || ""} onValueChange={handleProductSelect}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nombre mostrado *</Label>
              <Input value={form.product_name || ""} onChange={(e) => setForm({ ...form, product_name: e.target.value })} placeholder="ej: Tirzepatide 60mg" />
            </div>
            <div className="space-y-2">
              <Label>Batch number *</Label>
              <Input value={form.batch_number || ""} onChange={(e) => setForm({ ...form, batch_number: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Lot number</Label>
              <Input value={form.lot_number || ""} onChange={(e) => setForm({ ...form, lot_number: e.target.value })} placeholder="(igual a batch si vacío)" />
            </div>
            <div className="space-y-2">
              <Label>Fecha de prueba</Label>
              <Input type="date" value={form.test_date || ""} onChange={(e) => setForm({ ...form, test_date: e.target.value || null })} />
            </div>
            <div className="space-y-2">
              <Label>Fecha de expiración (texto)</Label>
              <Input value={form.exp_date || ""} onChange={(e) => setForm({ ...form, exp_date: e.target.value })} placeholder="02/2031" />
            </div>
            <div className="space-y-2">
              <Label>Pureza (%)</Label>
              <Input type="number" step="0.01" value={form.purity ?? ""} onChange={(e) => setForm({ ...form, purity: e.target.value === "" ? null : Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Potencia</Label>
              <Input value={form.potency || ""} onChange={(e) => setForm({ ...form, potency: e.target.value })} placeholder="63.8mg (106.4%)" />
            </div>
            <div className="space-y-2">
              <Label>Contaminantes</Label>
              <Input value={form.contaminants || ""} onChange={(e) => setForm({ ...form, contaminants: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Esterilidad</Label>
              <Input value={form.sterility || ""} onChange={(e) => setForm({ ...form, sterility: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Endotoxinas</Label>
              <Input value={form.endotoxins || ""} onChange={(e) => setForm({ ...form, endotoxins: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Etiqueta CoA</Label>
              <Input value={form.coa_label || ""} onChange={(e) => setForm({ ...form, coa_label: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>URL laboratorio</Label>
              <Input value={form.lab_partner_url || ""} onChange={(e) => setForm({ ...form, lab_partner_url: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Certificado (PDF)</Label>
              {form.coa_url && (
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="h-4 w-4 text-primary" />
                  <a href={form.coa_url} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate">{form.coa_url}</a>
                  <Button size="sm" variant="ghost" onClick={() => setForm({ ...form, coa_url: "" })}>Quitar</Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input type="file" accept="application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} disabled={uploading} />
                {uploading && <Upload className="h-4 w-4 animate-pulse" />}
              </div>
              <p className="text-xs text-muted-foreground">Sin PDF el batch queda como "Reporte Pendiente".</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBatches;
