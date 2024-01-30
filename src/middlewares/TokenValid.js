import jwt from "jsonwebtoken";
import { Cerror, nMod } from "../libs/console.js";

export const TokenRequired = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_KEY, (err, userToken) => {
        if (err) {
            Cerror(err, nMod.midd);
            return res.status(401).json({ message: "Unauthorized" });
        }

        req.userToken = userToken;
        next();
    });
}