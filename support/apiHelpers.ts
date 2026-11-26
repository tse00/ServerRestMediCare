import type { APIResponse } from '@playwright/test';
import type { TestContext } from '../steps/fixtures';

export const BASE_API_URL = 'https://serverest.dev';

export async function storeResponse(ctx: TestContext, res: APIResponse): Promise<void> {
    ctx.apiResponse = { status: res.status(), body: (await res.json()) as Record<string, unknown> };
}

export function requireBody(ctx: TestContext): Record<string, unknown> {
    if (!ctx.apiResponse) throw new Error('No API response stored.');
    return ctx.apiResponse.body;
}