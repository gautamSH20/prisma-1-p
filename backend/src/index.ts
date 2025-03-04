import express from "express";
import { PrismaClient } from "@prisma/client";
import { crypt, compCrypt } from "./func/ccrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
import z from "zod";
import { userMiddleware } from "./midlleware/userMiddle";

const Client = new PrismaClient();

const app = express();
app.use(express.json());

app.get("/singn", async (req, res) => {
  const { username, password } = req.body;

  const validData = z.object({
    username: z.string().min(2).max(20).nonempty(),
    password: z.string().min(6).max(10).nonempty(),
  });

  const isParse = validData.safeParse(req.body);

  if (isParse.success) {
    const hash = (await crypt({ password })).toString();
    const res1 = await Client.user.create({
      data: {
        username,
        password: hash,
      },
    });
    res.send({
      res1,
    });
  } else {
    console.log("wrong");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const validData = z.object({
    username: z.string().min(2).max(20).nonempty(),
    password: z.string().min(6).max(10).nonempty(),
  });
  const isParse = validData.safeParse(req.body);

  if (!isParse.success) {
    res.json({
      message: isParse.error,
    });
    return;
  }

  const user = await Client.user.findUnique({
    where: {
      username,
    },
  });
  if (!user) {
    res.json({
      message: "User not exist",
    });
    return;
  }
  const pass: string = user?.password || "";
  const isPass = await compCrypt({ password, pass });
  if (!isParse) {
    res.json({
      message: "password is wrong",
    });
    return;
  }
  const JWT_SECTRE: string | undefined = process.env.JWT_SECRET;
  if (!JWT_SECTRE) {
    throw new Error("Token is not made");
  }
  const token = jwt.sign({ id: user.id }, JWT_SECTRE);

  res.status(200).json({
    token,
  });
});

app.get("/content", userMiddleware, async (req, res) => {
  //@ts-ignore
  const id = req.userId;

  res.json({
    userId: id,
  });
});

app.listen(3000, () => {
  console.log("working");
});
