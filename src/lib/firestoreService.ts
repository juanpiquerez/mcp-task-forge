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
