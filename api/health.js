export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    hasServerKey: !!process.env.OPENAI_API_KEY,
  });
}
