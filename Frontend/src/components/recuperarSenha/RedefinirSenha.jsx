
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import "./RedefinirSenha.css";

function RedefinirSenha() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState(false);

    const tokenValido = /^[a-f0-9]{64}$/.test(token || "");

    async function redefinirSenha(event) {
        event.preventDefault();
        setErro("");

        if (!tokenValido) {
            setErro("O link de recuperação é inválido.");
            return;
        }

        if (novaSenha.length < 8) {
            setErro("A senha deve ter pelo menos 8 caracteres.");
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setErro("As senhas não coincidem.");
            return;
        }

        setCarregando(true);

        try {
            const resposta = await apiFetch(
                "/redefinirSenha",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                        novaSenha,
                    }),
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok || dados.ok === false) {
                throw new Error(
                    dados.erro ||
                    dados.message ||
                    "Não foi possível redefinir sua senha."
                );
            }

            setSucesso(true);
            setNovaSenha("");
            setConfirmarSenha("");

        } catch (error) {
            console.error("Erro ao redefinir senha:", error);

            setErro(
                error.message ||
                "Ocorreu um erro. Tente novamente."
            );
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="redefinir-pagina">
            <div className="redefinir-card">

                <div className="redefinir-topo">
                    <h1>SimioLAB</h1>
                    <h2>
                        {sucesso
                            ? "Senha redefinida!"
                            : "Redefinir senha"}
                    </h2>
                </div>

                {sucesso ? (
                    <div className="redefinir-sucesso">
                        <div className="redefinir-icone-sucesso">
                            ✓
                        </div>

                        <p>
                            Sua senha foi alterada com sucesso!
                        </p>

                        <span>
                            Agora você já pode entrar na sua conta
                            utilizando a nova senha.
                        </span>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="redefinir-botao"
                        >
                            Ir para o login
                        </button>
                    </div>

                ) : !tokenValido ? (
                    <div className="redefinir-invalido">
                        <div className="redefinir-icone-erro">
                            !
                        </div>

                        <p>Link de recuperação inválido.</p>

                        <span>
                            Solicite um novo link de recuperação
                            de senha.
                        </span>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="redefinir-botao"
                        >
                            Voltar ao login
                        </button>
                    </div>

                ) : (
                    <>
                        <p className="redefinir-descricao">
                            Digite sua nova senha abaixo para
                            recuperar o acesso à sua conta.
                        </p>

                        <form onSubmit={redefinirSenha}>

                            <div className="redefinir-campo">
                                <label htmlFor="novaSenha">
                                    Nova senha
                                </label>

                                <input
                                    id="novaSenha"
                                    type={
                                        mostrarSenha
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Digite sua nova senha"
                                    value={novaSenha}
                                    onChange={(e) =>
                                        setNovaSenha(e.target.value)
                                    }
                                    minLength={8}
                                    autoComplete="new-password"
                                    required
                                    disabled={carregando}
                                />
                            </div>

                            <div className="redefinir-campo">
                                <label htmlFor="confirmarSenha">
                                    Confirmar nova senha
                                </label>

                                <input
                                    id="confirmarSenha"
                                    type={
                                        mostrarSenha
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Confirme sua nova senha"
                                    value={confirmarSenha}
                                    onChange={(e) =>
                                        setConfirmarSenha(e.target.value)
                                    }
                                    autoComplete="new-password"
                                    required
                                    disabled={carregando}
                                />
                            </div>

                            <label className="redefinir-mostrar">
                                <input
                                    type="checkbox"
                                    checked={mostrarSenha}
                                    onChange={(e) =>
                                        setMostrarSenha(e.target.checked)
                                    }
                                />
                                Mostrar senhas
                            </label>

                            {erro && (
                                <div
                                    className="redefinir-mensagem-erro"
                                    role="alert"
                                >
                                    {erro}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="redefinir-botao"
                                disabled={carregando}
                            >
                                {carregando
                                    ? "Redefinindo..."
                                    : "Redefinir senha"}
                            </button>
                        </form>

                        <button
                            type="button"
                            className="redefinir-voltar"
                            onClick={() => navigate("/login")}
                        >
                            Voltar ao login
                        </button>
                    </>
                )}
            </div>
        </main>
    );
}

export default RedefinirSenha;
