import jwt from "jsonwebtoken";
import { Cerror, nMod } from "../libs/console.js";
import { verifyToken } from "../libs/jwt.js";

export const TokenRequired = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const userToken = await verifyToken(token);
        req.userToken = userToken;
        next();
    } catch (error) {
        Cerror(error, nMod.cont);
        res.status(401).json({ message: "Unauthorized" });
    }
}