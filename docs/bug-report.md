# Relatório de problemas — Gestão de produtos (ServerRest)

- **Âmbito:** registo e listagem de produtos (`/produtos`), frontend e API
- **Ambientes:** https://front.serverest.dev e https://serverest.dev
- **Data da observação:** 2026-11-24 / 2026-11-25
- **Método:** exploração manual (Playwright MCP e `curl`) + testes automatizados em `features/manageProducts.feature`
- **Pré-requisito comum:** criar um utilizador com `administrador: "true"` (`POST /usuarios`) e obter o token (`POST /login`).

| ID | Título | Área | Severidade |
|----|--------|------|------------|
| BUG-01 | `POST /produtos` aceita `preco` como string e converte-o em silêncio | API | Média |
| BUG-02 | Preço só aceita inteiros (sem cêntimos) | API | Média |
| BUG-03 | Verificação de nome duplicado é sensível a maiúsculas/minúsculas | API | Baixa |
| BUG-04 | Frontend escreve os dados do formulário na consola a cada tecla | Frontend | Baixa |

---

## BUG-01 — `POST /produtos` aceita `preco` como string e converte-o em silêncio

**Severidade:** Média — **Estado:** Reproduzido

**Passos**
1. Autenticar como administrador e obter o token.
2. Enviar:
   ```bash
   curl -X POST https://serverest.dev/produtos \
     -H 'Content-Type: application/json' -H "Authorization: $TOKEN" \
     -d '{"nome":"bug str 1","preco":"10","descricao":"d","quantidade":1}'
   ```
3. Consultar o produto criado: `GET /produtos/{_id}`.

**Resultado obtido:** `201 Cadastro realizado com sucesso`. O produto fica gravado com `"preco": 10` (número).

**Resultado esperado:** `400` com `"preco deve ser um número"` (ou equivalente). Os outros erros de tipo são rejeitados: `preco: 10.567` devolve `400 "preco deve ser um inteiro"` e `quantidade: 1.5` devolve `400 "quantidade deve ser um inteiro"`.

**Impacto:** a validação é inconsistente. Clientes que enviem o tipo errado não são avisados e podem depender de uma coerção não documentada. O swagger define `preco` como número.

---

## BUG-02 — Preço só aceita inteiros (sem cêntimos)

**Severidade:** Média (a confirmar com o produto se é intencional) — **Estado:** Reproduzido

**Passos**
1. `POST /produtos` com `"preco": 10.567` (ou `10.5`).

**Resultado obtido:** `400 {"preco":"preco deve ser um inteiro"}`.

**Resultado esperado:** uma loja online deve permitir preços com casas decimais (ex.: 9.99), ou a documentação deve indicar claramente que o preço é inteiro.

**Nota:** o valor `0` também é rejeitado (`preco deve ser um número positivo`). Confirmar se produtos gratuitos estão fora do âmbito.

---

## BUG-03 — Verificação de nome duplicado é sensível a maiúsculas/minúsculas

**Severidade:** Baixa — **Estado:** Reproduzido

**Passos**
1. `POST /produtos` com `"nome":"CaseTest 1"` → `201`.
2. `POST /produtos` com `"nome":"casetest 1"` → `201`.

**Resultado obtido:** os dois produtos são criados.

**Resultado esperado:** `400 "Já existe produto com esse nome"`, já que a regra é "não é permitido cadastrar produto com nome já utilizado" e os nomes só diferem na capitalização. Na listagem aparecem dois produtos indistinguíveis para o utilizador.

**Nota:** nomes com apenas espaços são corretamente rejeitados (`nome não pode ficar em branco`).

---

## BUG-04 — Frontend escreve os dados do formulário na consola a cada tecla

**Severidade:** Baixa — **Estado:** Reproduzido

**Passos**
1. Iniciar sessão como administrador em https://front.serverest.dev/login.
2. Abrir "Cadastrar Produtos" com as DevTools abertas (consola).
3. Escrever nos campos nome, preço, descrição e quantidade.

**Resultado obtido:** surgem mensagens `console.log` do `main.*.chunk.js` com o estado acumulado, por exemplo `{nome: Produto Explore X1, price: 100, description: Desc, quantity: 5}`.

**Resultado esperado:** sem logging de depuração no build de produção.

**Impacto:** ruído na consola e exposição desnecessária do conteúdo dos formulários.

---

## Observações (não classificadas como bug)

- A lista de produtos do frontend é pública e partilhada, por isso cresce sem limite e mistura dados de outros utilizadores. Isso dificulta a verificação de resultados; os testes automatizados usam nomes únicos para o contornar.
- Utilizadores e produtos de teste são removidos periodicamente pelo ambiente. Os testes criam sempre os seus próprios dados.
- Não foi verificado o comportamento do frontend ao submeter o formulário de produto vazio.
