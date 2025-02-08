"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { request } from "@/app/lib/http/request";


type GenericType<T=any> = T

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const [loginResponse, loginError] = await request({
      method: "POST",
      url: `${process.env.API_URL}/v1/api/login`,
      data: {
        email,
        password,
      },
    });

    setLoading(false);

    if (loginError) {
      console.error(loginError);
      setError("Erro ao fazer login. Verifique suas credenciais.");
      return;
    }

    const { data } = loginResponse as GenericType
    // Salvar o token no sessionStorage
    const accessToken = data?.accessToken;
    if (accessToken) {
      sessionStorage.setItem("accessToken", accessToken);
      console.log("Token salvo no sessionStorage:", accessToken);

      // Redirecionar para a página inicial ou dashboard
      router.push("/home");
    } else {
      setError("Não foi possível obter o token de acesso.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
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
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            className="!bg-blue-500 !hover:bg-blue-600 !py-2"
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
        <button
          className="mt-4 text-sm text-center text-gray-600"
          onClick={() => router.push("/register")}
        >
          Não tem uma conta?{" "}
          <a href="/register" className="text-blue-500">
            Registre-se
          </a>
        </button>
      </div>
    </div>
  );
}
