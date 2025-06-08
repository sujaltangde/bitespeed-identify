import { Request, Response } from "express";

export const identify = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello Sujal!" });
};
