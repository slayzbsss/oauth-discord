const cookies = h => Object.fromEntries(
  (h || "").split(";").map(c => c.trim().split("=")).filter(a => a.length === 2)
);

module.exports = async (req, res) => {
  const { code, state, error } = req.query;

  if (state !== cookies(req.headers.cookie).st) return res.status(400).send("state invalide");

  if (error) {
    if (["interaction_required", "consent_required"].includes(error)) {
      return res.redirect(302, "/api/go");
    }
    return res.status(400).send(error);
  }

  const body = new URLSearchParams({
    client_id: process.env.CID,
    client_secret: process.env.SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.REDIRECT,
  });

  const r = await fetch("https://discord.com/api/v10/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!r.ok) return res.status(400).send(await r.text());
  const tok = await r.json();

  const me = await fetch("https://discord.com/api/v10/users/@me", {
    headers: { Authorization: `Bearer ${tok.access_token}` },
  }).then(x => x.json());

  res.status(200).json({ moi: me, token: tok });
};
