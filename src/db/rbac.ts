export type AppRole = 'customer' | 'supplier' | 'staff' | 'admin' | 'super_admin';

export const ALL_PERMISSIONS = [
  'manage_suppliers',
  'review_products',
  'manage_quotes',
  'manage_shipments',
  'edit_content',
  'manage_staff',
  'view_analytics',
  'manage_settings',
  'view_audit',
  'manage_inquiries',
  'export_csv',
] as const;

export type AppPermission = (typeof ALL_PERMISSIONS)[number];

export const ROLE_DEFAULT_PERMISSIONS: Record<AppRole, readonly AppPermission[]> = {
  customer: [],
  supplier: [],
  staff: ['manage_quotes', 'manage_shipments', 'manage_inquiries', 'export_csv'],
  admin: [
    'manage_suppliers',
    'review_products',
    'manage_quotes',
    'manage_shipments',
    'edit_content',
    'view_analytics',
    'view_audit',
    'manage_inquiries',
    'export_csv',
  ],
  super_admin: ALL_PERMISSIONS,
};

export interface AuthContext {
  uid: string;
  email: string;
  profileId: number;
  fullName: string;
  roles: AppRole[];
  primaryRole: AppRole;
  permissions: Set<string>;
  customerId: number | null;
  supplierId: number | null;
  supplierStatus: string | null;
}

/**
 * Declarative Row-Level Access Policy Matrix (enforced across all Express API routes & queries)
 * Every table has explicit read/write scoping rules matching RLS security guarantees.
 */
export const TABLE_ACCESS_POLICIES = {
  profiles: {
    select: 'own_row_or_admin',
    insert: 'authenticated_self',
    update: 'own_row_or_super_admin',
  },
  user_roles: {
    select: 'own_roles_or_admin',
    insert: 'super_admin_only',
    update: 'super_admin_only',
    delete: 'super_admin_only',
  },
  customers: {
    select: 'own_customer_or_staff_admin',
    insert: 'authenticated_self',
    update: 'own_customer_or_admin',
  },
  suppliers: {
    select: 'approved_public_or_own_or_admin',
    insert: 'authenticated_self',
    update: 'own_supplier_non_status_or_admin',
  },
  products: {
    select: 'approved_public_or_own_supplier_or_admin',
    insert: 'approved_supplier_pending_or_admin',
    update: 'own_supplier_or_admin_review',
    delete: 'own_supplier_or_admin',
  },
  product_images: {
    select: 'approved_product_public_or_owner_or_admin',
    insert: 'own_product_supplier_or_admin',
    delete: 'own_product_supplier_or_admin',
  },
  quote_requests: {
    select: 'own_customer_or_assigned_supplier_or_staff_admin',
    insert: 'public_or_authenticated',
    update: 'staff_admin_only',
  },
  quote_messages: {
    select: 'quote_participants_non_internal_or_staff_admin',
    insert: 'quote_participants_or_staff_admin',
  },
  shipments: {
    select: 'exact_tracking_public_or_own_customer_or_staff_admin',
    insert: 'staff_admin_only',
    update: 'staff_admin_only',
    delete: 'admin_only',
  },
  shipment_events: {
    select: 'parent_shipment_access',
    insert: 'staff_admin_only',
  },
  documents: {
    select: 'owner_or_quote_shipment_participant_or_staff_admin',
    insert: 'authenticated_owner_or_staff_admin',
    delete: 'owner_unverified_or_admin',
  },
  notifications: {
    select: 'recipient_profile_only',
    update: 'recipient_profile_mark_read',
  },
  events: {
    select: 'admin_analytics_only',
    insert: 'public_respecting_opt_out',
  },
  audit_log: {
    select: 'admin_with_view_audit_only',
    insert: 'server_immutable_append_only',
  },
  site_content: {
    select: 'public_read',
    update: 'admin_with_edit_content_only',
  },
  inquiries: {
    select: 'staff_admin_only',
    insert: 'public_read_write_submission',
    update: 'staff_admin_only',
  },
  site_settings: {
    select: 'public_non_secret_or_admin',
    update: 'admin_with_manage_settings_only',
  },
} as const;

export function hasAnyRole(ctx: AuthContext | undefined, allowed: AppRole[]): boolean {
  if (!ctx) return false;
  return ctx.roles.some((r) => allowed.includes(r));
}

export function isStaffOrAdmin(ctx: AuthContext | undefined): boolean {
  return hasAnyRole(ctx, ['staff', 'admin', 'super_admin']);
}

export function hasPermission(ctx: AuthContext | undefined, perm: AppPermission): boolean {
  if (!ctx) return false;
  if (ctx.roles.includes('super_admin')) return true;
  return ctx.permissions.has(perm);
}

export function pickPrimaryRole(roles: AppRole[]): AppRole {
  const priority: AppRole[] = ['super_admin', 'admin', 'staff', 'supplier', 'customer'];
  for (const role of priority) {
    if (roles.includes(role)) return role;
  }
  return 'customer';
}
