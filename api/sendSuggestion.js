export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, title, description } = req.body;

  if (!name || !email || !title || !description) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const text = `
New Meetup Suggestion

From: ${name} (${email})
Idea: ${title}

Description:
${description}
`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Locals Only <hello@locals-only.space>",
        to: ["hello@locals-only.space"],
        subject: "New Meetup Suggestion",
        text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend error:", errorText);
      return res.status(500).json({ error: "Email sending failed" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
