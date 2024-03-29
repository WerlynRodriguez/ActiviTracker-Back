import { Router } from "express";
import { deleteAccount, getInfo, getInfoAll, setActive } from "../controllers/user.controller.js";
import { login, logout, register } from "../controllers/auth.controller.js";
import { getSesionsDays } from "../controllers/sesion.controller.js";
import { TokenRequired } from "../middlewares/TokenValid.js";
import { desactivateUsers_job } from "../controllers/jobs.controller.js";

const router = Router();

// Auth
router.post("/login", login);
router.post("/register", register);
router.get("/logout", logout);
router.get("/verify", TokenRequired, (req, res) => res.json({ username: req.userToken.username }));

// User
router.get("/getInfo", TokenRequired, getInfo);
router.get("/allInfo", TokenRequired, getInfoAll);
router.put("/setStatus", TokenRequired, setActive);
router.delete("/delete", TokenRequired, deleteAccount);

// Sesion Day
router.get("/sesionsDays", TokenRequired, getSesionsDays);

// Jobs
router.post("/jobs/desactivateUsers", desactivateUsers_job);

export default router;