/**
 * Shared mock personnel registry.
 * The QR token stored on each person's card is: `DVLA-NSS-{id}-{secret}`
 * In a real system this would be a signed JWT or encrypted blob from a backend.
 * The scanner decodes the QR, finds the matching personnel record, and records attendance.
 */

export type PersonnelRecord = {
  id: string;
  name: string;
  department: string;
  avatar: string;
  token: string;
  status: "Active" | "Inactive";
};

// Deterministic "secrets" so QR codes survive page refreshes in the demo.
export const PERSONNEL_REGISTRY: PersonnelRecord[] = [
  { id: "NSS-001", name: "John Doe",     department: "Operations", avatar: "JD", token: "DVLA-NSS-NSS-001-A1B2C3D", status: "Active"   },
  { id: "NSS-014", name: "Sarah Malik",  department: "HR",         avatar: "SM", token: "DVLA-NSS-NSS-014-E4F5G6H", status: "Active"   },
  { id: "NSS-022", name: "Amina Yusuf",  department: "Finance",    avatar: "AY", token: "DVLA-NSS-NSS-022-I7J8K9L", status: "Inactive" },
  { id: "NSS-033", name: "Michael Chen", department: "IT",         avatar: "MC", token: "DVLA-NSS-NSS-033-M0N1O2P", status: "Active"   },
  { id: "NSS-047", name: "Kofi Mensah",  department: "Operations", avatar: "KM", token: "DVLA-NSS-NSS-047-Q3R4S5T", status: "Active"   },
  { id: "NSS-058", name: "Esi Boateng",  department: "IT",         avatar: "EB", token: "DVLA-NSS-NSS-058-U6V7W8X", status: "Inactive" },
];

export function lookupToken(scannedValue: string): PersonnelRecord | null {
  return PERSONNEL_REGISTRY.find((p) => p.token === scannedValue) ?? null;
}
