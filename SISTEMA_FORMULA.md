# 💊 Sistema de Cálculo de Insulina Personalizado

## 📋 Visão Geral

O aplicativo Beez agora suporta **dois métodos** de cálculo de insulina:

### 1. Regras Relacionais (Padrão)
Faixas de glicemia com doses fixas de insulina.

**Exemplo:**
- 250-350 mg/dL → 2 unidades
- 350-450 mg/dL → 3 unidades
- 450+ mg/dL → 4 unidades

### 2. Fórmula Matemática (Personalizado)
Cálculo dinâmico baseado em fórmula prescrita pelo médico.

**Exemplo do seu irmão:**
```
(glucose - 100) / 30 = doses de Fiasp
```

Para glicemia de 180 mg/dL:
```
(180 - 100) / 30 = 2.67 unidades
```

## 🎯 Como Configurar

### Passo 1: Acessar Configurações
1. Faça login como paciente
2. Vá em **Configurações** (menu inferior)
3. Clique na aba **"Cálculo"**

### Passo 2: Escolher Método

#### Opção A: Regras Relacionais
- Selecione "Regras Relacionais"
- Vá para a aba "Regras" para configurar as faixas
- Crie/edite as regras conforme necessário

#### Opção B: Fórmula Matemática
1. Selecione "Fórmula Matemática"
2. Digite o **tipo de insulina** (ex: Fiasp, Novorapid, Humalog)
3. Digite a **fórmula** usando `glucose` como variável
4. Clique em "Testar Fórmula" para validar
5. Clique em "Salvar Configuração"

## 📝 Sintaxe da Fórmula

### Variável Obrigatória
- Use `glucose` para representar o valor da medição
- Não é case-sensitive: `Glucose`, `GLUCOSE` também funcionam

### Operadores Suportados
- `+` (adição)
- `-` (subtração)
- `*` (multiplicação)
- `/` (divisão)
- `( )` (parênteses para ordem de operação)

### Exemplos de Fórmulas Válidas

#### Exemplo 1: Fórmula Linear
```javascript
(glucose - 100) / 30
```
- Para 150 mg/dL: (150-100)/30 = 1.67 unidades
- Para 200 mg/dL: (200-100)/30 = 3.33 unidades

#### Exemplo 2: Fórmula com Ajuste
```javascript
(glucose - 120) / 25
```
- Meta glicêmica: 120 mg/dL
- Sensibilidade: 25 mg/dL por unidade

#### Exemplo 3: Fórmula com Peso
```javascript
((glucose - 100) / 30) * 1.2
```
- Ajuste de 20% para peso corporal

#### Exemplo 4: Fórmula Condicional (usando regras)
Para fórmulas mais complexas, recomenda-se usar regras relacionais.

## 🔍 Como Funciona

### No Momento da Medição

1. **Você digita** a glicemia (ex: 180 mg/dL)
2. **O app substitui** `glucose` na fórmula
   ```
   (180 - 100) / 30
   ```
3. **O app calcula**
   ```
   80 / 30 = 2.67
   ```
4. **O app arredonda** para 1 casa decimal
   ```
   2.7 unidades
   ```
5. **O app mostra** a recomendação
   ```
   "Tome 2.7 unidades de Fiasp."
   ```

### Lógica de Status

Mesmo usando fórmula, o app ainda considera os níveis:

- **≤ 60 mg/dL**: Hipoglicemia crítica (não calcula insulina)
- **61-89 mg/dL**: Hipoglicemia (não calcula insulina)
- **90-249 mg/dL**: Normal (pode calcular se glicemia > 100)
- **250-349 mg/dL**: Hiperglicemia (calcula insulina)
- **350-449 mg/dL**: Hiperglicemia alta (calcula insulina)
- **≥ 450 mg/dL**: Hiperglicemia crítica (calcula + alerta médico)

## ⚠️ Segurança

### Validações Automáticas

1. **Fórmula inválida**: Se houver erro de sintaxe, volta para regras
2. **Resultado negativo**: Se der negativo, não aplica insulina
3. **Hipoglicemia**: Nunca calcula insulina para glicemia baixa
4. **Emergências**: Sempre mostra alertas para valores críticos

### Alertas Especiais

- **≤ 60**: "Coma algo doce IMEDIATAMENTE"
- **≥ 450**: "Busque atendimento médico"

## 📊 Visualização

### Na Página Inicial
Mostra card informativo quando fórmula está ativa:
- Fórmula configurada
- Tipo de insulina
- Exemplo de cálculo

### Na Nova Medição
Banner no topo mostrando:
- "Método de cálculo: Fórmula matemática"
- Fórmula sendo usada
- Tipo de insulina

### No Histórico
Cada medição salva com:
- Valor da glicemia
- Unidades calculadas
- Recomendação gerada

## 🔄 Migrar Entre Métodos

### De Regras para Fórmula
1. Configure a fórmula em Configurações > Cálculo
2. As regras antigas são mantidas (não excluídas)
3. Fórmula passa a ter prioridade

### De Fórmula para Regras
1. Mude para "Regras Relacionais" em Configurações > Cálculo
2. A fórmula é mantida (não excluída)
3. Regras passam a ter prioridade

## 🎓 Dicas do Médico

### Quando Usar Cada Método

**Use Regras quando:**
- Prescrição com faixas fixas
- Paciente iniciante (mais simples)
- Dosagem não varia linearmente
- Múltiplas condições especiais

**Use Fórmula quando:**
- Médico prescreveu cálculo matemático
- Paciente experiente
- Dosagem proporcional à glicemia
- Ajuste baseado em sensibilidade individual

### Ajustando a Fórmula

Converse com seu médico sobre:
- **Meta glicêmica**: Valor base (ex: 100, 120)
- **Fator de sensibilidade**: Quanto 1 unidade reduz (ex: 30, 50)
- **Ajustes**: Peso, atividade física, refeições
- **Limites**: Dose máxima por aplicação

## 🧪 Testando Sua Fórmula

### Teste 1: Valores Conhecidos
Use medições passadas onde você sabe a dose:
1. Digite a glicemia antiga
2. Compare com a dose que você tomou
3. Ajuste a fórmula se necessário

### Teste 2: Casos Extremos
Teste com valores:
- 70 (baixo) - não deve dar insulina
- 100 (meta) - deve dar zero ou próximo
- 200 (alto) - deve calcular dose
- 400 (muito alto) - deve alertar

### Teste 3: Botão "Testar"
Em Configurações > Cálculo:
- Clique em "Testar Fórmula"
- O app testa com 150 mg/dL
- Veja se o resultado faz sentido

## 📱 Exemplo Prático: Caso do Seu Irmão

### Configuração
- **Método**: Fórmula Matemática
- **Insulina**: Fiasp
- **Fórmula**: `(glucose - 100) / 30`

### Cenários

#### Cenário 1: Glicemia 150
```
(150 - 100) / 30 = 1.7 unidades de Fiasp
```

#### Cenário 2: Glicemia 220
```
(220 - 100) / 30 = 4.0 unidades de Fiasp
```

#### Cenário 3: Glicemia 85 (baixa)
```
Não calcula! Mensagem: "Coma um alimento doce"
```

#### Cenário 4: Glicemia 480 (muito alta)
```
(480 - 100) / 30 = 12.7 unidades de Fiasp
+ Alerta: "Busque atendimento médico"
```

## 🔐 Banco de Dados

### Campos Adicionados em `profiles`
```sql
dosage_calculation_type  TEXT     -- 'rules' ou 'formula'
insulin_formula          TEXT     -- ex: "(glucose - 100) / 30"
insulin_type            TEXT     -- ex: "Fiasp"
```

### Salvamento de Medições
Cada medição salva:
- `value`: Glicemia medida
- `insulin_units`: Unidades calculadas (pode ter decimal)
- `recommendation`: Texto da recomendação
- `status`: critical-low, low, normal, high, etc.

## ❓ FAQ

### A fórmula pode ter valores decimais no resultado?
Sim! O app arredonda para 1 casa decimal (ex: 2.67 → 2.7)

### E se eu errar a fórmula?
O app tenta calcular. Se der erro, volta para regras automaticamente.

### Posso usar ambos os métodos?
Apenas um de cada vez, mas pode alternar quando quiser.

### A fórmula funciona offline?
Sim! Tudo é calculado localmente no dispositivo.

### Posso ter fórmulas diferentes para jejum/alimentado?
Atualmente não. Use uma fórmula geral ou regras relacionais.

## 📞 Suporte

Em caso de dúvidas sobre a fórmula ideal para você:
1. **Consulte seu médico endocrinologista**
2. Leve exemplos de medições recentes
3. Pergunte sobre seu fator de sensibilidade
4. Teste e ajuste com supervisão médica

---

**⚠️ IMPORTANTE:** Este aplicativo é um guia. Sempre siga as orientações do seu médico. Nunca altere sua medicação sem orientação profissional.
