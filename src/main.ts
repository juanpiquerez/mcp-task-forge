import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import "dotenv/config";
import {
  createTicket,
  readAllTickets,
  readTicket,
  updateTicket,
  deleteTicket,
} from "./lib/firestoreService";

const server = new McpServer({
  name: "Ticket Server",
  description: "A server for managing tickets using Model Context Protocol and Firestore",
  version: "1.0.0",
});

// Crear ticket
server.registerTool(
  "create_ticket",
  {
    description: "Creates a new ticket in the system. Requires title, description, and execution plan.",
    inputSchema: {
      title: z.string().describe("Title of the ticket"),
      description: z.string().describe("Description of the ticket"),
      executionPlan: z.string().describe("Execution plan for the ticket"),
    },
  },
  async ({ title, description, executionPlan }) => {
    const id = Math.random().toString(36).slice(2); // Simple ID generator
    const createdAt = new Date().toISOString();
    await createTicket(id, { title, description, executionPlan, createdAt });
    return {
      content: [
        {
          type: "text",
          text: `Ticket created with ID: ${id}`,
        },
      ],
    };
  }
);

// Leer todos los tickets
server.registerTool(
  "get_tickets",
  {
    description: "Returns all tickets in the system.",
  },
  async () => {
    const data = await readAllTickets();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// Leer un ticket por ID
server.registerTool(
  "get_ticket",
  {
    description: "Returns a ticket by its ID.",
    inputSchema: {
      id: z.string().describe("ID of the ticket"),
    },
  },
  async ({ id }) => {
    const data = await readTicket(id);
    if (!data) {
      return {
        content: [
          {
            type: "text",
            text: `Ticket with ID ${id} not found.`,
          },
        ],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ id, data }, null, 2),
        },
      ],
    };
  }
);

// Actualizar ticket
server.registerTool(
  "update_ticket",
  {
    description: "Updates an existing ticket by ID. You can update title, description, or execution plan.",
    inputSchema: {
      id: z.string().describe("ID of the ticket"),
      title: z.string().optional().describe("New title"),
      description: z.string().optional().describe("New description"),
      executionPlan: z.string().optional().describe("New execution plan"),
    },
    annotations: { destructiveHint: true }
  },
  async ({ id, title, description, executionPlan }) => {
    await updateTicket(id, { title, description, executionPlan });
    return {
      content: [
        {
          type: "text",
          text: `Ticket with ID ${id} updated.`,
        },
      ],
    };
  }
);

// Eliminar ticket
server.registerTool(
  "delete_ticket",
  {
    description: "Deletes a ticket by its ID.",
    inputSchema: {
      id: z.string().describe("ID of the ticket"),
    },
    annotations: { destructiveHint: true }
  },
  async ({ id }) => {
    await deleteTicket(id);
    return {
      content: [
        {
          type: "text",
          text: `Ticket with ID ${id} deleted.`,
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
(async () => {
  await server.connect(transport);
  console.log("Server is running and listening for requests...");
})();