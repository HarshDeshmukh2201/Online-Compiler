
import { execFile } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req) {
  let filePath;

  try {
    const { code, language } = await req.json();

    if (typeof code !== "string" || !code.trim()) {
      return Response.json(
        { output: "Please provide code to execute." },
        { status: 400 }
      );
    }

    if (!["js", "py"].includes(language)) {
      return Response.json(
        { output: "Unsupported language." },
        { status: 400 }
      );
    }

    const fileName = `temp-${randomUUID()}.${
      language === "py" ? "py" : "js"
    }`;

    filePath = path.join(os.tmpdir(), fileName);

    await fs.writeFile(filePath, code, "utf8");

    const command = language === "py" ? "python3" : "node";

    const result = await new Promise((resolve) => {
      execFile(
        command,
        [filePath],
        { timeout: 10000, maxBuffer: 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            resolve({
              output:
                stderr ||
                error.message ||
                "Code execution failed.",
            });
          } else {
            resolve({ output: stdout || stderr || "" });
          }
        }
      );
    });

    return Response.json(result);
  } catch (error) {
    console.error("Compile API error:", error);

    return Response.json(
      { output: "API error: " + error.message },
      { status: 500 }
    );
  } finally {
    if (filePath) {
      await fs.unlink(filePath).catch(() => {});
    }
  }
}
