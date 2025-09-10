
import jwt from "jsonwebtoken";
import { User } from "../model/index.js";

export default async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(payload.id);
    next();
  } catch (err) { res.status(401).json({ message: "Invalid token" }); }
};
