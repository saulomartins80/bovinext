import { useAuth } from "../context/AuthContext";
import { FaGoogle } from "react-icons/fa";

export default function GoogleLoginButton() {
  const { loading } = useAuth();

  const handleLogin = async () => {
    try {
      // Google login removido conforme especificação BOVINEXT
      console.log("Google login não disponível no BOVINEXT");
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  return (
    <div>
      <button
        onClick={handleLogin}
        disabled={true}
        className="flex items-center justify-center gap-2 bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-lg border border-gray-300 cursor-not-allowed opacity-50"
      >
        <FaGoogle className="text-gray-400" />
        Google Login Desabilitado
      </button>
      <p className="text-gray-500 text-xs mt-1">Funcionalidade removida do BOVINEXT</p>
    </div>
  );
}