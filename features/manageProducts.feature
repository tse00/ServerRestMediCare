Feature: Gestão de Produtos (Administrador)

  Background:
    Given estou autenticado como administrador no sistema

  # ---------- Frontend ----------

  @ui
  Scenario: Registar um produto com sucesso no frontend
    When registo um produto no frontend com preço "100", descrição "Produto de teste" e quantidade "5"
    Then sou redirecionado para a lista de produtos
    And o produto registado aparece na lista com preço "100", descrição "Produto de teste" e quantidade "5"

  @ui
  Scenario: Não permite registar um produto com nome já existente no frontend
    Given existe um produto registado na API com preço 50, descrição "Original" e quantidade 2
    When registo no frontend um produto com o mesmo nome, preço "10", descrição "Duplicado" e quantidade "1"
    Then vejo a mensagem de erro "Já existe produto com esse nome"

  @ui
  Scenario: Listar produtos no frontend
    Given existe um produto registado na API com preço 75, descrição "Listado" e quantidade 3
    When abro a lista de produtos
    Then o produto registado aparece na lista com preço "75", descrição "Listado" e quantidade "3"

  # ---------- API (/produtos) ----------

  @api
  Scenario: Registar um produto com sucesso na API
    When registo um produto na API com preço 100, descrição "Produto API" e quantidade 5
    Then a API responde com o estado 201
    And a resposta contém a mensagem "Cadastro realizado com sucesso"
    And a resposta contém o "_id" do produto

  @api
  Scenario: Não permite registar um produto com nome já existente na API
    Given existe um produto registado na API com preço 50, descrição "Original" e quantidade 2
    When registo na API um produto com o mesmo nome, preço 10, descrição "Duplicado" e quantidade 1
    Then a API responde com o estado 400
    And a resposta contém a mensagem "Já existe produto com esse nome"

  @api
  Scenario: Não permite registar um produto com dados inválidos na API
    When registo um produto na API com nome "", preço -1, descrição "" e quantidade -1
    Then a API responde com o estado 400
    And a resposta contém o erro "nome" com "nome não pode ficar em branco"
    And a resposta contém o erro "preco" com "preco deve ser um número positivo"
    And a resposta contém o erro "descricao" com "descricao não pode ficar em branco"
    And a resposta contém o erro "quantidade" com "quantidade deve ser maior ou igual a 0"

  @api
  Scenario: Não permite registar um produto sem token na API
    When registo um produto na API sem token de autenticação
    Then a API responde com o estado 401
    And a resposta contém a mensagem "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"

  @api
  Scenario: Não permite registar um produto com utilizador não administrador na API
    Given existe um utilizador não administrador autenticado na API
    When registo um produto na API com o token desse utilizador
    Then a API responde com o estado 403
    And a resposta contém a mensagem "Rota exclusiva para administradores"

  @api
  Scenario: Listar produtos na API e encontrar o produto registado
    Given existe um produto registado na API com preço 75, descrição "Listado" e quantidade 3
    When listo os produtos na API filtrando pelo nome do produto
    Then a API responde com o estado 200
    And a lista contém exatamente 1 produto com o nome, preço 75, descrição "Listado" e quantidade 3

  @api
  Scenario: Consultar um produto por ID na API
    Given existe um produto registado na API com preço 75, descrição "Listado" e quantidade 3
    When consulto o produto na API pelo seu ID
    Then a API responde com o estado 200
    And o produto devolvido tem o nome, preço 75, descrição "Listado" e quantidade 3
