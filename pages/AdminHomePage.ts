import { expect, Locator, Page } from '@playwright/test';

export class AdminHomePage {
  readonly registerProductLink: Locator;
  readonly listProductsLink: Locator;

  constructor(private readonly page: Page) {
    this.registerProductLink = page.getByTestId('cadastrar-produtos');
    this.listProductsLink = page.getByTestId('listar-produtos');
  }

  async expectToBeOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/admin\/home/);
  }

  async openRegisterProduct(): Promise<void> {
    await this.registerProductLink.click();
  }

  async openProductList(): Promise<void> {
    await this.listProductsLink.click();
  }
}
