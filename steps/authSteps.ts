import { Given } from './fixtures';

Given(
  'estou autenticado como administrador no sistema',
  async ({ loginPage, adminHomePage, testContext }) => {
    const { email, password } = testContext.adminUser!;
    await loginPage.goto();
    await loginPage.login(email, password);
    await adminHomePage.expectToBeOpen();
  },
);
