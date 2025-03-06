import express from "express";
import { PrismaClient } from "@prisma/client";
import { crypt, compCrypt } from "./func/ccrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
import cors from "cors";
import z from "zod";
import { userMiddleware } from "./midlleware/userMiddle";

const Client = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());

app.post("/sign", async (req, res) => {
  const { username, password } = req.body;

  const validData = z.object({
    username: z.string().min(2).max(20).nonempty(),
    password: z.string().min(6).max(10).nonempty(),
  });

  const isParse = validData.safeParse(req.body);

  if (!isParse.success) {
    console.log(isParse.error);
  }

  if (isParse.success) {
    const hash = (await crypt({ password })).toString();
    const find = await Client.user.findUnique({
      where: {
        username,
      },
    });
    if (find) {
      res.json({
        message: "user already exist",
      });
      return;
    }
    const res1 = await Client.user.create({
      data: {
        username,
        password: hash,
      },
    });
    res.send({
      message: "User created",
      user: res1,
    });
  } else {
    console.log("wrong");
    console.log(isParse);
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

  if (!id) {
    res.json({
      message: "Something is wrong id is not avilable",
    });
    return;
  }
  try {
    const res1 = await Client.user.findFirst({
      where: {
        id,
      },
      select: {
        todo: true,
      },
    });
    res.status(200).json({
      message: res1,
    });
  } catch (e) {
    console.log("Something is wrong");
  }
});

app.delete("/content/delete", userMiddleware, async (req, res) => {
  //@ts-ignore
  const id = req.userId;
  const todo1 = req.body.id;
  if (!id) {
    res.send("You are not authorised");
    return;
  }

  try {
    const res1 = await Client.user.findFirst({
      where: {
        id,
      },
      select: {
        todo: {
          where: {
            id: todo1,
          },
        },
      },
    });
    const res2 = await Client.todo.delete({
      where: {
        id: todo1,
      },
    });

    res.status(200).json({
      messsage: res2,
    });
  } catch (e) {
    res.status(401).json({
      //@ts-ignore
      message: e.meta.cause,
    });
  }
});

app.post("/add/content", userMiddleware, async (req, res) => {
  //@ts-ignore
  const id = req.userId;

  const { title, description } = req.body;
  const validateData = z.object({
    title: z.string().nonempty().min(5).trim(),
    description: z.string().trim().nonempty().min(2),
  });

  const isParse = validateData.safeParse(req.body);

  if (!isParse.success) {
    res.status(401).json({
      message: "data is wrong",
    });
    return;
  }

  try {
    const res1 = await Client.user.findUnique({
      where: {
        id,
      },
    });

    const res2 = await Client.todo.create({
      data: {
        title,
        description,
        userId: id,
      },
    });
    res.status(200).json({
      message: res2,
    });
  } catch (e) {
    res.status(401).json({
      //@ts-ignore
      message: e.meta.cause,
    });
  }
});
app.post("/logout", userMiddleware, async (req, res) => {
  const res1 = delete req.headers["authorization"];
  res.json({
    message: res1,
  });
});

app.listen(3000, () => {
  console.log("working");
});
