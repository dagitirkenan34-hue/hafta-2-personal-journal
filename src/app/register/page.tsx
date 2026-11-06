"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Kayıt başarısız.");
        return;
      }

      setSuccess("Kayıt başarılı! Şimdi giriş yapabilirsin.");
      setName("");
      setEmail("");
      setPassword("");
    } catch {
      setError("Sunucuya bağlanırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #101827, #172c46)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={12} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, textAlign: "center" }}
          >
            Hesap Oluştur
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ textAlign: "center", mt: 1, mb: 4 }}
          >
            Personal Journal dünyasına katıl.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Ad Soyad"
              value={name}
              onChange={(event) => setName(event.target.value)}
              margin="normal"
            />

            <TextField
              fullWidth
              label="E-posta"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Şifre"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              margin="normal"
              required
              slotProps={{ htmlInput: { minLength: 8 } }}
            />

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
            >
              {loading ? "Kaydediliyor..." : "Kayıt Ol"}
            </Button>
          </Box>

          <Typography sx={{ textAlign: "center", mt: 3 }}>
            Zaten hesabın var mı? <Link href="/login">Giriş Yap</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

