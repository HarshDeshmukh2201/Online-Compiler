
import { execFile } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req) {
  let filePath;

  try {
    const { code, language } = await req.json();

    if (typeof code !== "string" || !code.trim()) {
      return Response.json(
        { output: "Please provide code." },
        { status: 400 }
      );
    }

    if (!["js", "py"].includes(language)) {
      return Response.json(
        { output: "Unsupported language." },
        { status: 400 }
      );
    }

    // Python runs on Judge0
    if (language === "py") {
      const apiUrl = process.env.JUDGE0_API_URL;
      const apiKey = process.env.JUDGE0_API_KEY;

      if (!apiUrl) {
        return Response.json(
          { output: "JUDGE0_API_URL is not configured." },
          { status: 500 }
        );
      }

      const headers = {
        "Content-Type": "application/json",
      };

      // Include only if your provider requires an API key.
      if (apiKey) {
        headers["X-RapidAPI-Key"] = apiKey;
      }

      const response = await fetch(
        `${apiUrl.replace(/\/$/, "")}/submissions?base64_encoded=false&wait=true`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            language_id: 71,
            source_code: code,
          }),
          signal: AbortSignal.timeout(20000),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Judge0 error:", response.status, result);

        return Response.json(
          { output: result.message || result.error || "Judge0 request failed." },
          { status: 502 }
        );
      }

      return Response.json({
        output:
          result.stdout ??
          result.stderr ??
          result.compile_output ??
          result.message ??
          result.status?.description ??
          "No output",
      });
    }

    // Keep JavaScript execution on Node.js
    filePath = path.join(os.tmpdir(), `temp-${randomUUID()}.js`);
    await fs.writeFile(filePath, code, "utf8");

    const result = await new Promise((resolve) => {
      execFile(
        "node",
        [filePath],
        { timeout: 10000, maxBuffer: 1024 * 1024 },
        (error, stdout, stderr) => {
          resolve({
            output: error
              ? stderr || error.message
              : stdout || stderr || "",
          });
        }
      );
    });

    return Response.json(result);
  } catch (error) {
    console.error("Compile API error:", error);

    return Response.json(
      { output: error.message || "API error" },
      { status: 500 }
    );
  } finally {
    if (filePath) {
      await fs.unlink(filePath).catch(() => {});
    }
  }
}
