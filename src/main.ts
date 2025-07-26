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
import { runGeminiWithProcess } from "./utils/cli";
import { executeTaskPrompt } from "./utils/promt";
import { monitorProcess } from "./utils/monitor";

const server = new McpServer({
  name: "Ticket Server",
  description: "A server for managing tickets using Model Context Protocol and Firestore",
  version: "1.0.0",
});

// Create ticket
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
    await createTicket(id, { title, description, executionPlan, createdAt, status: "pending" });
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

// Get all tickets
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

// Get a ticket by ID
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

// Update ticket
server.registerTool(
  "update_ticket",
  {
    description: "Updates an existing ticket by ID. You can update title, description, execution plan, or status.",
    inputSchema: {
      id: z.string().describe("ID of the ticket"),
      title: z.string().optional().describe("New title"),
      description: z.string().optional().describe("New description"),
      executionPlan: z.string().optional().describe("New execution plan"),
      status: z.enum(["pending", "running", "completed", "failed"]).optional().describe("New status")
    },
    annotations: { destructiveHint: true }
  },
  async ({ id, title, description, executionPlan, status }) => {
    // Only include fields that are defined
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (executionPlan !== undefined) updateData.executionPlan = executionPlan;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No fields provided to update for ticket with ID ${id}.`,
          },
        ],
      };
    }

    await updateTicket(id, updateData);
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

// Delete ticket
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

// Run Gemini process for a ticket
server.registerTool(
  "run_gemini",
  {
    description: "Runs the Gemini model with a given prompt for a ticket.",
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
    const {
      title,
      description,
      executionPlan
    } = data.data;
    const prompt = executeTaskPrompt(description, executionPlan, id);

    await runGeminiWithProcess(id, prompt);
    await updateTicket(id, { status: "running" });
    return {
      content: [
        {
          type: "text",
          text: `Task ${title} has been executed.`,
        },
      ],
    };
  }
);

// Monitor Gemini process
server.registerTool(
  "monitor_process",
  {
    description: "Monitors the Gemini process for a given ticket.",
    inputSchema: {
      id: z.string().describe("ID of the ticket"),
    },
  },
  async ({ id }) => {
    const data = await monitorProcess(id);
    return {
      content: [
        {
          type: "text",
          text: `${data}`,
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