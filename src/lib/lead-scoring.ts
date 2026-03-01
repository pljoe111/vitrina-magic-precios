export interface LeadData {
  practice_type: string;
  role: string;
  patients_per_month: string;
  offers_peptides: boolean;
  uses_glp1: boolean;
  main_intent: string;
  interests: string[];
  clinic_name?: string;
  email?: string;
}

export interface LeadScore {
  score: number;
  classification: "CALIENTE" | "TIBIO" | "FRIO";
}

export function calculateLeadScore(data: LeadData): LeadScore {
  let score = 0;

  // Practice type
  const highPractice = ["clinica_estetica", "medspa", "wellness_longevidad"];
  if (highPractice.includes(data.practice_type)) score += 3;
  else if (data.practice_type === "consulta_privada") score += 2;
  else if (["hospital", "distribuidor"].includes(data.practice_type)) score += 1;

  // Role
  if (["propietario", "socio"].includes(data.role)) score += 3;
  else if (data.role === "empleado") score += 1;

  // Patient volume
  if (data.patients_per_month === "300+") score += 3;
  else if (data.patients_per_month === "100-300") score += 2;
  else if (data.patients_per_month === "50-100") score += 1;

  // Current therapies
  if (data.offers_peptides && data.uses_glp1) score += 5;
  else {
    if (data.offers_peptides) score += 3;
    if (data.uses_glp1) score += 3;
  }

  // Intent
  if (["implementar_servicios", "encontrar_proveedores"].includes(data.main_intent)) score += 3;
  else if (["capacitacion_clinica", "escalar_abrir_clinica"].includes(data.main_intent)) score += 2;
  else if (data.main_intent === "obtener_protocolos") score += 1;

  // Interests (max +3)
  const scoringInterests = ["nad_iv", "peptidos_regenerativos", "glp1_control_peso"];
  const interestScore = data.interests.filter(i => scoringInterests.includes(i)).length;
  score += Math.min(interestScore, 3);

  // Classification
  let classification: LeadScore["classification"];
  if (score >= 12) classification = "CALIENTE";
  else if (score >= 6) classification = "TIBIO";
  else classification = "FRIO";

  // Override: Owner/Partner + high intent = CALIENTE
  if (
    ["propietario", "socio"].includes(data.role) &&
    ["encontrar_proveedores", "implementar_servicios"].includes(data.main_intent)
  ) {
    classification = "CALIENTE";
  }

  return { score, classification };
}

export function isNonProfessionalEmail(email: string): boolean {
  const freeProviders = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "live.com", "icloud.com", "aol.com"];
  const domain = email.split("@")[1]?.toLowerCase();
  return freeProviders.includes(domain);
}
