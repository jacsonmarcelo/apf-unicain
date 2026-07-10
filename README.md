# Finanza: Planejamento & Análise Financeira (FinanzaPulse)

Este aplicativo é uma plataforma de Planejamento e Análise Financeira estruturada em React, Tailwind CSS, Node.js (Express) e Firebase (Auth/Firestore).

---

## 🔗 Atalhos e URLs do Projeto

Para facilitar seu dia a dia, aqui estão os endereços oficiais para acessar o seu sistema:

| Ambiente | URL de Acesso | Objetivo |
| :--- | :--- | :--- |
| **Desenvolvimento (Dev URL)** | [Acessar App de Dev](https://ais-dev-vpizavsvsmcr6mbhgg26zl-709671769699.us-east1.run.app) | Usado para testar novas alterações em tempo real no ambiente interno de testes. |
| **Público / Compartilhado (Shared URL)** | [Acessar App Público](https://ais-pre-vpizavsvsmcr6mbhgg26zl-709671769699.us-east1.run.app) | A versão homologada e estável que você compartilha com clientes ou visualiza externamente. |

---

## ☁️ Google Cloud Run: Como Monitorar e Resolver Erros

Se o aplicativo público parar de funcionar ou não atualizar após uma alteração, o Google Cloud Run é o melhor lugar para encontrar o diagnóstico exato instantaneamente.

### 1. Onde Acessar?
1. Acesse o console do Google Cloud: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. No menu de navegação esquerdo ou na barra de pesquisa superior, procure por **Cloud Run**.
3. Selecione o seu serviço (nomeado como `finanza-financial-planning-analysis`).

### 2. O que Monitorar no Cloud Run?
* **Aba Registros (Logs)**: Exibe em tempo real tudo o que o servidor escreve no console (`console.log`, erros de banco de dados, falhas de inicialização). Se houver alguma falha (como erro 500 ou banco desconectado), o erro exato de inicialização do container estará listado em vermelho aqui.
* **Aba Revisões (Revisions)**: Mostra o histórico de atualizações enviadas. Se uma nova versão falhar ao iniciar (devido à porta, banco, etc.), a revisão anterior continuará ativa e servindo tráfego para que o site não saia do ar, mas as alterações novas não aparecerão até que o erro seja corrigido.
* **Métricas (Metrics)**: Permite ver a quantidade de requisições por segundo, latência e consumo de memória.

### 3. Erro Crítico Resolvido: Variável de Porta (`PORT`)
* **O que causou o travamento anterior**: O servidor Express no arquivo `server.ts` estava configurado para escutar estritamente na porta `3000` fixa (`const PORT = 3000;`).
* **Como funciona no Cloud Run**: O Google Cloud Run gerencia dinamicamente as portas dos containers injetando uma variável de ambiente chamada `PORT`. Se o container não escutar na porta exata enviada por essa variável, o sistema falha no Health Check (verificação de integridade) e não entra no ar.
* **A Solução Permanente**: Agora o código está dinâmico e seguro:
  ```typescript
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  ```
  Isso garante que localmente ou em desenvolvimento ele use a porta `3000`, mas no Cloud Run ele se adapte perfeitamente à porta exigida pelo Google.

---

## 📧 Configuração do Serviço de E-mail (Resend)

O sistema de login envia códigos de acesso únicos (OTP) por e-mail utilizando a API do **Resend**.

1. **Variáveis de Ambiente Necessárias**:
   * `RESEND_API_KEY`: Chave secreta da API gerada no painel do Resend.
   * `RESEND_FROM_EMAIL`: O endereço de e-mail remetente autorizado (ex: `finanza@unicain.com.br`). Se não configurado ou em formato inválido, o servidor assume esse padrão.
2. **Homologação e Erro de Sandbox**:
   * Se você receber o erro **403** no Resend, significa que o e-mail que você está tentando enviar não pertence a um domínio verificado dentro da sua conta do Resend, ou que você está em modo Sandbox de testes tentando enviar para um e-mail diferente do cadastrado como dono da conta.
   * **Bypass de Segurança**: Para fins de teste/desenvolvimento, se o envio de e-mail falhar devido à restrição do Resend, o sistema gera um alerta amigável na tela com o código OTP gerado para que você possa continuar testando sem ficar travado! Além disso, o código universal de testes `123456` está ativo para administradores.

---

## 🗄️ Configuração do Firebase & Firestore

O banco de dados e controle de autenticação do projeto rodam no Firebase:

* **Configurações de Conexão**: Localizadas no arquivo `firebase-applet-config.json`.
* **Regras de Segurança**: Definidas no arquivo `firestore.rules` na raiz.
* **Como implantar atualizações de regras de segurança**:
  ```bash
  firebase deploy --only firestore:rules
  ```

---

## 🛠️ Como Executar o Projeto Localmente

Se algum dia você precisar baixar o projeto e executá-lo em seu próprio computador, siga os passos abaixo:

1. **Instalar Dependências**:
   ```bash
   npm install
   ```
2. **Rodar em Modo de Desenvolvimento (Vite + Express)**:
   ```bash
   npm run dev
   ```
   *O aplicativo estará disponível em `http://localhost:3000`.*
3. **Gerar Versão de Produção (Build)**:
   ```bash
   npm run build
   ```
   *Os arquivos estáticos compilados serão salvos na pasta `dist/`.*
