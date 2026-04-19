import path from "node:path";
import dotenv from "dotenv";

const cwd = process.cwd();
const repoRoot =
  path.basename(cwd) === "api" && path.basename(path.dirname(cwd)) === "apps"
    ? path.resolve(cwd, "../..")
    : cwd;

dotenv.config({ path: path.resolve(repoRoot, ".env") });
dotenv.config({ path: path.resolve(cwd, ".env") });
