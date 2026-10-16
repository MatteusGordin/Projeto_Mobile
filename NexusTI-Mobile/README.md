# Nexus TI Mobile — v1.0.0

Gestão de chamados de TI para a Prefeitura de Benevides. Aplicativo móvel com paridade total à versão Web: abertura e ciclo de vida de chamados, dashboard operacional e módulos administrativos com controle de acesso por perfil.

## Arquitetura e Stack

* **React Native + Expo (TypeScript estrito):** base móvel única para Android via Expo Router (`src/app`), com `typedRoutes` e navegação por `Stack`.
* **Expo Router:** rotas declarativas (`index`, `painel`, `novo-chamado`, `detalhe`, `admin/usuarios`, `admin/equipamentos`, `admin/setores`, `admin/prioridades`).
* **Axios:** cliente HTTP centralizado (`src/api/client.ts`) com `baseURL` da API Spring Boot, `timeout` e interceptors de autenticação e expiração de sessão (401).
* **Expo SecureStore:** persistência segura de `nexusti.token` e `nexusti.perfil` (serializado com `JSON`), base do RBAC client-side e do logout global.
* **Estilo nativo:** apenas `StyleSheet` + componentes core (`View`, `Text`, `TextInput`, `Button`, `Image`, `ScrollView`, `Alert`), Dark Mode próprio (`#0F172A` / `#1E293B`).

## Features Principais

* **Autenticação JWT:** login (`POST /auth/login`), perfil (`GET /auth/perfil`), logout com limpeza de token e perfil.
* **Chamados (ciclo completo):** listar paginado (`GET /chamados`), criar (`POST /chamados`), detalhar (`GET /chamados/{id}`), concluir com solução (`PUT /chamados/{id}`), métricas (`GET /chamados/metricas`).
* **CRUDs Administrativos:** usuários, equipamentos, setores e prioridades — formulário inline (Criar/Salvar), ações Editar (`#3B82F6`) e Excluir (`#EF4444`) com `Alert` nativo e recarregamento de lista.
* **RBAC:** `ADMIN` (tudo, incluindo usuários), `TECNICO` (chamados, equipamentos, setores, prioridades), `USUARIO` (chamados próprios, detalhe somente leitura, sem concluir).
* **Dark Mode + Scroll:** paleta escura de alto contraste e `ScrollView` em todas as telas, sem flash claro no overscroll.

## Princípios de Engenharia (Diferencial)

* **Zero Mocks:** 100% dos dados via API real; payloads estritos (`Partial<T>`) com validação client-side antes do envio.
* **Zero Bibliotecas de UI de Terceiros:** nenhuma dependência de design system externo; selos, cartões e ações compostos só com o core.
* **Tipagem Estrita:** `npx tsc --noEmit` limpo; contratos em `src/types/models.ts` (`Usuario`, `Equipamento`, `Setor`, `Prioridade`, `ChamadoResposta`, `Pagina<T>`).
* **Clean Code sem Resíduos:** zero comentários (`//`, `/* */`), zero `console.log`, URLs sem literais frágeis e tratamento de erro padronizado (`axios.isAxiosError` com `401/403/400`).

## Como Rodar o Projeto

```bash
cd Projeto_Mobile/NexusTI-Mobile
npm install
npx expo start
```

* **Expo Go:** escaneie o QR para validar em dispositivo físico.
* **APK (distribuição manual):** perfil EAS com `android.buildType: apk` (`eas.json`):
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
