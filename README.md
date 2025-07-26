# MCP Extension Sample

This project is an example of an MCP server using Firestore as the database for the `tickets` collection.

## How to run the project

1. **Install dependencies**

   ```sh
   npm install
   ```

2. **Set environment variables**

   Create a `.env` file at the root of the project with the following content (replace the values with your Firebase project credentials):

   ```
   API_KEY=your_api_key
   AUTH_DOMAIN=your_auth_domain
   PROJECT_ID=your_project_id
   STORAGE_BUCKET=your_storage_bucket
   MESSAGING_SENDER_ID=your_messaging_sender_id
   APP_ID=your_app_id
   ```

3. **Local development mode**

   You can run the server locally with:

   ```sh
   npm run dev
   ```

4. **Inspector mode (recommended for MCP development)**

   Run the following command to start the server in inspector mode:

   ```sh
   npx -y @modelcontextprotocol/inspector -- npx tsx ./src/main.ts
   ```

   > **Note:** If you use a task runner, you can define the command like this:
   >
   > ```json
   > "taksforge": {
   >   "command": "npx",
   >   "args": ["-y", "tsx", "[path to main.ts]"]
   > }
   > ```

---

The server exposes CRUD tools for the `tickets` collection in Firestore, using the following format:

```json
{
  "id": "ticketId",
  "data": {
    "title": "Title",
    "description": "Description",
    "executionPlan": "Execution plan",
    "createdAt": "Creation date"
  }
}
```

### MCP command examples

- **Create a ticket**

  ```json
  {
    "id": "ticketId",
    "data": {
      "title": "New Ticket",
      "description": "Ticket description",
      "executionPlan": "Ticket execution plan",
      "createdAt": "2023-10-05T12:00:00Z"
    }
  }
  ```

- **Read a ticket**

  ```json
  {
    "id": "ticketId"
  }
  ```

- **Update a ticket**

  ```json
  {
    "id": "ticketId",
    "data": {
      "title": "Updated Title"
    }
  }
  ```

- **Delete a ticket**

  ```json
  {
    "id": "ticketId",
    "data": null
  }
  ```

Make sure to replace `ticketId` with the actual ticket ID you want to work with.

## Notes

- This project uses Firestore as the database. Make sure you have a Firestore instance configured and the appropriate security rules to allow access from your MCP server.
- For more details on how the MCP server works and how to customize it, see the documentation for the [Model Context Protocol](https://github.com/microsoft/ModelContextProtocol).
