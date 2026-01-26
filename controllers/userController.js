import { UserService as UserServiceImpl } from "../services/index.js";

function getUserService() {
  return globalThis.__TEST_SERVICES__?.UserService ?? UserServiceImpl;
}

export async function me(req, res, next) {
  try {
    const me = await getUserService().getMe(req.user.sub);
    res.json({ ok: true, data: me });
  } catch (err) { next(err); }
}

export async function list(req, res, next) {
  try {
    const limit = Number(req.query.limit ?? 50);
    const offset = Number(req.query.offset ?? 0);
    const users = await getUserService().getAllUsers();
    res.json({ ok: true, data: users });
  } catch (err) { next(err); }
}
