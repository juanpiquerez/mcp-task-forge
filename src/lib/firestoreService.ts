// src/firestoreService.ts
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import { z } from "zod";

// Schema Zod para un ticket
export const TicketSchema = z.object({
  title: z.string(),
  description: z.string(),
  executionPlan: z.string(),
  status: z.enum(["pending", "running", "completed", "failed"]).default("pending"),
  createdAt: z.string(),
});

export type Ticket = z.infer<typeof TicketSchema>;

// Crear ticket
export const createTicket = async (id: string, ticket: Ticket): Promise<void> => {
  await setDoc(doc(db, "tickets", id), ticket);
};

// Leer un ticket por ID
export const readTicket = async (id: string): Promise<{ id: string; data: Ticket } | null> => {
  const snapshot = await getDoc(doc(db, "tickets", id));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  // Validar con Zod
  const parsed = TicketSchema.safeParse(data);
  if (!parsed.success) return null;
  return { id: snapshot.id, data: parsed.data };
};

// Leer todos los tickets
export const readAllTickets = async (): Promise<{ id: string; data: Ticket }[]> => {
  const querySnapshot = await getDocs(collection(db, "tickets"));
  return querySnapshot.docs
    .map(docSnap => {
      const data = docSnap.data();
      const parsed = TicketSchema.safeParse(data);
      if (!parsed.success) return null;
      return { id: docSnap.id, data: parsed.data };
    })
    .filter((item): item is { id: string; data: Ticket } => item !== null);
};

// Actualizar ticket
export const updateTicket = async (id: string, ticket: Partial<Ticket>): Promise<void> => {
  await updateDoc(doc(db, "tickets", id), ticket);
};

// Eliminar ticket
export const deleteTicket = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "tickets", id));
};

// --- PROCESS COLLECTION SCHEMA & SERVICES ---

// Zod schema for a process (only id)
export const ProcessSchema = z.object({
  id: z.string(),
  pid: z.number()
});

export type Process = z.infer<typeof ProcessSchema>;

// Create process
export const createProcess = async (id: string): Promise<void> => {
  await setDoc(doc(db, "process", id), { id });
};

// Read a process by ID
export const readProcess = async (id: string): Promise<{ id: string; pid: number } | null> => {
  const snapshot = await getDoc(doc(db, "process", id));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const parsed = ProcessSchema.safeParse(data);
  if (!parsed.success) return null;
  return { id: snapshot.id, pid: parsed.data.pid };
};

// Read all processes
export const readAllProcesses = async (): Promise<{ id: string; pid: number }[]> => {
  const querySnapshot = await getDocs(collection(db, "process"));
  return querySnapshot.docs
    .map(docSnap => {
      const data = docSnap.data();
      const parsed = ProcessSchema.safeParse(data);
      if (!parsed.success) return null;
      return { id: docSnap.id, pid: parsed.data.pid };
    })
    .filter((item): item is { id: string; pid: number } => item !== null);
};

// Delete process
export const deleteProcess = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "process", id));
};
