import { Request, Response, NextFunction } from "express";
import "dotenv/config";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET: string | undefined = process.env.JWT_SECRET;

export const userMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"];
    if (!JWT_SECRET) {
      throw new Error("Something is wrong");
    }
    const decode = jwt.verify(token as string, JWT_SECRET);
    if (decode) {
      if (typeof decode === "string") {
        res.status(403).json({
          message: "Not authorised",
        });
        return;
      }
      // @ts-ignore
      req.userId = (decode as JwtPayload).id;
      next();
    } else {
      res.status(401).json({
        message: "YOU are not logged in",
      });
      return;
    }
  } catch (e) {
    res.status(501).json({
      message: "Something not right",
    });
    return;
  }
};
