import { Given } from './fixtures';
import {expect} from "@playwright/test";

const BASE_API_URL = 'https://serverest.dev';


Given(
  'estou autenticado como administrador no sistema',
  async ({ loginPage, adminHomePage, testContext }) => {
    const { email, password } = testContext.adminUser!;
    await loginPage.goto();
    await loginPage.login(email, password);
    await adminHomePage.expectToBeOpen();
  },
);

Given(
    'existe um utilizador não administrador autenticado na API',
    async ({ request, testContext }) => {
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
        const body = (await login.json()) as { authorization: string };
        testContext.nonAdminToken = body.authorization;
    },
);
