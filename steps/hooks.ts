import { expect } from '@playwright/test';
import { Before, AdminUser } from './fixtures';

const BASE_API_URL = 'https://serverest.dev';

Before(async ({ request, testContext }) => {
    const adminUser: AdminUser = {
        nome: 'Admin QA',
        email: `admin_${Date.now()}_${Math.floor(Math.random() * 100000)}@qa.com`,
        password: 'Password123',
        administrador: 'true',
    };

    // User registration
    const registerRes = await request.post(`${BASE_API_URL}/usuarios`, {
        data: adminUser,
    });

    const registerBody: { message: string; _id?: string } = await registerRes.json();

    if (registerRes.status() === 400) {
      console.log(`Admin already exists: ${adminUser.email} (${registerBody.message})`);
    } else {
        console.log(`Admin registered: ${adminUser.email} (${registerBody._id})`);
    }

    expect(registerRes.ok()).toBeTruthy();

    // User login
    const loginRes = await request.post(`${BASE_API_URL}/login`, {
        data: {
            email: adminUser.email,
            password: adminUser.password,
        },
    });
    expect(loginRes.ok()).toBeTruthy();

    const loginBody: { message: string; authorization: string } = await loginRes.json();

    // Save login details
    testContext.adminUser = adminUser;
    testContext.token = loginBody.authorization;
});
