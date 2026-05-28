import User from "../models/User.js";
import jwt from "jsonwebtoken";

// ---------- Вспомогательные функции валидации ----------

// Простая, но надёжная проверка формата email.
const isValidEmail = (email) =>
  typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// Создание JWT-токена (чтобы не дублировать код в signup и login).
const createToken = (userId) =>
  jwt.sign({ _id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ---------- Регистрация ----------
export const signup = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    name = typeof name === "string" ? name.trim() : "";
    email = typeof email === "string" ? email.trim().toLowerCase() : "";

    // --- Валидация ---
    if (!name || name.length < 2) {
      return res.status(400).json({ message: "Имя должно содержать минимум 2 символа" });
    }
    if (name.length > 50) {
      return res.status(400).json({ message: "Имя слишком длинное (максимум 50 символов)" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Введите корректный email" });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Пароль должен содержать минимум 6 символов" });
    }
    if (password.length > 100) {
      return res.status(400).json({ message: "Пароль слишком длинный" });
    }
    if (!/[a-zA-Zа-яА-Я]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ message: "Пароль должен содержать хотя бы одну букву и одну цифру" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Пользователь с таким email уже существует" });
    }

    const user = await User.create({ name, email, password });
    const token = createToken(user._id);

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Не удалось зарегистрироваться" });
  }
};

// ---------- Вход ----------
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Введите корректный email" });
    }
    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "Введите пароль" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const token = createToken(user._id);

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Не удалось войти" });
  }
};

// ---------- Выход ----------
export const logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};

// ---------- Текущий пользователь ----------
export const getCurrentUser = async (req, res) => {
  // req.user уже заполнен в middleware auth.js — лишний запрос к базе не нужен.
  const { _id, name, email } = req.user;
  res.json({ user: { _id, name, email } });
};