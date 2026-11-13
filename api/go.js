const { randomUUID } = require("node:crypto");

module.exports = (req, res) => {
  const state = randomUUID();
  const u = new URL("https://discord.com/oauth2/authorize");
  u.searchParams.set("client_id", process.env.CID);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("redirect_uri", process.env.REDIRECT);
  u.searchParams.set("scope", "identify guilds");
  u.searchParams.set("state", state);
  if (req.query.silent === "1") u.searchParams.set("prompt", "none");

  res.setHeader("Set-Cookie", `st=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  res.redirect(302, u.toString());
};
