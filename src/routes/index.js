import { Router } from "express";
import { deleteAccount, getInfo, getInfoAll, setActive } from "../controllers/user.controller.js";
import { login, logout, register } from "../controllers/auth.controller.js";
import { getSesionDay } from "../controllers/sesion.controller.js";
import { TokenRequired } from "../middlewares/TokenValid.js";

const router = Router();

// Auth
router.post("/login", login);
router.post("/register", register);
router.get("/logout", logout);

// User
router.get("/getInfo", TokenRequired, getInfo);
router.get("/allInfo", TokenRequired, getInfoAll);
router.put("/setStatus", TokenRequired, setActive);
router.delete("/delete", TokenRequired, deleteAccount);

// Sesion Day
router.get("/sesionDay", TokenRequired, getSesionDay);

export default router;