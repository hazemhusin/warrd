import { count, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { customers, profiles, suppliers, userRoles, users } from './schema.ts';
import { pickPrimaryRole, ROLE_DEFAULT_PERMISSIONS } from './rbac.ts';
import type { AppRole, AuthContext } from './rbac.ts';

const OWNER_ADMIN_EMAIL = 'hazemhussienelmahdy@gmail.com';

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string | null
): Promise<AuthContext> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = displayName?.trim() || cleanEmail.split('@')[0];

    // 1. Sync legacy users table
    await db
      .insert(users)
      .values({
        uid,
        email: cleanEmail,
        displayName: cleanName,
        role: 'customer',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: { email: cleanEmail, displayName: cleanName },
      });

    // 2. Sync profiles table
    const [profile] = await db
      .insert(profiles)
      .values({
        uid,
        email: cleanEmail,
        fullName: cleanName,
      })
      .onConflictDoUpdate({
        target: profiles.uid,
        set: {
          email: cleanEmail,
          updatedAt: new Date(),
        },
      })
      .returning();

    // 3. Link any pending staff/role invitations by email
    await db
      .update(userRoles)
      .set({ profileId: profile.id })
      .where(eq(userRoles.invitedEmail, cleanEmail));

    // 4. Fetch assigned roles
    let assignedRoles = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.profileId, profile.id));

    if (assignedRoles.length === 0) {
      const [{ value: existingSuperAdmins }] = await db
        .select({ value: count() })
        .from(userRoles)
        .where(eq(userRoles.role, 'super_admin'));

      const isBootstrapAdmin =
        cleanEmail === OWNER_ADMIN_EMAIL || existingSuperAdmins === 0;

      const defaultRole: AppRole = isBootstrapAdmin ? 'super_admin' : 'customer';
      const defaultPerms = [...ROLE_DEFAULT_PERMISSIONS[defaultRole]];

      const [insertedRole] = await db
        .insert(userRoles)
        .values({
          profileId: profile.id,
          role: defaultRole,
          permissions: defaultPerms,
        })
        .returning();

      assignedRoles = [insertedRole];
    }

    // Ensure a customer profile exists by default for portal usage
    let [customerRow] = await db
      .select()
      .from(customers)
      .where(eq(customers.profileId, profile.id))
      .limit(1);

    if (!customerRow) {
      [customerRow] = await db
        .insert(customers)
        .values({
          profileId: profile.id,
          companyName: cleanName,
          city: 'Al-Minya',
        })
        .onConflictDoNothing()
        .returning();
      if (!customerRow) {
        [customerRow] = await db
          .select()
          .from(customers)
          .where(eq(customers.profileId, profile.id))
          .limit(1);
      }
    }

    const [supplierRow] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.profileId, profile.id))
      .limit(1);

    const roleSet = new Set<AppRole>();
    const permSet = new Set<string>();

    for (const r of assignedRoles) {
      const typedRole = r.role as AppRole;
      roleSet.add(typedRole);
      const basePerms = ROLE_DEFAULT_PERMISSIONS[typedRole] || [];
      for (const p of basePerms) permSet.add(p);
      if (Array.isArray(r.permissions)) {
        for (const p of r.permissions) permSet.add(p);
      }
    }
    if (supplierRow) {
      roleSet.add('supplier');
    }

    const roles = Array.from(roleSet);
    const primaryRole = pickPrimaryRole(roles);

    return {
      uid: profile.uid,
      email: profile.email,
      profileId: profile.id,
      fullName: profile.fullName,
      roles,
      primaryRole,
      permissions: permSet,
      customerId: customerRow?.id ?? null,
      supplierId: supplierRow?.id ?? null,
      supplierStatus: supplierRow?.status ?? null,
    };
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Failed to sync user account.', { cause: error });
  }
}
