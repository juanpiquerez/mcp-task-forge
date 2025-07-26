import * as fs from "fs";
import * as path from "path";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { execSync } from "child_process";

/**
 * Monitors a process by its ID stored in Firestore under the "process" collection.
 * Returns the output of the associated gemini_output-[id].log file and the process status.
 * @param taskId The Firestore document ID in the "process" collection (should contain a field "pid" with the process PID)
 */
export async function monitorProcess(taskId: string): Promise<string> {
  if (!taskId) {
    console.error("Error: Please provide a process ID.");
    return "Error: Please provide a process ID.";
  }

  // Fetch process info from Firestore
  const processDoc = await getDoc(doc(db, "process", taskId));
  if (!processDoc.exists()) {
    console.error(`Error: No process found in Firestore with ID "${taskId}".`);
    return `Error: No process found in Firestore with ID "${taskId}".`;
  }

  const data = processDoc.data();
  const pid = data?.pid;
  if (!pid || typeof pid !== "number") {
    console.error(`Error: Invalid or missing PID in Firestore document "${taskId}".`);
    return `Error: Invalid or missing PID in Firestore document "${taskId}".`;
  }
  const cwd = process.env.PATH_TO_DIRECTORY || ".";
  const outputFile = `gemini_output-${taskId}.log`;
  const outputFilePath = path.resolve(cwd, outputFile);

  if (!fs.existsSync(outputFilePath)) {
    console.error(`Error: Output file not found at ${outputFilePath}.`);
    return `The process ${pid} is running, but its output file is missing.`;
  }

  // Use 'cat' to read the file content
  let output: string;
  try {
    output = execSync(`cat "${outputFilePath}"`).toString();
  } catch (e) {
    output = "";
  }

  // Check if the process is running
  try {
    process.kill(pid, 0);
    // If no error, process is running
    return `Process with PID ${pid} is still running.\n\nCurrent output:\n${output}`;
  } catch (e) {
    // If error, process has finished
    return `Process with PID ${pid} has already finished.\n\nFinal output:\n${output}`;
  }
}