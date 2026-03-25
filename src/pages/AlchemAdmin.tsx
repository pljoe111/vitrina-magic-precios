import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarIcon, Plus, Power, Trash2, Clock, LogOut, Eye, EyeOff } from "lucide-react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type AccessCode = {
  id: string;
  code: string;
  label: string | null;
  is_active: boolean;
  expires_at: string;
  created_at: string;
};

type FilterMode = "all" | "active" | "inactive";

const AlchemAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("all");

  // New code form
  const [newCode, setNewCode] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newExpiry, setNewExpiry] = useState<Date | undefined>();
  const [creating, setCreating] = useState(false);

  // Edit expiry
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editExpiry, setEditExpiry] = useState<Date | undefined>();

  const apiCall = useCallback(
    async (action: string, params: Record<string, unknown> = {}) => {
      const { data, error } = await supabase.functions.invoke("admin-manage-codes", {
        body: { action, username, password, ...params },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    [username, password]
  );

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiCall("list");
      setCodes(data.codes || []);
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
      setIsAuthenticated(true);
      toast({ title: "Bienvenido" });
      // fetch codes right after login
      const data = await apiCall("list");
      setCodes(data.codes || []);
    } catch {
      toast({ title: "Credenciales incorrectas", variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newCode || !newExpiry) {
      toast({ title: "Código y fecha de expiración son requeridos", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      await apiCall("create", {
        code: newCode,
        label: newLabel || null,
        expires_at: newExpiry.toISOString(),
      });
      setNewCode("");
      setNewLabel("");
      setNewExpiry(undefined);
      toast({ title: "Código creado" });
      await fetchCodes();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await apiCall("toggle_active", { id, is_active: !currentActive });
      toast({ title: currentActive ? "Código desactivado" : "Código activado" });
      await fetchCodes();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleUpdateExpiry = async (id: string) => {
    if (!editExpiry) return;
    try {
      await apiCall("update_expiry", { id, expires_at: editExpiry.toISOString() });
      setEditingId(null);
      setEditExpiry(undefined);
      toast({ title: "Fecha actualizada" });
      await fetchCodes();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este código permanentemente?")) return;
    try {
      await apiCall("delete", { id });
      toast({ title: "Código eliminado" });
      await fetchCodes();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const filteredCodes = codes.filter((c) => {
    if (filter === "active") return c.is_active && new Date(c.expires_at) > new Date();
    if (filter === "inactive") return !c.is_active || new Date(c.expires_at) <= new Date();
    return true;
  });

  const isExpired = (d: string) => new Date(d) <= new Date();

  // ── Login Screen ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center text-foreground">Admin</h1>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

  // ── Admin Dashboard ──
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Gestión de Códigos de Acceso</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/alchem-admin/cotizador">
                <FileText className="h-4 w-4 mr-2" /> Cotizador
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsAuthenticated(false)}>
              <LogOut className="h-4 w-4 mr-2" /> Salir
            </Button>
          </div>
        </div>

        {/* Create New Code */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Plus className="h-5 w-5" /> Crear Código
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="ej: PROMO2026" />
            </div>
            <div className="space-y-2">
              <Label>Etiqueta (opcional)</Label>
              <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="ej: Para Dr. García" />
            </div>
            <div className="space-y-2">
              <Label>Expira</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !newExpiry && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newExpiry ? format(newExpiry, "dd/MM/yyyy") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newExpiry}
                    onSelect={setNewExpiry}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creando..." : "Crear"}
            </Button>
          </div>
        </Card>

        {/* Filters */}
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as FilterMode[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Todos" : f === "active" ? "Activos" : "Inactivos"}
            </Button>
          ))}
          <span className="ml-auto text-sm text-muted-foreground self-center">
            {filteredCodes.length} código{filteredCodes.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando...</div>
          ) : filteredCodes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No hay códigos</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Etiqueta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.map((c) => {
                  const expired = isExpired(c.expires_at);
                  const active = c.is_active && !expired;

                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                      <TableCell className="text-muted-foreground">{c.label || "—"}</TableCell>
                      <TableCell>
                        {active ? (
                          <Badge className="bg-green-600 hover:bg-green-700">Activo</Badge>
                        ) : expired ? (
                          <Badge variant="destructive">Expirado</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === c.id ? (
                          <div className="flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  {editExpiry ? format(editExpiry, "dd/MM/yyyy") : "Fecha"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={editExpiry}
                                  onSelect={setEditExpiry}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <Button size="sm" onClick={() => handleUpdateExpiry(c.id)} disabled={!editExpiry}>
                              OK
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <span className={expired ? "text-destructive" : ""}>
                            {format(new Date(c.expires_at), "dd/MM/yyyy")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(c.created_at), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Cambiar expiración"
                          onClick={() => {
                            setEditingId(c.id);
                            setEditExpiry(new Date(c.expires_at));
                          }}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title={c.is_active ? "Desactivar" : "Activar"}
                          onClick={() => handleToggle(c.id, c.is_active)}
                        >
                          <Power className={cn("h-4 w-4", c.is_active ? "text-green-500" : "text-muted-foreground")} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Eliminar"
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AlchemAdmin;
