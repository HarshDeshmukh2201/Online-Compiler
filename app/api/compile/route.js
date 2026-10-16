
export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req) {
  try {
    const { code, language } = await req.json();

    if (typeof code !== "string" || !code.trim()) {
      return Response.json(
        { output: "Please enter your code." },
        { status: 400 }
      );
    }

    const languageIds = {
      js: 63, // JavaScript (Node.js)
      py: 71, // Python 3
    };

    if (!Object.hasOwn(languageIds, language)) {
      return Response.json(
        { output: "Unsupported language." },
        { status: 400 }
      );
    }

    const baseUrl = process.env.JUDGE0_API_URL?.replace(/\/+$/, "");

    if (!baseUrl) {
      return Response.json(
        { output: "JUDGE0_API_URL is not configured." },
        { status: 500 }
      );
    }

    const headers = {
      "Content-Type": "application/json",
    };

    // Optional: configure these for your RapidAPI provider.
    if (process.env.JUDGE0_API_KEY) {
      headers["X-RapidAPI-Key"] =
        process.env.JUDGE0_API_KEY;
    }

    if (process.env.JUDGE0_RAPIDAPI_HOST) {
      headers["X-RapidAPI-Host"] =
        process.env.JUDGE0_RAPIDAPI_HOST;
    }

    // Submit code to Judge0
    const submitResponse = await fetch(
      `${baseUrl}/submissions?base64_encoded=false&wait=false`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          source_code: code,
          language_id: languageIds[language],
        }),
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      }
    );

    const submission = await submitResponse.json();

    if (!submitResponse.ok || !submission.token) {
      console.error("Judge0 submission error:", submission);

      return Response.json(
        {
          output:
            submission.message ||
            submission.error ||
            "Failed to submit code to Judge0.",
        },
        { status: 502 }
      );
    }

    // Poll until execution completes
    for (let i = 0; i < 12; i++) {
      await sleep(1000);

      const resultResponse = await fetch(
        `${baseUrl}/submissions/${encodeURIComponent(
          submission.token
        )}?base64_encoded=false`,
        {
          headers,
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        }
      );

      const result = await resultResponse.json();

      if (!resultResponse.ok) {
        console.error("Judge0 result error:", result);

        return Response.json(
          { output: "Failed to retrieve execution result." },
          { status: 502 }
        );
      }

      const statusId = result.status?.id;

      // 1 = In Queue, 2 = Processing
      if (statusId === 1 || statusId === 2) {
        continue;
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

    return Response.json({
      output: "Execution is taking too long. Please try again.",
    });
  } catch (error) {
    console.error("Compile API error:", error);

    return Response.json(
      {
        output:
          error.name === "TimeoutError"
            ? "Judge0 request timed out."
            : "Unable to execute code. Check the API configuration.",
      },
      { status: 500 }
    );
  }
}
