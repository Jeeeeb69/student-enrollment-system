export interface Student {
  id: number;
  name: string;
}

export interface Subject {
  id: number;
  name: string;
  units: number;
}

export interface Section {
  id: number;
  name: string;
  capacity: number;
  current_count: number;
}

export interface Enrollment {
  id: number;
  student: number;
  subject: number;
  section?: number;
  status: "ENROLLED" | "WAITLISTED" | "DROPPED";
}