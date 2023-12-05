import express from "express";
import { env } from "./env.js";
import { runJobs } from "./jobs/run.js";
import helmet from "helmet";
import { prisma } from "./prisma.js";
import { decrypt, encrypt } from "./utils.js";

const app = express();
app.use(express.json());
app.use(helmet());

app.use((req, res, next) => {
  const authToken = req.headers?.authorization;

  if (authToken === env.AUTH_TOKEN) {
    return next();
  }

  res.status(401);
  return res.send();
});

app.get("/", (_, res) => {
  res.send("Hello, this is a balancer");
});

app.patch("/api/cdn/:id", async (req, res) => {
  try {
    const id = req.params?.id;
    const apiToken = req.body?.apiToken;
    if (!id) return;

    const cdn = await prisma.cdn.update({
      where: { id: Number(id) },
      data: { apiToken: encrypt(apiToken) },
    });

    res.status(200);
    return res.send(cdn);
  } catch (error) {
    res.status(500);
    return res.send(JSON.stringify(error));
  }
});

runJobs();

app.listen(env.PORT, () =>
  console.log(`🚀 Server ready at: http://localhost:${env.PORT}`)
);
