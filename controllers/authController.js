import { AuthService as AuthServiceImpl } from "../services/index.js";

function getAuthService() {
  return globalThis.__TEST_SERVICES__?.AuthService ?? AuthServiceImpl;
}

export async function register(req, res, next) {
  try {
    const { username, password, is_admin } = req.body ?? {};
    if (!username || !password) {
      const e = new Error("`username` and `password` are required");
      e.status = 400; throw e;
    }
    const out = await getAuthService().register({ username, password, is_admin: !!is_admin });
    res.status(201).json({ ok: true, data: out });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      const e = new Error("`username` and `password` are required");
      e.status = 400; throw e;
    }
    const out = await getAuthService().login({ username, password });
    res.json({ ok: true, data: out });
  } catch (err) { next(err); }
}
