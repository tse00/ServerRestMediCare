import { expect, Locator, Page } from '@playwright/test';

export class ProductListPage {
  constructor(private readonly page: Page) {}

  async expectToBeOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/admin\/listarprodutos/);
  }

  rowOf(productName: string): Locator {
    return this.page.getByRole('row').filter({ hasText: productName });
  }

  cellsOf(productName: string): Locator {
    return this.rowOf(productName).getByRole('cell');
  }
}
