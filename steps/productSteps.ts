import { expect, APIResponse } from '@playwright/test';
import { Given, When, Then, TestContext } from './fixtures';

const BASE_API_URL = 'https://serverest.dev';

const newProductName = (): string => `Produto QA ${Date.now()}_${Math.floor(Math.random() * 1000)}`;

interface ProductData {
    nome: string;
    preco: number;
    descricao: string;
    quantidade: number;
}

async function storeResponse(ctx: TestContext, res: APIResponse): Promise<void> {
    ctx.apiResponse = { status: res.status(), body: await res.json() };
}

function requireBody(ctx: TestContext): Record<string, unknown> {
    if (!ctx.apiResponse) throw new Error('No API response stored.');
    return ctx.apiResponse.body;
}

function productRow(page: import('@playwright/test').Page, name: string) {
    return page.getByRole('row').filter({ hasText: name });
}

// ---------- Background ----------

Given('estou autenticado como administrador no sistema', async ({ page, testContext }) => {
    if (!testContext.adminUser) {
        throw new Error('Admin user was not created before.');
    }

    await page.goto('/login');
    await page.getByTestId('email').fill(testContext.adminUser.email);
    await page.getByTestId('senha').fill(testContext.adminUser.password);
    await page.getByTestId('entrar').click();

    await expect(page).toHaveURL(/.*\/admin\/home/);
});

// ---------- Frontend ----------

When(
    'registo um produto no frontend com preço {string}, descrição {string} e quantidade {string}',
    async ({ page, testContext }, preco: string, descricao: string, quantidade: string) => {
        testContext.productName = newProductName();
        await page.getByTestId('cadastrar-produtos').click();
        await page.getByTestId('nome').fill(testContext.productName);
        await page.getByTestId('preco').fill(preco);
        await page.getByTestId('descricao').fill(descricao);
        await page.getByTestId('quantity').fill(quantidade);
        await page.getByTestId('cadastarProdutos').click();
    },
);

When(
    'registo no frontend um produto com o mesmo nome, preço {string}, descrição {string} e quantidade {string}',
    async ({ page, testContext }, preco: string, descricao: string, quantidade: string) => {
        await page.getByTestId('cadastrar-produtos').click();
        await page.getByTestId('nome').fill(testContext.productName!);
        await page.getByTestId('preco').fill(preco);
        await page.getByTestId('descricao').fill(descricao);
        await page.getByTestId('quantity').fill(quantidade);
        await page.getByTestId('cadastarProdutos').click();
    },
);

When('abro a lista de produtos', async ({ page }) => {
    await page.getByTestId('listar-produtos').click();
});

Then('sou redirecionado para a lista de produtos', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/admin\/listarprodutos/);
});

Then(
    'o produto registado aparece na lista com preço {string}, descrição {string} e quantidade {string}',
    async ({ page, testContext }, preco: string, descricao: string, quantidade: string) => {
        await expect(page).toHaveURL(/.*\/admin\/listarprodutos/);
        const row = productRow(page, testContext.productName!);
        await expect(row).toHaveCount(1);
        const cells = row.getByRole('cell');
        await expect(cells.nth(0)).toHaveText(testContext.productName!);
        await expect(cells.nth(1)).toHaveText(preco);
        await expect(cells.nth(2)).toHaveText(descricao);
        await expect(cells.nth(3)).toHaveText(quantidade);
    },
);

Then('vejo a mensagem de erro {string}', async ({ page }, message: string) => {
    await expect(page.getByText(message)).toBeVisible();
    await expect(page).toHaveURL(/.*\/admin\/cadastrarprodutos/);
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
        const body: { _id: string } = await res.json();
        testContext.productName = data.nome;
        testContext.productId = body._id;
    },
);

Given('existe um utilizador não administrador autenticado na API', async ({ request, testContext }) => {
    const user = {
        nome: 'Standard QA',
        email: `user_${Date.now()}_${Math.floor(Math.random() * 100000)}@qa.com`,
        password: 'Password123',
        administrador: 'false',
    };
    expect((await request.post(`${BASE_API_URL}/usuarios`, { data: user })).ok()).toBeTruthy();
    const login = await request.post(`${BASE_API_URL}/login`, {
        data: { email: user.email, password: user.password },
    });
    expect(login.ok()).toBeTruthy();
    const body: { authorization: string } = await login.json();
    testContext.nonAdminToken = body.authorization;
});

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
    async ({ request, testContext }, nome: string, preco: number, descricao: string, quantidade: number) => {
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

When('listo os produtos na API filtrando pelo nome do produto', async ({ request, testContext }) => {
    const res = await request.get(`${BASE_API_URL}/produtos`, {
        params: { nome: testContext.productName! },
    });
    await storeResponse(testContext, res);
});

When('consulto o produto na API pelo seu ID', async ({ request, testContext }) => {
    const res = await request.get(`${BASE_API_URL}/produtos/${testContext.productId}`);
    await storeResponse(testContext, res);
});

Then('a API responde com o estado {int}', async ({ testContext }, status: number) => {
    expect(testContext.apiResponse?.status).toBe(status);
});

Then('a resposta contém a mensagem {string}', async ({ testContext }, message: string) => {
    expect(requireBody(testContext).message).toBe(message);
});

Then('a resposta contém o {string} do produto', async ({ testContext }, field: string) => {
    expect(requireBody(testContext)[field]).toEqual(expect.any(String));
    expect(requireBody(testContext)[field]).not.toBe('');
});

Then('a resposta contém o erro {string} com {string}', async ({ testContext }, field: string, message: string) => {
    expect(requireBody(testContext)[field]).toBe(message);
});

Then(
    'a lista contém exatamente {int} produto com o nome, preço {int}, descrição {string} e quantidade {int}',
    async ({ testContext }, count: number, preco: number, descricao: string, quantidade: number) => {
        const body = requireBody(testContext) as { quantidade: number; produtos: ProductData[] };
        expect(body.quantidade).toBe(count);
        expect(body.produtos).toHaveLength(count);
        expect(body.produtos[0]).toMatchObject({ nome: testContext.productName, preco, descricao, quantidade });
    },
);

Then(
    'o produto devolvido tem o nome, preço {int}, descrição {string} e quantidade {int}',
    async ({ testContext }, preco: number, descricao: string, quantidade: number) => {
        expect(requireBody(testContext)).toMatchObject({
            nome: testContext.productName,
            preco,
            descricao,
            quantidade,
            _id: testContext.productId,
        });
    },
);
