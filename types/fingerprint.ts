export interface VisitorFingerprint {
  id: string; // uuid
  fingerprint: string;
  user_agent: string;
  ip_address: string;
  country: string | null;
  is_bot: boolean;
  first_visited: string; // ISO date string
  last_visited: string; // ISO date string
  visit_count: number;
}
