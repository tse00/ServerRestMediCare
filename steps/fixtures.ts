// steps/fixtures.ts
import { test as base, createBdd } from 'playwright-bdd';

export interface AdminUser {
    nome: string;
    email: string;
    password: string;
    administrador: 'true' | 'false';
}

export interface TestContext {
    adminUser?: AdminUser;
    token?: string;
    nonAdminToken?: string;
    productName?: string;
    productId?: string;
    apiResponse?: { status: number; body: Record<string, unknown> };
}

type CustomFixtures = {
    testContext: TestContext;
};

export const test = base.extend<CustomFixtures>({
    testContext: async ({}, use) => {
        await use({});
    },
});

export const { Given, When, Then, Before, After } = createBdd(test);
