import { describe, it, expect, beforeAll } from 'vitest';
import { createAdminUser, verifyAdminLogin, hasAdminUsers, getAdminById } from './admin-auth';

describe('Admin Authentication', () => {
  const testUsername = 'testadmin_' + Date.now();
  const testPassword = 'testpass123';
  let createdAdminId: number;

  it('should check if admin users exist', async () => {
    const hasAdmins = await hasAdminUsers();
    expect(typeof hasAdmins).toBe('boolean');
  });

  it('should create a new admin user', async () => {
    const admin = await createAdminUser(testUsername, testPassword);
    expect(admin).not.toBeNull();
    expect(admin?.username).toBe(testUsername);
    expect(admin?.id).toBeDefined();
    if (admin) {
      createdAdminId = admin.id;
    }
  });

  it('should verify admin login with correct credentials', async () => {
    const admin = await verifyAdminLogin(testUsername, testPassword);
    expect(admin).not.toBeNull();
    expect(admin?.username).toBe(testUsername);
  });

  it('should reject admin login with incorrect password', async () => {
    const admin = await verifyAdminLogin(testUsername, 'wrongpassword');
    expect(admin).toBeNull();
  });

  it('should reject admin login with non-existent username', async () => {
    const admin = await verifyAdminLogin('nonexistent', testPassword);
    expect(admin).toBeNull();
  });

  it('should get admin by ID', async () => {
    if (createdAdminId) {
      const admin = await getAdminById(createdAdminId);
      expect(admin).not.toBeNull();
      expect(admin?.username).toBe(testUsername);
    }
  });

  it('should return null for non-existent admin ID', async () => {
    const admin = await getAdminById(999999);
    expect(admin).toBeNull();
  });
});
