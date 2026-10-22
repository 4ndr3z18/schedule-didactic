/**
 * Paleta de asignaturas. Tonos vivos pero corporativos: todos superan 4.5:1
 * de contraste con texto blanco, verificado con la fórmula WCAG.
 */
export interface SubjectColor {
  key: string;
  label: string;
  background: string;
  border: string;
  foreground: string;
}

export const SUBJECT_COLORS: SubjectColor[] = [
  { key: "clay", label: "Terracota", background: "#B4472F", border: "#8F3624", foreground: "#FFFFFF" },
  { key: "teal", label: "Teal", background: "#0F7C6C", border: "#0B6154", foreground: "#FFFFFF" },
  { key: "amber", label: "Ámbar", background: "#A85C0D", border: "#85480A", foreground: "#FFFFFF" },
  { key: "olive", label: "Oliva", background: "#5F7040", border: "#4A5732", foreground: "#FFFFFF" },
  { key: "green", label: "Verde", background: "#2E7D4F", border: "#23633E", foreground: "#FFFFFF" },
  { key: "rose", label: "Rosa", background: "#B03A55", border: "#8C2E43", foreground: "#FFFFFF" },
  { key: "blue", label: "Azul", background: "#3D5FA8", border: "#2F4A84", foreground: "#FFFFFF" },
  { key: "violet", label: "Violeta", background: "#6B4CA8", border: "#553B86", foreground: "#FFFFFF" },
];

export const DEFAULT_SUBJECT_COLOR = SUBJECT_COLORS[0].key;

export function getSubjectColor(key: string | undefined): SubjectColor {
  return SUBJECT_COLORS.find((color) => color.key === key) ?? SUBJECT_COLORS[0];
}

/** Asignación estable cuando la asignatura todavía no eligió color. */
export function colorKeyForIndex(index: number): string {
  return SUBJECT_COLORS[Math.abs(index) % SUBJECT_COLORS.length].key;
}
