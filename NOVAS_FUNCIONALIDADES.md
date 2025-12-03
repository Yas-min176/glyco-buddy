# Beez - Guia de Glicemia e Insulina 🐝

## Novas Funcionalidades Implementadas

### 1. 💊 Configuração Personalizada de Dosagem

Agora você pode personalizar completamente as regras de dosagem de insulina!

**Como usar:**
1. Acesse **Configurações** no menu
2. Clique na aba **Regras de Dosagem**
3. Você pode:
   - **Editar regras existentes**: Clique em "Editar" em qualquer regra
   - **Adicionar novas regras**: Clique em "Nova Regra"
   - **Excluir regras**: Clique no ícone de lixeira

**Campos configuráveis:**
- **Glicemia Mínima**: Valor mínimo em mg/dL (ex: 250)
- **Glicemia Máxima**: Valor máximo em mg/dL (deixe vazio para "sem limite")
- **Unidades de Insulina**: Quantidade a ser administrada (opcional)
- **Recomendação**: Texto da orientação (ex: "Tome 2 unidades de insulina")
- **Situação de Emergência**: Marque para casos críticos

### 2. 👥 Sistema de Tipos de Usuário

O aplicativo agora suporta três tipos de usuário:

#### **Paciente** 🏥
- Registra suas próprias medições de glicemia
- Gerencia suas regras de dosagem
- Pode conectar-se com cuidadores e médicos
- Visualiza seu histórico pessoal

#### **Cuidador/Responsável** 👨‍👩‍👧
- Acompanha as medições de pacientes conectados
- Recebe notificações em tempo real (quando implementado)
- Visualiza histórico de múltiplos pacientes

#### **Médico/Profissional** 🩺
- Monitora todos os pacientes conectados
- Acessa estatísticas e tendências
- Visualiza relatórios detalhados

**Escolha o tipo durante o cadastro!**

### 3. 🤝 Sistema de Conexões Paciente-Cuidador

Conecte pacientes com seus cuidadores e médicos:

**Para Pacientes:**
1. Acesse **Conexões** no menu
2. Digite o email do cuidador/médico
3. Clique em "Enviar Convite"
4. Aguarde a aceitação

**Para Cuidadores/Médicos:**
1. Acesse **Conexões**
2. Veja os convites pendentes
3. Clique no ✓ para aceitar ou ✗ para recusar
4. Conexões aceitas aparecem em "Conexões Ativas"

**Gerenciar conexões:**
- Remova conexões ativas a qualquer momento
- Visualize todas as suas conexões em um só lugar

### 4. 📄 Exportação e Impressão de Histórico

Exporte e compartilhe seus dados de forma profissional!

**Recursos disponíveis:**

#### **Impressão (PDF)** 🖨️
1. Acesse **Histórico**
2. Clique em "Imprimir"
3. Um relatório completo será aberto em nova janela
4. Use Ctrl+P ou o botão "Imprimir Relatório"

**O relatório inclui:**
- Cabeçalho com logo e informações do paciente
- Estatísticas resumidas (média, mínima, máxima, % normal)
- Tabela detalhada de todas as medições
- Formatação profissional para apresentação médica

#### **Exportação CSV** 📊
1. Acesse **Histórico**
2. Clique em "Baixar CSV"
3. O arquivo será baixado automaticamente
4. Abra com Excel, Google Sheets, etc.

**Ideal para:**
- Análise de dados
- Importação em outros sistemas
- Backup pessoal

### 5. 🏥 Dashboard para Cuidadores

Cuidadores e médicos têm uma visualização especial:

**Página "Meus Pacientes":**
- Lista de todos os pacientes conectados
- Última medição de cada paciente
- Estatísticas rápidas (média, mínima, máxima)
- Indicador de tendência (↗ subindo, ↘ descendo, — estável)
- Histórico das últimas 5 medições

**Acesso automático:**
- Ao fazer login como cuidador/médico, você é redirecionado para esta página
- Visualize todos os seus pacientes em um só lugar

## 🗄️ Estrutura do Banco de Dados

### Novas Tabelas
- **profiles**: Informações do usuário (nome, tipo, data nascimento)
- **dosage_rules**: Regras de dosagem personalizáveis
- **glucose_readings**: Histórico de medições
- **patient_connections**: Conexões entre pacientes e cuidadores

### Segurança (RLS - Row Level Security)
- Usuários só veem seus próprios dados
- Cuidadores veem apenas dados de pacientes conectados
- Todas as policies configuradas no Supabase

## 🚀 Como Testar

### Teste 1: Configuração de Dosagem
1. Faça login como paciente
2. Vá em Configurações > Regras de Dosagem
3. Adicione uma nova regra: 300-400 mg/dL = 2.5 unidades
4. Faça uma medição de 350 mg/dL
5. Verifique se a recomendação está correta

### Teste 2: Conexão Paciente-Cuidador
1. Crie duas contas: uma paciente, uma cuidador
2. Na conta do paciente, vá em Conexões
3. Envie convite para o email do cuidador
4. Faça login como cuidador e aceite o convite
5. O cuidador agora pode ver as medições do paciente

### Teste 3: Exportação
1. Registre várias medições
2. Vá em Histórico
3. Teste "Imprimir" - deve abrir relatório formatado
4. Teste "Baixar CSV" - deve fazer download do arquivo

## 📱 Navegação

### Menu Inferior (5 ícones):
- **Início**: Dashboard do paciente ou lista de pacientes (cuidador)
- **Medir**: Nova medição de glicemia
- **Histórico**: Ver medições passadas
- **Conexões**: Gerenciar conexões paciente-cuidador
- **Config**: Configurações e regras de dosagem

## ⚠️ Importante

- Este aplicativo é um **guia**, não substitui orientação médica
- Sempre consulte seu médico para ajustes no tratamento
- As regras de dosagem devem ser configuradas com orientação profissional
- Mantenha backup regular dos seus dados

## 🐛 Resolução de Problemas

### "Não consigo enviar convite"
- Verifique se o email está correto
- Certifique-se que a outra pessoa já criou uma conta
- O destinatário deve ser cuidador ou médico (não paciente)

### "Minhas regras não aparecem"
- Verifique se está logado
- Tente fazer logout e login novamente
- As regras padrão são criadas no primeiro login

### "Relatório não imprime"
- Permita pop-ups no navegador
- Tente usar outro navegador (Chrome recomendado)
- Verifique se tem impressora configurada

## 🎯 Próximos Passos

Funcionalidades planejadas:
- [ ] Notificações em tempo real para cuidadores
- [ ] Gráficos e tendências avançadas
- [ ] Exportação para PDF diretamente
- [ ] Integração com dispositivos de medição
- [ ] Lembretes de medição
- [ ] Análise de padrões (IA)

---

**Desenvolvido com 💛 para ajudar pacientes diabéticos**

Para suporte ou dúvidas, consulte a documentação completa.
