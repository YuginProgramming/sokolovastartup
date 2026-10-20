import "dotenv/config";
import express from "express";
import path from "path";
import { launchBot } from "../telegram/bot";

const app = express();
const port = Number(process.env.PORT) || 3080;
const publicDir = path.join(__dirname, "../../public");

app.use(express.static(publicDir));

const server = app.listen(port, () => {
  console.log(`Quiz app http://localhost:${port}`);
  launchBot();
});

process.once("SIGINT", () => server.close());
process.once("SIGTERM", () => server.close());
