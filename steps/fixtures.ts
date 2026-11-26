// steps/fixtures.ts
import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage';
import { AdminHomePage } from '../pages/AdminHomePage';
import { RegisterProductPage } from '../pages/RegisterProductPage';
import { ProductListPage } from '../pages/ProductListPage';

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
  loginPage: LoginPage;
  adminHomePage: AdminHomePage;
  registerProductPage: RegisterProductPage;
  productListPage: ProductListPage;
};

export const test = base.extend<CustomFixtures>({
  testContext: async ({}, use) => {
    await use({});
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  adminHomePage: async ({ page }, use) => {
    await use(new AdminHomePage(page));
  },
  registerProductPage: async ({ page }, use) => {
    await use(new RegisterProductPage(page));
  },
  productListPage: async ({ page }, use) => {
    await use(new ProductListPage(page));
  },
});

export const { Given, When, Then, Before, After } = createBdd(test);
