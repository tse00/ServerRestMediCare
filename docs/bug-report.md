# Relatório de problemas — Gestão de produtos (ServerRest)

- **Âmbito:** registo e listagem de produtos (`/produtos`), frontend e API
- **Ambientes:** https://front.serverest.dev e https://serverest.dev
- **Data da observação:** 2026-11-24 / 2026-11-25
- **Método:** exploração manual (Playwright MCP e `curl`) + testes automatizados em `features/manageProducts.feature`
- **Pré-requisito comum:** criar um utilizador com `administrador: "true"` (`POST /usuarios`) e obter o token (`POST /login`).

| ID     | Título                                                                                    | Área           | Severidade |
| ------ | ----------------------------------------------------------------------------------------- | -------------- | ---------- |
| BUG-01 | `POST /produtos` aceita `preco` como string e converte-o em silêncio                      | API            | Média      |
| BUG-02 | Preço só aceita inteiros (sem cêntimos)                                                   | API            | Média      |
| BUG-03 | Verificação de nome duplicado é sensível a maiúsculas/minúsculas                          | API            | Baixa      |
| BUG-04 | Frontend escreve os dados do formulário na consola a cada tecla                           | Frontend       | Baixa      |
| BUG-05 | Frontend não reconhece os campos preenchidos após erro de validação no registo de produto | Frontend       | Média      |
| BUG-06 | Frontend permite criar produto sem anexar imagem apesar de ser obrigatório                | Frontend       | Média      |
| BUG-07 | Campo de imagem do frontend não é suportado pela API e grava `C:\fakepath\...` como texto | Frontend / API | Média      |

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

## BUG-05 — Frontend não reconhece os campos preenchidos após erro de validação no registo de produto

**Severidade:** Média — **Estado:** Reproduzido

**Passos**

1. Iniciar sessão como administrador em https://front.serverest.dev/login.
2. Abrir "Cadastrar Produtos".
3. Preencher alguns campos, deixando pelo menos um campo obrigatório em branco (ex.: descrição).
4. Clicar em "Cadastrar" e verificar que a submissão é rejeitada.
5. Preencher apenas o campo em falta e clicar novamente em "Cadastrar".

**Resultado obtido:** os campos preenchidos anteriormente continuam visíveis no formulário, mas não são reconhecidos na nova submissão. Para submeter com sucesso, é necessário reintroduzir todos os campos, mesmo os que já apareciam preenchidos.

**Resultado esperado:** os valores visíveis no formulário devem corresponder ao estado interno da aplicação. Depois de corrigir o campo em falta, a submissão deve ser aceite sem exigir que se reintroduzam os restantes.

**Impacto:** existe uma discrepância entre o que o utilizador vê e o que é submetido, o que induz em erro. O utilizador tem de repetir o preenchimento sem perceber porquê, o que prejudica a usabilidade e aumenta o risco de abandono.

---

## BUG-06 — Frontend permite criar produto sem anexar imagem apesar de o campo ser apresentado como obrigatório

**Severidade:** Média — **Estado:** Reproduzido

**Passos**

1. Iniciar sessão como administrador em https://front.serverest.dev/login.
2. Abrir "Cadastrar Produtos".
3. Preencher os campos nome, preço, descrição e quantidade com valores válidos.
4. Não anexar nenhum ficheiro no campo de imagem, que é apresentado como obrigatório.
5. Clicar em "Cadastrar".

**Resultado obtido:** o formulário é submetido sem validação e o produto é criado e listado sem imagem associada.

**Resultado esperado:** a interface deve ser coerente com o comportamento real. Existem duas opções:

- Se a imagem for obrigatória, a submissão deve ser bloqueada, com uma mensagem de erro junto ao campo (ex.: "Imagem é obrigatória").
- Se a imagem for opcional, ou não for suportada pela API (ver BUG-07), o campo não deve ser apresentado como obrigatório, ou deve ser removido do formulário.

**Impacto:** a interface está em contradição com o comportamento real, o que induz o utilizador em erro. Podem também ser criados produtos sem imagem, com apresentação inconsistente na listagem.

**Nota:** a obrigatoriedade do campo é apenas indicada visualmente na interface, e nem o frontend nem a API a aplicam. A API não documenta o campo `imagem` e aceita a criação de produtos sem ele. Ver também BUG-07.

---

## BUG-07 — Campo de imagem do frontend não é suportado pela API e grava `C:\fakepath\...` como texto

**Severidade:** Média — **Estado:** Reproduzido

**Passos**

1. Iniciar sessão como administrador em https://front.serverest.dev/login.
2. Abrir "Cadastrar Produtos".
3. Preencher os campos obrigatórios e anexar um ficheiro de imagem (ex.: `imageServerRest.jpg`).
4. Com o separador Network aberto, clicar em "Cadastrar".
5. Analisar o pedido `POST /produtos` e, de seguida, a tabela de produtos.
6. Comparar com a documentação de `POST /produtos` em https://serverest.dev.

**Resultado obtido:** o pedido `POST /produtos` é enviado com `Content-Type: application/json;charset=UTF-8` e o seguinte corpo:

```json
{
  "nome": "oopii",
  "preco": 56,
  "descricao": "grhtjy",
  "quantidade": 2,
  "imagem": "C:\\fakepath\\imageServerRest.jpg"
}
```

O ficheiro não é enviado, só o valor textual do campo. A API grava essa string e devolve-a em `GET /produtos` (`"imagem": "C:\\fakepath\\imageServerRest.jpg"`). A coluna "Imagem" da tabela apresenta esse texto em vez da imagem. Após selecionar o ficheiro, o mesmo valor é também escrito na consola.

A documentação da API não prevê esta funcionalidade. O schema de `POST /produtos` só define `nome`, `preco`, `descricao` e `quantidade`, e não existe nenhum endpoint de upload.

**Resultado esperado:** o frontend e a API devem estar alinhados. Existem duas opções:

- Se a imagem faz parte do produto, a API deve documentar o campo e suportar o upload, e o frontend deve enviar o ficheiro e apresentar a imagem.
- Se não faz, o campo deve ser removido do formulário, ou indicado como não suportado.

**Impacto:** o utilizador é levado a anexar um ficheiro que nunca é guardado. `C:\fakepath\` é o valor que o browser devolve por segurança para ocultar o caminho real, por isso a referência gravada não permite recuperar a imagem. A API aceita e persiste um campo que não está documentado, sem qualquer validação. A funcionalidade de upload não pode ser validada.

---

## Observações

- A lista de produtos do frontend é pública e partilhada, por isso cresce sem limite e mistura dados de outros utilizadores. Isso dificulta a verificação de resultados; os testes automatizados usam nomes únicos para o contornar.
- Utilizadores e produtos de teste são removidos periodicamente pelo ambiente. Os testes criam sempre os seus próprios dados.
