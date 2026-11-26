import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import { storeResponse, requireBody, BASE_API_URL } from '../support/apiHelpers';

const newProductName = (): string => `Produto QA ${Date.now()}_${Math.floor(Math.random() * 1000)}`;

interface ProductData {
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
}

// ---------- UI ----------

When(
  'registo um produto no frontend com preço {string}, descrição {string} e quantidade {string}',
  async (
    { adminHomePage, registerProductPage, testContext },
    price: string,
    description: string,
    quantity: string,
  ) => {
    testContext.productName = newProductName();
    await adminHomePage.openRegisterProduct();
    await registerProductPage.registerProduct({
      name: testContext.productName,
      price,
      description,
      quantity,
    });
  },
);

When(
  'registo no frontend um produto com o mesmo nome, preço {string}, descrição {string} e quantidade {string}',
  async (
    { adminHomePage, registerProductPage, testContext },
    price: string,
    description: string,
    quantity: string,
  ) => {
    await adminHomePage.openRegisterProduct();
    await registerProductPage.registerProduct({
      name: testContext.productName!,
      price,
      description,
      quantity,
    });
  },
);

When('abro a lista de produtos', async ({ adminHomePage }) => {
  await adminHomePage.openProductList();
});

Then('sou redirecionado para a lista de produtos', async ({ productListPage }) => {
  await productListPage.expectToBeOpen();
});

Then(
  'o produto registado aparece na lista com preço {string}, descrição {string} e quantidade {string}',
  async (
    { productListPage, testContext },
    price: string,
    description: string,
    quantity: string,
  ) => {
    const name = testContext.productName!;
    await productListPage.expectToBeOpen();
    await expect(productListPage.rowOf(name)).toHaveCount(1);
    const cells = productListPage.cellsOf(name);
    await expect(cells.nth(0)).toHaveText(name);
    await expect(cells.nth(1)).toHaveText(price);
    await expect(cells.nth(2)).toHaveText(description);
    await expect(cells.nth(3)).toHaveText(quantity);
  },
);

Then('vejo a mensagem de erro {string}', async ({ registerProductPage }, message: string) => {
  await expect(registerProductPage.message(message)).toBeVisible();
  await registerProductPage.expectToBeOpen();
});

// ---------- API ----------

Given(
  'existe um produto registado na API com preço {int}, descrição {string} e quantidade {int}',
  async ({ request, testContext }, preco: number, descricao: string, quantidade: number) => {
    const data: ProductData = { nome: newProductName(), preco, descricao, quantidade };
    const res = await request.post(`${BASE_API_URL}/produtos`, {
      data,
      headers: { Authorization: testContext.token! },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as { _id: string };
    testContext.productName = data.nome;
    testContext.productId = body._id;
  },
);

When(
  'registo um produto na API com preço {int}, descrição {string} e quantidade {int}',
  async ({ request, testContext }, preco: number, descricao: string, quantidade: number) => {
    testContext.productName = newProductName();
    const res = await request.post(`${BASE_API_URL}/produtos`, {
      data: { nome: testContext.productName, preco, descricao, quantidade },
      headers: { Authorization: testContext.token! },
    });
    await storeResponse(testContext, res);
  },
);

When(
  'registo na API um produto com o mesmo nome, preço {int}, descrição {string} e quantidade {int}',
  async ({ request, testContext }, preco: number, descricao: string, quantidade: number) => {
    const res = await request.post(`${BASE_API_URL}/produtos`, {
      data: { nome: testContext.productName, preco, descricao, quantidade },
      headers: { Authorization: testContext.token! },
    });
    await storeResponse(testContext, res);
  },
);

When(
  'registo um produto na API com nome {string}, preço {int}, descrição {string} e quantidade {int}',
  async (
    { request, testContext },
    nome: string,
    preco: number,
    descricao: string,
    quantidade: number,
  ) => {
    const res = await request.post(`${BASE_API_URL}/produtos`, {
      data: { nome, preco, descricao, quantidade },
      headers: { Authorization: testContext.token! },
    });
    await storeResponse(testContext, res);
  },
);

When('registo um produto na API sem token de autenticação', async ({ request, testContext }) => {
  const res = await request.post(`${BASE_API_URL}/produtos`, {
    data: { nome: newProductName(), preco: 10, descricao: 'Sem token', quantidade: 1 },
  });
  await storeResponse(testContext, res);
});

When('registo um produto na API com o token desse utilizador', async ({ request, testContext }) => {
  const res = await request.post(`${BASE_API_URL}/produtos`, {
    data: { nome: newProductName(), preco: 10, descricao: 'Não admin', quantidade: 1 },
    headers: { Authorization: testContext.nonAdminToken! },
  });
  await storeResponse(testContext, res);
});

When(
  'listo os produtos na API filtrando pelo nome do produto',
  async ({ request, testContext }) => {
    const res = await request.get(`${BASE_API_URL}/produtos`, {
      params: { nome: testContext.productName! },
    });
    await storeResponse(testContext, res);
  },
);

When('consulto o produto na API pelo seu ID', async ({ request, testContext }) => {
  const res = await request.get(`${BASE_API_URL}/produtos/${testContext.productId}`);
  await storeResponse(testContext, res);
});

Then('a resposta contém o {string} do produto', ({ testContext }, field: string) => {
    expect(requireBody(testContext)[field]).toEqual(expect.any(String));
    expect(requireBody(testContext)[field]).not.toBe('');
});

Then(
  'a lista contém exatamente {int} produto com o nome, preço {int}, descrição {string} e quantidade {int}',
  ({ testContext }, count: number, preco: number, descricao: string, quantidade: number) => {
    const body = requireBody(testContext) as { quantidade: number; produtos: ProductData[] };
    expect(body.quantidade).toBe(count);
    expect(body.produtos).toHaveLength(count);
    expect(body.produtos[0]).toMatchObject({
      nome: testContext.productName,
      preco,
      descricao,
      quantidade,
    });
  },
);

Then(
  'o produto devolvido tem o nome, preço {int}, descrição {string} e quantidade {int}',
  ({ testContext }, preco: number, descricao: string, quantidade: number) => {
    expect(requireBody(testContext)).toMatchObject({
      nome: testContext.productName,
      preco,
      descricao,
      quantidade,
      _id: testContext.productId,
    });
  },
);
