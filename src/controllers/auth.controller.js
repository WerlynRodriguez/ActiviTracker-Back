import User from "../models/users.model.js"
import bcrypt from "bcryptjs";
import Express from "express";
import { generateToken } from "../libs/jwt.js";
import { Cerror, nMod } from "../libs/console.js";

/**
 * Register a new user
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const register = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: "Please fill all fields" });
        return;
    }

    try {
        // Check if username already exists
        const search = await User.findOne({ username });
        if (search) return res.status(400).json({ message: "Username already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const userSaved = await new User({ username, password: hashedPassword }).save();

        const token = await generateToken({ id: userSaved._id, username: userSaved.username });

        res.cookie("token", token, {
            sameSite: "none",
            secure: true
        });
        res.status(201).json({ username: userSaved.username });

    } catch (error) {
        Cerror(error, nMod.cont);
        res.status(500).json({ message: error.message });
    }
}

/**
 * Login a user
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: "Please fill all fields" });
        return;
    }

    try {
        const user = await User.findOne({ username }).select("+password");

        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = await generateToken({ id: user._id, username: user.username });

        res.cookie("token", token, {
            sameSite: "none",
            secure: true
        });
        res.status(200).json({ username: user.username });
    } catch (error) {
        Cerror(error, nMod.cont);
        res.status(500).json({ message: error.message });
    }
}

/**
 * Logout a user
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const logout = (req, res) => {
    res.clearCookie("token", {
        sameSite: "none",
        secure: true
    });
    res.status(200).json({ message: "Logged out" });
}