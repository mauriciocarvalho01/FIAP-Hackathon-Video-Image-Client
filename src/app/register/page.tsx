"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { request } from "@/app/lib/http/request";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const [loginResponse, loginError] = await request({
      method: "POST",
      url: `${process.env.BASE_URL}/v1/api/register`,
      data: {
        name,
        displayName: name.split(" ")[0],
        email,
        password,
        role: 'user'
      },
    });

    setLoading(false);

    if (loginError) {
      console.error(loginError);
      setError("Erro ao fazer cadastro. Verifique suas informações.");
      return;
    }

    // Salvar o token no sessionStorage
    if (loginResponse) {
      // Redirecionar para a página de login
      router.push("/login");
    } else {
      setError("Não foi possível fazer cadastro.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Registro
        </h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <TextField
            label="Nome Completo"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Senha"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            label="Confirmar Senha"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            className="!bg-blue-500 !hover:bg-blue-600 !py-2"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Registrar"}
          </Button>
        </form>
        <button className="mt-4 text-sm text-center text-gray-600" onClick={() => router.push('/login')}>
          Já tem uma conta? <a href="/login" className="text-blue-500">Faça login</a>
        </button>
      </div>
    </div>
  );
}
