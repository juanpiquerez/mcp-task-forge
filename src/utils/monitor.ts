import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Monitors a process by its ID stored in Firestore under the "process" collection.
 * Streams the output of the associated gemini_output.log file if the process is running.
 * @param taskId The Firestore document ID in the "process" collection (should contain a field "pid" with the process PID)
 */
export async function monitorProcess(taskId: string): Promise<void> {
  if (!taskId) {
    console.error("Error: Please provide a process ID.");
    return;
  }

  // Fetch process info from Firestore
  const processDoc = await getDoc(doc(db, "process", taskId));
  if (!processDoc.exists()) {
    console.error(`Error: No process found in Firestore with ID "${taskId}".`);
    return;
  }

  const data = processDoc.data();
  const pid = data?.pid;
  if (!pid || typeof pid !== "number") {
    console.error(`Error: Invalid or missing PID in Firestore document "${taskId}".`);
    return;
  }

  // Check if the process is running
  try {
    process.kill(pid, 0);
  } catch (e) {
    console.log(`Process with PID ${pid} is no longer running.`);
    return;
  }

  const cwd = process.env.PATH_TO_DIRECTORY || ".";
  const outputFile = "gemini_output.log";
  const outputFilePath = path.resolve(cwd, outputFile);

  if (!fs.existsSync(outputFilePath)) {
    console.error(`Error: Output file not found at ${outputFilePath}.`);
    console.log(`The process ${pid} is running, but its output file is missing.`);
    return;
  }

  console.log(`Process ${pid} is running. Tailing output from ${outputFilePath}:`);
  console.log("---");

  // Stream the log file using 'tail -f'
  spawn("tail", ["-f", outputFilePath], { stdio: "inherit" });
}