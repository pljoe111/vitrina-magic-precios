import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ArrowLeft, Search, Download, Users, Flame, Thermometer, Snowflake } from "lucide-react";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  city: string;
  country: string;
  profession: string;
  specialty: string | null;
  practice_type: string;
  clinic_name: string | null;
  role: string;
  patients_per_month: string;
  offers_peptides: boolean;
  uses_glp1: boolean;
  interests: string[];
  main_intent: string;
  lead_score: number;
  lead_classification: string;
  consent: boolean;
  created_at: string;
};

type ClassFilter = "all" | "CALIENTE" | "TIBIO" | "FRIO";

const classColors: Record<string, string> = {
  CALIENTE: "bg-red-600 hover:bg-red-700",
  TIBIO: "bg-orange-500 hover:bg-orange-600",
  FRIO: "bg-slate-500 hover:bg-slate-600",
};

const classIcons: Record<string, React.ReactNode> = {
  CALIENTE: <Flame className="h-3 w-3" />,
  TIBIO: <Thermometer className="h-3 w-3" />,
  FRIO: <Snowflake className="h-3 w-3" />,
};

const AdminLeads = () => {
  const [searchParams] = useSearchParams();
  const authUser = searchParams.get("u") || "";
  const authPass = searchParams.get("p") || "";

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<ClassFilter>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      // Use edge function with admin auth to read leads
      const { data, error } = await supabase.functions.invoke("admin-manage-codes", {
        body: { action: "list_leads", username: authUser, password: authPass },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setLeads(data.leads || []);
    } catch (e: any) {
      toast({ title: "Error cargando leads", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = leads.filter((l) => {
    const matchesClass = classFilter === "all" || l.lead_classification === classFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      l.full_name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.profession.toLowerCase().includes(q) ||
      (l.clinic_name && l.clinic_name.toLowerCase().includes(q));
    return matchesClass && matchesSearch;
  });

  const stats = {
    total: leads.length,
    caliente: leads.filter((l) => l.lead_classification === "CALIENTE").length,
    tibio: leads.filter((l) => l.lead_classification === "TIBIO").length,
    frio: leads.filter((l) => l.lead_classification === "FRIO").length,
  };

  const exportCSV = () => {
    const headers = [
      "Nombre", "Email", "Teléfono", "WhatsApp", "Ciudad", "País",
      "Profesión", "Especialidad", "Tipo práctica", "Clínica", "Rol",
      "Pacientes/mes", "Ofrece péptidos", "Usa GLP-1", "Intereses",
      "Intención", "Score", "Clasificación", "Fecha"
    ];
    const rows = filtered.map((l) => [
      l.full_name, l.email, l.phone, l.whatsapp || "", l.city, l.country,
      l.profession, l.specialty || "", l.practice_type, l.clinic_name || "", l.role,
      l.patients_per_month, l.offers_peptides ? "Sí" : "No", l.uses_glp1 ? "Sí" : "No",
      l.interests.join("; "), l.main_intent, l.lead_score, l.lead_classification,
      format(new Date(l.created_at), "dd/MM/yyyy HH:mm")
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_alchem_${format(new Date(), "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-selectable min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/alchem-admin">
                <ArrowLeft className="h-4 w-4 mr-1" /> Admin
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" /> Exportar CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </Card>
          <Card className="p-4 text-center">
            <Flame className="h-5 w-5 mx-auto mb-1 text-red-500" />
            <p className="text-2xl font-bold text-red-600">{stats.caliente}</p>
            <p className="text-xs text-muted-foreground">Calientes</p>
          </Card>
          <Card className="p-4 text-center">
            <Thermometer className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold text-orange-600">{stats.tibio}</p>
            <p className="text-xs text-muted-foreground">Tibios</p>
          </Card>
          <Card className="p-4 text-center">
            <Snowflake className="h-5 w-5 mx-auto mb-1 text-slate-400" />
            <p className="text-2xl font-bold text-slate-500">{stats.frio}</p>
            <p className="text-xs text-muted-foreground">Fríos</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email, ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {(["all", "CALIENTE", "TIBIO", "FRIO"] as ClassFilter[]).map((f) => (
            <Button
              key={f}
              variant={classFilter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setClassFilter(f)}
            >
              {f === "all" ? "Todos" : f}
            </Button>
          ))}
          <span className="ml-auto text-sm text-muted-foreground">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando leads...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No hay leads</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Profesión</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Clasificación</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow
                      key={l.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLead(selectedLead?.id === l.id ? null : l)}
                    >
                      <TableCell className="font-medium">{l.full_name}</TableCell>
                      <TableCell>{l.email}</TableCell>
                      <TableCell>{l.phone}</TableCell>
                      <TableCell>{l.city}, {l.country}</TableCell>
                      <TableCell>{l.profession}</TableCell>
                      <TableCell className="font-mono font-bold">{l.lead_score}</TableCell>
                      <TableCell>
                        <Badge className={classColors[l.lead_classification] || "bg-slate-500"}>
                          <span className="flex items-center gap-1">
                            {classIcons[l.lead_classification]}
                            {l.lead_classification}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(l.created_at), "dd/MM/yy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Detail Panel */}
        {selectedLead && (
          <Card className="p-6 space-y-4 border-primary/30">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{selectedLead.full_name}</h2>
              <Badge className={classColors[selectedLead.lead_classification]}>
                Score: {selectedLead.lead_score} — {selectedLead.lead_classification}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div><span className="text-muted-foreground">Email:</span> {selectedLead.email}</div>
              <div><span className="text-muted-foreground">Teléfono:</span> {selectedLead.phone}</div>
              <div><span className="text-muted-foreground">WhatsApp:</span> {selectedLead.whatsapp || "—"}</div>
              <div><span className="text-muted-foreground">Ciudad:</span> {selectedLead.city}, {selectedLead.country}</div>
              <div><span className="text-muted-foreground">Profesión:</span> {selectedLead.profession}</div>
              <div><span className="text-muted-foreground">Especialidad:</span> {selectedLead.specialty || "—"}</div>
              <div><span className="text-muted-foreground">Tipo práctica:</span> {selectedLead.practice_type}</div>
              <div><span className="text-muted-foreground">Clínica:</span> {selectedLead.clinic_name || "—"}</div>
              <div><span className="text-muted-foreground">Rol:</span> {selectedLead.role}</div>
              <div><span className="text-muted-foreground">Pacientes/mes:</span> {selectedLead.patients_per_month}</div>
              <div><span className="text-muted-foreground">Ofrece péptidos:</span> {selectedLead.offers_peptides ? "Sí" : "No"}</div>
              <div><span className="text-muted-foreground">Usa GLP-1:</span> {selectedLead.uses_glp1 ? "Sí" : "No"}</div>
              <div><span className="text-muted-foreground">Intención:</span> {selectedLead.main_intent}</div>
              <div className="md:col-span-2"><span className="text-muted-foreground">Intereses:</span> {selectedLead.interests.join(", ") || "—"}</div>
              <div><span className="text-muted-foreground">Registrado:</span> {format(new Date(selectedLead.created_at), "dd/MM/yyyy HH:mm")}</div>
            </div>
            {selectedLead.whatsapp && (
              <a
                href={`https://wa.me/${selectedLead.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" className="mt-2">Contactar por WhatsApp</Button>
              </a>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminLeads;
