# 🐝 Beez - Assistente de Controle Glicêmico

<div align="center">

![Beez Logo](https://img.shields.io/badge/Beez-🐝-FFA500?style=for-the-badge)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

**Um aplicativo web moderno para auxiliar diabéticos no cálculo de dosagem de insulina**

[🚀 Demo ao Vivo](https://lovable.dev/projects/63e692c2-7472-4243-9474-08b8c5e1abcb) • [📜 Repositório Antigo (2021)](https://github.com/Yas-min176/Beez_bot)

</div>

---

## 📖 Sobre o Projeto

**Beez** é um Progressive Web App (PWA) desenvolvido para ajudar pessoas com diabetes a calcular a dosagem correta de insulina baseada nas medições de glicemia. O projeto nasceu em **2021** como um chatbot no Telegram usando Google Apps Script, e agora foi **completamente reconstruído** como uma aplicação web moderna, escalável e com funcionalidades avançadas.

### 🎯 Objetivo

Facilitar o controle glicêmico fornecendo:
- ✅ Cálculo automático de dosagem de insulina
- 📊 Histórico completo de medições
- 👥 Conexão entre pacientes e cuidadores
- 📱 Acesso via dispositivos móveis (PWA)
- 🔒 Segurança e privacidade dos dados

---

## 🚀 O Que Mudou (2021 → 2025)

<table>
<tr>
<td width="50%" valign="top">

### **2021 - Chatbot Telegram** 🤖

**Tecnologias:**
- Google Apps Script
- Telegram Bot API
- Google Sheets

**Funcionalidades:**
- 💬 Bot conversacional
- ⏰ Lembretes automáticos
- 📝 Registro em planilhas
- 👤 Uso individual
- 📊 Dados em Google Sheets

**Limitações:**
- Sem interface visual
- Depende do Telegram
- Sem multi-usuário
- Manutenção manual
- Escalabilidade limitada

[Ver código original →](https://github.com/Yas-min176/Beez_bot)

</td>
<td width="50%" valign="top">

### **2025 - Web App Moderno** ✨

**Tecnologias:**
- React 18 + TypeScript
- Supabase (PostgreSQL)
- TailwindCSS + shadcn/ui
- Vite + PWA

**Funcionalidades:**
- 🎨 Interface moderna e responsiva
- 🔐 Autenticação segura
- 👥 Multi-usuário (paciente/cuidador/médico)
- 📊 Gráficos e estatísticas
- 🔔 Notificações em tempo real
- 📄 Exportação (CSV/PDF)
- 📐 Fórmulas matemáticas personalizadas
- 🔗 Sistema de conexões

**Vantagens:**
- ✅ Escalável e profissional
- ✅ Offline-first (PWA)
- ✅ Banco de dados robusto
- ✅ Deploy automatizado

</td>
</tr>
</table>

---

## ✨ Funcionalidades

### 1. **Cálculo de Insulina Flexível**

<table>
<tr>
<td width="50%">

**📐 Fórmula Matemática**
```javascript
Fórmula: (glucose - 100) / 30
Tipo: Fiasp

Medição: 180 mg/dL
Resultado: 2.7 unidades
```
- Cálculo dinâmico personalizado
- Prescrito pelo médico
- Suporta expressões complexas

</td>
<td width="50%">

**📋 Regras Relacionais**
```javascript
250-350 mg/dL → 2 unidades
350-450 mg/dL → 3 unidades  
450+ mg/dL → 4 unidades ⚠️
```
- Faixas de glicemia fixas
- Múltiplas regras configuráveis
- Alertas de emergência

</td>
</tr>
</table>

### 2. **Sistema Multi-Usuário**

- 👨‍⚕️ **Médicos**: Acompanham múltiplos pacientes
- 👨‍👩‍👧 **Cuidadores**: Recebem notificações em tempo real
- 🧒 **Pacientes**: Gerenciam suas próprias medições

### 3. **Conexões Inteligentes**

- 🔗 Convites entre usuários
- 🔔 Notificações instantâneas
- 👁️ Visualização compartilhada do histórico
- 🔐 Controle de privacidade

### 4. **Histórico Avançado**

- 📊 Gráficos interativos
- 📈 Estatísticas semanais/mensais
- 📄 Exportação para CSV
- 🖨️ Relatórios imprimíveis
- 🔍 Filtros personalizados

### 5. **PWA (Progressive Web App)**

- 📲 Instalável no celular
- 🌐 Funciona offline
- 🚀 Carregamento rápido
- 📱 Design responsivo

---

## 🛠️ Stack Tecnológica

### Frontend
```
⚛️  React 18.3          - UI Library
🔷  TypeScript 5.6      - Type Safety  
⚡  Vite 5.4           - Build Tool
🎨  TailwindCSS        - Styling
🧩  shadcn/ui          - Components
🗺️   React Router 6     - Navigation
```

### Backend
```
🔥  Supabase           - BaaS
🗄️  PostgreSQL         - Database
🔐  Supabase Auth      - Authentication
📡  Realtime           - WebSockets
🛡️  Row Level Security - Data Protection
```

### DevTools
```
💻  Lovable            - AI-Assisted Dev
🐙  Git/GitHub         - Version Control
✅  TypeScript         - Type Checking
🎯  ESLint             - Code Quality
```

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Setup Rápido

```bash
# 1. Clone o repositório
git clone https://github.com/Yas-min176/glicemia-amiga.git
cd glicemia-amiga

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# 4. Execute o projeto
npm run dev
```

O app estará em `http://localhost:8080` 🚀

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=sua_url_do_supabase_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_publica_aqui
```

> ⚠️ **NUNCA commite o arquivo `.env`!** Ele já está no `.gitignore`.

---

## 🗄️ Estrutura do Banco

```sql
profiles
├── user_id (UUID)
├── name (TEXT)
├── user_type (TEXT) -- patient, caregiver, doctor
├── dosage_calculation_type (TEXT) -- rules, formula
├── insulin_formula (TEXT)
└── insulin_type (TEXT)

dosage_rules
├── user_id (UUID)
├── min_glucose (INT)
├── max_glucose (INT)
├── insulin_units (INT)
├── recommendation (TEXT)
└── is_emergency (BOOLEAN)

glucose_readings
├── user_id (UUID)
├── value (INT)
├── insulin_units (INT)
├── status (TEXT)
├── recommendation (TEXT)
└── created_at (TIMESTAMP)

patient_connections
├── patient_id (UUID)
├── caregiver_id (UUID)
└── status (TEXT) -- pending, accepted, rejected
```

---

## 🎨 Screenshots

<table>
<tr>
<td align="center">
<img src="docs/screenshots/home.png" width="200px" alt="Tela Inicial"/>
<br /><b>Tela Inicial</b>
</td>
<td align="center">
<img src="docs/screenshots/medicao.png" width="200px" alt="Nova Medição"/>
<br /><b>Nova Medição</b>
</td>
<td align="center">
<img src="docs/screenshots/historico.png" width="200px" alt="Histórico"/>
<br /><b>Histórico</b>
</td>
<td align="center">
<img src="docs/screenshots/config.png" width="200px" alt="Configurações"/>
<br /><b>Configurações</b>
</td>
</tr>
</table>

---

## 🚀 Deploy

### Deploy Automático (Lovable)

O projeto está configurado com deploy automático via Lovable:

```bash
# Push para o GitHub
git push origin main

# Deploy acontece automaticamente! ✨
```

### Deploy Manual

```bash
# Build de produção
npm run build

# Preview do build
npm run preview

# Deploy para Vercel/Netlify
# Siga as instruções da plataforma escolhida
```

---

## 📱 Como Usar

### Para Pacientes

1. **Cadastre-se** como "Paciente"
2. **Configure** o método de cálculo:
   - **Fórmula**: Digite a fórmula do seu médico
   - **Regras**: Crie faixas de glicemia
3. **Registre** suas medições diárias
4. **Visualize** o histórico e estatísticas
5. **Convide** cuidadores para monitoramento

### Para Cuidadores

1. **Cadastre-se** como "Cuidador"
2. **Aceite** convites de pacientes
3. **Monitore** medições em tempo real
4. **Receba** alertas de emergência
5. **Exporte** relatórios para o médico

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! 

```bash
# 1. Fork o projeto
# 2. Crie uma branch
git checkout -b feature/MinhaFeature

# 3. Commit suas mudanças
git commit -m 'feat: Adiciona nova funcionalidade'

# 4. Push para a branch
git push origin feature/MinhaFeature

# 5. Abra um Pull Request
```

### Padrões de Commit

Seguimos o [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Alterações em documentação
- `style:` Formatação, ponto e vírgula, etc
- `refactor:` Refatoração de código
- `test:` Adição ou alteração de testes
- `chore:` Atualizações de build, configs, etc

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autora

<table>
<tr>
<td align="center">
<a href="https://github.com/Yas-min176">
<img src="https://github.com/Yas-min176.png" width="100px;" alt="Yasmin"/>
<br />
<sub><b>Yasmin Sena</b></sub>
</a>
<br />
<a href="https://www.linkedin.com/in/yas-min176">LinkedIn</a> •
<a href="https://github.com/Yas-min176">GitHub</a>
</td>
</tr>
</table>

---

## 🙏 Agradecimentos

- [Lovable](https://lovable.dev) - Plataforma de desenvolvimento
- [Supabase](https://supabase.com) - Backend infrastructure  
- [shadcn](https://ui.shadcn.com) - Beautiful components
- Comunidade React e TypeScript
- Meu irmão, Felipe, inspiração para este projeto ❤️

---

## ⚠️ Aviso Médico Importante

> **ATENÇÃO**: Este aplicativo é uma **ferramenta auxiliar** e **NÃO substitui** orientação médica profissional. 
> 
> - ❌ Não altere dosagens sem consultar seu médico
> - ❌ Não use em situações de emergência
> - ✅ Sempre siga as orientações do seu endocrinologista
> - 🚨 Em caso de emergência, procure atendimento médico imediatamente
>
> Os cálculos fornecidos são baseados nas configurações inseridas pelo usuário e devem ser validados por um profissional de saúde.

---

## 📊 Status do Projeto

```
✅ MVP Completo
✅ Deploy em Produção  
✅ Multi-usuário implementado
✅ PWA funcional
🚧 Testes automatizados (em progresso)
🚧 Integração com smartwatches (planejado)
📝 Versão mobile nativa (planejado)
```

---

## 📞 Contato e Suporte

- 🐛 **Bugs**: [Abra uma issue](https://github.com/Yas-min176/glyco-buddy/issues)
- 💡 **Sugestões**: [Abra uma issue](https://github.com/Yas-min176/glyco-buddy/issues)
- 📧 **Email**: [yasmin.senaysb@gmail.com](mailto:yasmin.senaysb@gmail.com)

---

<div align="center">

### Feito com ❤️ e 🐝 por Yasmin

**2021 → 2025: Do Telegram ao React, evoluindo para ajudar mais pessoas**

[![Star on GitHub](https://img.shields.io/github/stars/Yas-min176/glyco-buddy?style=social)](https://github.com/Yas-min176/glyco-buddy)
[![Follow](https://img.shields.io/github/followers/Yas-min176?label=Follow&style=social)](https://github.com/Yas-min176)

</div>
