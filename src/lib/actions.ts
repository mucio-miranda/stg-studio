// Ações da conta, sem backend por enquanto. Cada uma responde "indisponível" para a interface continuar funcional.
// Ao refazer o backend, reimplemente estas funções mantendo assinaturas e tipos de retorno.
export type AuthState = { error?: string; notice?: string };
export type ClaimResult = "added" | "existing" | "taken" | "invalid" | "unauthenticated" | "error";

const unavailable = "Contas ainda não estão disponíveis. Volte em breve.";
export async function signIn(...args: [AuthState, FormData]): Promise<AuthState> { void args; return { error: unavailable }; }
export async function signUp(...args: [AuthState, FormData]): Promise<AuthState> { void args; return { error: unavailable }; }
export async function signOut(): Promise<void> {}
export async function saveProfile(...args: [FormData]): Promise<{ error?: string }> { void args; return { error: unavailable }; }
export async function claimUnit(...args: [string]): Promise<ClaimResult> { void args; return "error"; }
