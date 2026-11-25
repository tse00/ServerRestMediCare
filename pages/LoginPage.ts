import { Locator, Page } from '@playwright/test';

export class LoginPage {
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;

    constructor(private readonly page: Page) {
        this.emailInput = page.getByTestId('email');
        this.passwordInput = page.getByTestId('senha');
        this.loginButton = page.getByTestId('entrar');
    }

    async goto(): Promise<void> {
        await this.page.goto('/login');
    }

    async login(email: string, password: string): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}
