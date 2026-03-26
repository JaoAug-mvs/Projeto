# NutriFlow

Aplicação web estática para montar dietas personalizadas automaticamente com base no perfil, objetivo, preferências alimentares e evolução de peso do usuário.

## Como rodar

Como o projeto foi feito sem dependências externas, você pode usar qualquer servidor estático simples.

### Opção 1: abrir diretamente

Abra o arquivo `index.html` no navegador.

### Opção 2: usar um servidor local

Se tiver Python instalado, execute na pasta do projeto:

```bash
python -m http.server 5500
```

Depois abra [http://localhost:5500](http://localhost:5500).

## Estrutura do sistema

- `index.html`: ponto de entrada da aplicação
- `styles/main.css`: identidade visual, responsividade e animações
- `src/app.js`: controle principal da SPA, eventos e fluxo de dados
- `src/pages/`: seções principais da interface
- `src/components/`: cards, gráfico e campos reutilizáveis
- `src/utils/`: regras de negócio, cálculos e gerador automático de dieta
- `src/state/storage.js`: persistência em `localStorage`

## Funcionalidades implementadas

- Cadastro completo de perfil do usuário
- Preferências, intolerâncias, alergias e rejeições alimentares
- Cálculo de IMC
- Estimativa de calorias diárias com ajuste por objetivo
- Geração automática de dieta com 6 refeições
- Sugestões alternativas por refeição
- Quantidades aproximadas por alimento
- Metas diárias de macronutrientes
- Registro de progresso com histórico salvo localmente
- Ajuste automático da dieta com base na evolução do peso
- Painel com meta atual, calorias sugeridas e gráfico simples de evolução
- Interface responsiva com feedback visual ao gerar dieta

## Regras de negócio usadas

- Gasto energético estimado por fórmula de metabolismo basal com fator de atividade
- Déficit calórico para emagrecimento
- Superávit leve para ganho de massa
- Equilíbrio calórico para manutenção
- Filtragem de refeições para respeitar vegetarianismo, intolerâncias, alergias e alimentos rejeitados
- Priorização de alimentos preferidos quando possível

## Observação importante

O sistema entrega uma sugestão automatizada e educativa. Ele não substitui avaliação individual com nutricionista ou acompanhamento clínico.
