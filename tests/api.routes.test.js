import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';

function createMock() {
  const mockFn = async (...args) => {
    mockFn.calls.push(args);
    return await mockFn.impl(...args);
  };
  mockFn.calls = [];
  mockFn.impl = () => {
    throw new Error('Mock not implemented');
  };
  mockFn.mockImplementation = (impl) => {
    mockFn.impl = impl;
  };
  mockFn.mockResolvedValue = (value) => {
    mockFn.impl = async () => value;
  };
  mockFn.mockReset = () => {
    mockFn.calls = [];
    mockFn.impl = () => {
      throw new Error('Mock not implemented');
    };
  };
  return mockFn;
}

const mockGameService = {
  getAllGames: createMock(),
  getGameById: createMock(),
  createGame: createMock(),
  updateGame: createMock(),
  deleteGame: createMock(),
  getGamesForUser: createMock(),
};

const mockAuthService = {
  register: createMock(),
  login: createMock(),
};

const mockUserService = {
  getMe: createMock(),
  getAllUsers: createMock(),
};

const mockLibraryService = {
  listLibrary: createMock(),
  addGameForUser: createMock(),
  removeGameForUser: createMock(),
  getGameConfigForUser: createMock(),
  updateGameConfigForUser: createMock(),
};

let currentUser = { sub: 'user-123', id: 'user-123', roles: ['admin'] };

const middlewareMocks = {
  requireAuth(req, _res, next) {
    req.user = currentUser;
    next();
  },
  requireRole(_role) {
    return (_req, _res, next) => next();
  },
};

globalThis.__TEST_SERVICES__ = {
  GameService: mockGameService,
  AuthService: mockAuthService,
  UserService: mockUserService,
  LibraryService: mockLibraryService,
};

globalThis.__TEST_MIDDLEWARE__ = middlewareMocks;

const { default: app } = await import('../app.js');

async function callApp(method, path, body) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}${path}`;
  const options = { method, headers: { Accept: 'application/json' } };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
    options.headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(url, options);
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = text;
  }
  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  return { status: response.status, body: data, text };
}

function resetMocks() {
  currentUser = { sub: 'user-123', id: 'user-123', roles: ['admin'] };
  const groups = [mockGameService, mockAuthService, mockUserService, mockLibraryService];
  for (const group of groups) {
    Object.values(group).forEach((fn) => fn.mockReset());
  }
}

test('GET /api/games returns all games', async () => {
  resetMocks();
  const games = [{ id: 1, title: 'Test Game' }];
  mockGameService.getAllGames.mockResolvedValue(games);

  const res = await callApp('GET', '/api/games');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, games);
  assert.equal(mockGameService.getAllGames.calls.length, 1);
});

test('GET /api/games/:id returns a single game', async () => {
  resetMocks();
  const game = { id: 42, title: 'Single Game' };
  mockGameService.getGameById.mockResolvedValue(game);

  const res = await callApp('GET', '/api/games/42');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, game);
  assert.deepEqual(mockGameService.getGameById.calls[0], ['42']);
});

test('POST /api/games creates a game for admins', async () => {
  resetMocks();
  const created = { id: 99, title: 'Created Game' };
  mockGameService.createGame.mockResolvedValue(created);

  const res = await callApp('POST', '/api/games', { title: 'Created Game' });

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, created);
  assert.deepEqual(mockGameService.createGame.calls[0], [{ title: 'Created Game' }]);
});

test('PATCH /api/games/:id updates a game', async () => {
  resetMocks();
  const updated = { id: 1, title: 'Updated' };
  mockGameService.updateGame.mockResolvedValue(updated);

  const res = await callApp('PATCH', '/api/games/1', { title: 'Updated' });

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, updated);
  assert.deepEqual(mockGameService.updateGame.calls[0], ['1', { title: 'Updated' }]);
});

test('DELETE /api/games/:id removes a game', async () => {
  resetMocks();
  mockGameService.deleteGame.mockResolvedValue(true);

  const res = await callApp('DELETE', '/api/games/5');

  assert.equal(res.status, 200);
  assert.equal(mockGameService.deleteGame.calls[0][0], '5');
  assert.equal(res.text.trim(), 'true');
});

test('GET /api/games/mine returns games for the authenticated user', async () => {
  resetMocks();
  const mine = [{ id: 1, title: 'My Game' }];
  mockGameService.getGamesForUser.mockResolvedValue(mine);

  const res = await callApp('GET', '/api/games/mine');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, data: mine });
  assert.equal(mockGameService.getGamesForUser.calls[0][0], 'user-123');
});

test('POST /api/auth/register registers a user', async () => {
  resetMocks();
  const output = { id: 'u1' };
  mockAuthService.register.mockResolvedValue(output);

  const res = await callApp('POST', '/api/auth/register', { username: 'neo', password: 'matrix', is_admin: true });

  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { ok: true, data: output });
  assert.deepEqual(mockAuthService.register.calls[0][0], { username: 'neo', password: 'matrix', is_admin: true });
});

test('POST /api/auth/login authenticates a user', async () => {
  resetMocks();
  const session = { token: 'jwt' };
  mockAuthService.login.mockResolvedValue(session);

  const res = await callApp('POST', '/api/auth/login', { username: 'neo', password: 'matrix' });

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, data: session });
  assert.deepEqual(mockAuthService.login.calls[0][0], { username: 'neo', password: 'matrix' });
});

test('GET /api/users/me returns the current user', async () => {
  resetMocks();
  const me = { id: 'user-123', username: 'me' };
  mockUserService.getMe.mockResolvedValue(me);

  const res = await callApp('GET', '/api/users/me');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, data: me });
  assert.equal(mockUserService.getMe.calls[0][0], 'user-123');
});

test('GET /api/users returns the list of users for admins', async () => {
  resetMocks();
  const users = [{ id: 'u1' }, { id: 'u2' }];
  mockUserService.getAllUsers.mockResolvedValue(users);

  const res = await callApp('GET', '/api/users?limit=10&offset=0');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, data: users });
  assert.equal(mockUserService.getAllUsers.calls.length, 1);
});

test('GET /api/lib returns the authenticated user library', async () => {
  resetMocks();
  const library = [{ idGame: 1 }];
  mockLibraryService.listLibrary.mockResolvedValue(library);

  const res = await callApp('GET', '/api/lib');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, data: library });
  assert.equal(mockLibraryService.listLibrary.calls[0][0], 'user-123');
});

test('POST /api/lib/:idUser/:idGame adds a game for a user', async () => {
  resetMocks();
  const created = { idUser: '10', idGame: '20', config: {} };
  mockLibraryService.addGameForUser.mockResolvedValue(created);

  const res = await callApp('POST', '/api/lib/10/20', { difficulty: 'hard' });

  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { ok: true, data: created });
  assert.deepEqual(mockLibraryService.addGameForUser.calls[0][0], { idUser: '10', idGame: '20', initialConfig: { difficulty: 'hard' } });
});

test('DELETE /api/lib/:idUser/:idGame removes a game for a user', async () => {
  resetMocks();
  mockLibraryService.removeGameForUser.mockResolvedValue(undefined);

  const res = await callApp('DELETE', '/api/lib/10/20');

  assert.equal(res.status, 204);
  assert.deepEqual(res.body, undefined);
  assert.deepEqual(mockLibraryService.removeGameForUser.calls[0][0], { idUser: '10', idGame: '20' });
});

test('GET /api/lib/:idGame/config returns the current user config', async () => {
  resetMocks();
  const config = { theme: 'dark' };
  mockLibraryService.getGameConfigForUser.mockResolvedValue(config);

  const res = await callApp('GET', '/api/lib/77/config');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, data: config });
  assert.deepEqual(mockLibraryService.getGameConfigForUser.calls[0][0], { idUser: 'user-123', idGame: '77' });
});

test('PATCH /api/lib/:idGame/config updates the current user config', async () => {
  resetMocks();
  const updatedConfig = { theme: 'light' };
  mockLibraryService.updateGameConfigForUser.mockResolvedValue(updatedConfig);

  const res = await callApp('PATCH', '/api/lib/77/config', { theme: 'light' });

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, data: updatedConfig });
  assert.deepEqual(mockLibraryService.updateGameConfigForUser.calls[0][0], { idUser: 'user-123', idGame: '77', values: { theme: 'light' } });
});

test('DELETE /api/lib/:idGame removes a game from the current user library', async () => {
  resetMocks();
  mockLibraryService.removeGameForUser.mockResolvedValue(undefined);

  const res = await callApp('DELETE', '/api/lib/77');

  assert.equal(res.status, 204);
  assert.deepEqual(res.body, undefined);
  assert.deepEqual(mockLibraryService.removeGameForUser.calls[0][0], { idUser: 'user-123', idGame: '77' });
});
