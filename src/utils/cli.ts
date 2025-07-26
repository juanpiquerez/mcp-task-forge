import * as dotenv from "dotenv";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";

dotenv.config();

/**
 * Runs the gemini process with the given prompt, saves the child PID in Firestore "process" collection with the provided id.
 * @param id The process id to use as Firestore document id
 * @param prompt The prompt to send to gemini
 */
export async function runGeminiWithProcess(id: string, prompt: string): Promise<void> {
  if (!id) {
    console.error("Missing process id");
    process.exit(1);
  }
  if (!prompt) {
    console.error("Missing prompt");
    process.exit(1);
  }

  const cwd = process.env.PATH_TO_DIRECTORY || ".";
  const outputFile = `gemini_output-${id}.log`;
  const outputFilePath = path.resolve(cwd, outputFile);

  const command = `gemini -m gemini-2.5-flash -y -p "${prompt.replace(/"/g, '\\"')}" > "${outputFilePath}" 2>&1`;

  const child = spawn(command, {
    cwd,
    detached: true,
    shell: true,
    stdio: "ignore",
  });

  // Allow the parent process to exit independently of the child.
  child.unref();

  // Save the PID and id in Firestore "process" collection
  const pid = child.pid;
  if (pid) {
    await setDoc(doc(db, "process", id), { id, pid });
    // Optionally, you can log or handle success here
  } else {
    console.error("Failed to obtain child process PID.");
  }
}

