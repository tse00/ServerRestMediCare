import { expect } from '@playwright/test';
import { Then } from './fixtures';
import { requireBody } from '../support/apiHelpers';

Then('a API responde com o estado {int}', ({ testContext }, status: number) => {
    expect(testContext.apiResponse?.status).toBe(status);
});

Then('a resposta contém a mensagem {string}', ({ testContext }, message: string) => {
    expect(requireBody(testContext).message).toBe(message);
});

Then('a resposta contém o erro {string} com {string}', ({ testContext }, field: string, message: string) => {
    expect(requireBody(testContext)[field]).toBe(message);
});