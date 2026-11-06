"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type Journal = {
  id: string;
  title: string;
  content: string;
  effort: number | null;
  createdAt: string;
};

export default function JournalManager({ name }: { name: string }) {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [effort, setEffort] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadJournals = useCallback(async () => {
    try {
      const response = await fetch("/api/journals");
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Kayıtlar alınamadı.");

      setJournals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJournals();
  }, [loadJournals]);

  function resetForm() {
    setTitle("");
    setContent("");
    setEffort("");
    setEditingId(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        editingId ? `/api/journals/${editingId}` : "/api/journals",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, effort }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "İşlem başarısız.");

      setMessage(data.message);
      resetForm();
      await loadJournals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  }

  function startEditing(journal: Journal) {
    setEditingId(journal.id);
    setTitle(journal.title);
    setContent(journal.content);
    setEffort(journal.effort === null ? "" : String(journal.effort));
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteJournal(id: string) {
    if (!window.confirm("Bu günlük kaydını silmek istiyor musun?")) return;

    const response = await fetch(`/api/journals/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Silme işlemi başarısız.");
      return;
    }

    setMessage(data.message);
    await loadJournals();
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6fb", py: 5 }}>
      <Container maxWidth="md">
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center", mb: 4 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#172554" }}>
              Personal Journal
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Hoş geldin, {name}
            </Typography>
          </Box>
          <Button variant="outlined" color="error" onClick={() => signOut({ callbackUrl: "/login" })}>
            Çıkış Yap
          </Button>
        </Stack>

        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              {editingId ? "Günlüğü Düzenle" : "Yeni Günlük Oluştur"}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Günlük başlığı"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  fullWidth
                  slotProps={{ htmlInput: { maxLength: 120 } }}
                />
                <TextField
                  label="Bugün neler yaptın?"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  required
                  fullWidth
                  multiline
                  minRows={5}
                  slotProps={{ htmlInput: { maxLength: 10000 } }}
                />
                <TextField
                  label="Çalışma puanı (0-10)"
                  type="number"
                  value={effort}
                  onChange={(event) => setEffort(event.target.value)}
                  fullWidth
                  slotProps={{ htmlInput: { min: 0, max: 10, step: 1 } }}
                />
                {error && <Alert severity="error">{error}</Alert>}
                {message && <Alert severity="success">{message}</Alert>}
                <Stack direction="row" spacing={1}>
                  <Button type="submit" variant="contained">
                    {editingId ? "Değişiklikleri Kaydet" : "Günlüğü Kaydet"}
                  </Button>
                  {editingId && (
                    <Button onClick={resetForm} color="inherit">
                      Vazgeç
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Günlük Kayıtlarım ({journals.length})
        </Typography>

        {loading ? (
          <Typography>Yükleniyor...</Typography>
        ) : journals.length === 0 ? (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Typography>Henüz günlük kaydın yok. İlk kaydını oluştur!</Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {journals.map((journal) => (
              <Card key={journal.id} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {journal.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ my: 1 }}>
                    {new Date(journal.createdAt).toLocaleDateString("tr-TR")}
                    {journal.effort !== null && ` • Çalışma puanı: ${journal.effort}/10`}
                  </Typography>
                  <Typography sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
                    {journal.content}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => startEditing(journal)}>
                      Düzenle
                    </Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => deleteJournal(journal.id)}>
                      Sil
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
