import { expect, Locator, Page } from '@playwright/test';

export interface ProductForm {
  name: string;
  price: string;
  description: string;
  quantity: string;
}

export class RegisterProductPage {
  readonly nameInput: Locator;
  readonly priceInput: Locator;
  readonly descriptionInput: Locator;
  readonly quantityInput: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.nameInput = page.getByTestId('nome');
    this.priceInput = page.getByTestId('preco');
    this.descriptionInput = page.getByTestId('descricao');
    this.quantityInput = page.getByTestId('quantity');
    this.submitButton = page.getByTestId('cadastarProdutos');
  }

  async expectToBeOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/admin\/cadastrarprodutos/);
  }

  async registerProduct(product: ProductForm): Promise<void> {
    await this.nameInput.fill(product.name);
    await this.priceInput.fill(product.price);
    await this.descriptionInput.fill(product.description);
    await this.quantityInput.fill(product.quantity);
    await this.submitButton.click();
  }

  message(text: string): Locator {
    return this.page.getByText(text);
  }
}
