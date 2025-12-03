# 🚀 Guia de Deployment - Beez

## Pré-requisitos

- Node.js instalado (v16 ou superior)
- Conta no Supabase configurada
- Git instalado

## 📦 1. Instalar Dependências

```bash
cd "c:\Users\yasmi\Documents\qqr codigo de bosta\Beez\glicemia-amiga"
npm install
```

## 🗄️ 2. Configurar Banco de Dados

### Opção A: Supabase Dashboard (Recomendado)

1. Acesse https://supabase.com/dashboard
2. Abra seu projeto
3. Vá em **SQL Editor**
4. Copie e execute o conteúdo de `supabase/migrations/20251203160838_310e5556-2203-49d7-9acb-beed9c6b1576.sql`
5. Clique em **Run**

### Opção B: Supabase CLI

```bash
# Se tiver Supabase CLI instalado
supabase db reset
```

## 🔑 3. Verificar Variáveis de Ambiente

Certifique-se que o arquivo `.env` está configurado:

```env
VITE_SUPABASE_PROJECT_ID="seu-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-public-key"
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
```

## 🧪 4. Testar Localmente

```bash
npm run dev
```

Acesse: http://localhost:8080

## ✅ 5. Verificar Funcionalidades

### Checklist de Testes:

#### Cadastro e Login
- [ ] Criar conta como Paciente
- [ ] Criar conta como Cuidador
- [ ] Fazer login com ambas

#### Regras de Dosagem
- [ ] Acessar Configurações > Regras de Dosagem
- [ ] Editar uma regra existente
- [ ] Adicionar nova regra personalizada
- [ ] Excluir uma regra

#### Medições
- [ ] Fazer nova medição de glicemia
- [ ] Verificar se recomendação aparece correta
- [ ] Ver medição no histórico

#### Conexões
- [ ] Paciente: Enviar convite para cuidador (por email)
- [ ] Cuidador: Aceitar convite
- [ ] Verificar conexão ativa

#### Dashboard Cuidador
- [ ] Login como cuidador
- [ ] Ver dashboard "Meus Pacientes"
- [ ] Verificar medições do paciente conectado

#### Exportação
- [ ] Abrir Histórico
- [ ] Clicar em "Imprimir" - deve abrir relatório
- [ ] Clicar em "Baixar CSV" - deve fazer download

## 🌐 6. Deploy em Produção

### Lovable.dev (Recomendado)

1. Acesse https://lovable.dev
2. Abra o projeto
3. Clique em **Share > Publish**
4. Aguarde o deploy

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Faça upload da pasta dist/ no Netlify
```

## 🔒 7. Configurar RLS no Supabase

Verifique se as policies estão ativas:

1. Acesse Supabase Dashboard
2. Vá em **Authentication > Policies**
3. Verifique se todas as tabelas têm RLS habilitado:
   - profiles
   - dosage_rules
   - glucose_readings
   - patient_connections

## 📱 8. Configurar PWA (Opcional)

O app já está configurado como PWA. Para instalá-lo:

1. Acesse o site em um navegador mobile
2. Chrome: Menu > "Adicionar à tela inicial"
3. Safari: Botão compartilhar > "Adicionar à tela de início"

## 🐛 Troubleshooting

### Erro: "Cannot find module 'react'"

```bash
npm install
```

### Erro: "Supabase connection failed"

Verifique o arquivo `.env` e as credenciais no Supabase Dashboard.

### Erro: "RLS policy violation"

Execute novamente a migration SQL com todas as policies.

### Compilação falha

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📊 Monitoramento

### Supabase Dashboard

- **Database**: Ver tabelas e dados
- **Authentication**: Usuários cadastrados
- **API**: Uso da API
- **Storage**: Não usado no momento

### Logs

```bash
# Ver logs do servidor de desenvolvimento
npm run dev

# Ver logs de build
npm run build
```

## 🔄 Atualizações Futuras

### Para adicionar novas funcionalidades:

1. Desenvolva localmente
2. Teste todas as funcionalidades
3. Commit e push para o Git
4. Deploy automático (Lovable/Vercel)

### Backup do Banco

```bash
# Exportar dados do Supabase
# Via Dashboard: Database > Backups
```

## 📧 Suporte

Em caso de problemas:

1. Verifique os logs do navegador (F12)
2. Verifique logs do Supabase
3. Consulte a documentação:
   - [Supabase Docs](https://supabase.com/docs)
   - [Vite Docs](https://vitejs.dev/)
   - [React Router Docs](https://reactrouter.com/)

## 🎉 Pronto!

Seu aplicativo Beez está configurado e rodando com todas as novas funcionalidades:
- ✅ Configuração de dosagem personalizável
- ✅ Tipos de usuário (Paciente/Cuidador/Médico)
- ✅ Sistema de conexões
- ✅ Exportação de histórico
- ✅ Dashboard adaptado por tipo de usuário

---

**Desenvolvido com 💛 para ajudar pacientes diabéticos**
