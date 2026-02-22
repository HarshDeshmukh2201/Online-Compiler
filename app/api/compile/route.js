import { exec } from "child_process"; // Yahin se:node temp.js python temp.pychalate hain
import fs from "fs";
import path from "path";

export async function POST(req) {
  const { code, language } = await req.json();

  const fileName =
    language === "py" ? "temp.py" : "temp.js";

  const filePath = path.join(process.cwd(), fileName);

  // save code in file
  fs.writeFileSync(filePath, code);

  const command =
    language === "py"
      ? `python ${filePath}`
      : `node ${filePath}`;

  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      fs.unlinkSync(filePath);

      resolve(
        Response.json({
          output: error ? stderr : stdout,
        })
      );
    });
  });
}