import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();

app.get("/", (req: Request, resp: Response) => {
  const respJson = {
    msg: "Hello from the server!!",
  };
  resp.json(respJson);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App server listening on PORT ${port}`);
});
