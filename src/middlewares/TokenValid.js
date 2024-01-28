import jwt from "jsonwebtoken";
import { JWT_KEY } from "../config.js";
import { Cerror, nMod } from "../libs/console.js";

export const TokenRequired = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, JWT_KEY, (err, userToken) => {
        if (err) {
            Cerror(err.message, nMod.midd);
            return res.status(401).json({ message: "Unauthorized" });
        }

        req.userToken = userToken;
        next();
    });
}