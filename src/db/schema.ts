import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Core Auth Sync Table (Cloud SQL + Firebase Auth bridge)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('customer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 1. User Profiles
export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  preferredLang: text('preferred_lang').notNull().default('ar'),
  analyticsOptOut: boolean('analytics_opt_out').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  isDemo: boolean('is_demo').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Role & Permission Assignments (RBAC)
export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id').references(() => profiles.id, { onDelete: 'cascade' }),
  invitedEmail: text('invited_email'),
  role: text('role').notNull().default('customer'), // 'customer' | 'supplier' | 'staff' | 'admin' | 'super_admin'
  permissions: jsonb('permissions').$type<string[]>().notNull().default([]),
  invitedBy: integer('invited_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Customers
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  companyName: text('company_name'),
  taxId: text('tax_id'),
  commercialReg: text('commercial_reg'),
  city: text('city').default('Al-Minya'),
  address: text('address'),
  accountType: text('account_type').notNull().default('importer'), // 'importer' | 'factory' | 'trader' | 'ecommerce'
  isDemo: boolean('is_demo').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Suppliers
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  companyName: text('company_name').notNull(),
  contactPerson: text('contact_person').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  country: text('country').notNull().default('Egypt'),
  city: text('city').notNull().default('Al-Minya'),
  specialties: text('specialties').notNull(),
  taxId: text('tax_id'),
  commercialReg: text('commercial_reg'),
  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected' | 'suspended'
  statusReason: text('status_reason'),
  reviewedBy: integer('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  isDemo: boolean('is_demo').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Products Catalog (with supplier ownership & review workflow)
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  sku: text('sku').notNull().unique(),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  category: text('category').notNull(),
  sizeLabel: text('size_label').notNull(),
  sizeGroup: text('size_group').notNull(),
  thicknessMicrons: integer('thickness_microns').notNull().default(60),
  minOrderQty: integer('min_order_qty').notNull().default(100),
  unitPriceEgp: integer('unit_price_egp'),
  useCasesAr: text('use_cases_ar').notNull(),
  useCasesEn: text('use_cases_en').notNull(),
  descriptionAr: text('description_ar').notNull(),
  descriptionEn: text('description_en').notNull(),
  imageUrl: text('image_url').notNull(),
  inStock: boolean('in_stock').notNull().default(true),
  approvalStatus: text('approval_status').notNull().default('approved'), // 'pending_review' | 'approved' | 'rejected' | 'changes_requested'
  rejectionReason: text('rejection_reason'),
  isDemo: boolean('is_demo').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Product Gallery Images
export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  imageUrl: text('image_url').notNull(),
  altAr: text('alt_ar'),
  altEn: text('alt_en'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Quote Requests
export const quoteRequests = pgTable('quote_requests', {
  id: serial('id').primaryKey(),
  referenceCode: text('reference_code').notNull().unique(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  profileId: integer('profile_id').references(() => profiles.id, { onDelete: 'set null' }),
  assignedSupplierId: integer('assigned_supplier_id').references(() => suppliers.id, {
    onDelete: 'set null',
  }),
  serviceType: text('service_type').notNull(),
  goodsDescription: text('goods_description').notNull(),
  originCountry: text('origin_country').notNull(),
  portOfEntry: text('port_of_entry').notNull(),
  quantity: text('quantity').notNull(),
  contactName: text('contact_name').notNull(),
  companyName: text('company_name'),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  notes: text('notes'),
  attachmentName: text('attachment_name'),
  attachmentMime: text('attachment_mime'),
  attachmentData: text('attachment_data'),
  quotedPriceEgp: integer('quoted_price_egp'),
  quotedCurrency: text('quoted_currency').default('EGP'),
  validUntil: text('valid_until'),
  status: text('status').notNull().default('new'), // 'new' | 'reviewing' | 'quoted' | 'approved' | 'closed'
  emailNotificationStatus: text('email_notification_status').notNull().default('queued'),
  isDemo: boolean('is_demo').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. Quote Conversation Messages
export const quoteMessages = pgTable('quote_messages', {
  id: serial('id').primaryKey(),
  quoteId: integer('quote_id')
    .references(() => quoteRequests.id, { onDelete: 'cascade' })
    .notNull(),
  senderProfileId: integer('sender_profile_id').references(() => profiles.id, {
    onDelete: 'set null',
  }),
  senderRole: text('sender_role').notNull(),
  senderName: text('sender_name').notNull(),
  message: text('message').notNull(),
  isInternal: boolean('is_internal').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Shipments
export const shipments = pgTable('shipments', {
  id: serial('id').primaryKey(),
  trackingNumber: text('tracking_number').notNull().unique(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  quoteId: integer('quote_id').references(() => quoteRequests.id, { onDelete: 'set null' }),
  clientName: text('client_name').notNull(),
  clientPhone: text('client_phone'),
  originCountry: text('origin_country').notNull(),
  port: text('port').notNull(),
  destination: text('destination').notNull(),
  cargoTypeAr: text('cargo_type_ar').notNull(),
  cargoTypeEn: text('cargo_type_en').notNull(),
  containerOrBill: text('container_or_bill'),
  acidNumber: text('acid_number'),
  status: text('status').notNull().default('documents_received'), // 'documents_received' | 'under_clearance' | 'released' | 'delivered'
  notesAr: text('notes_ar'),
  notesEn: text('notes_en'),
  estimatedDelivery: text('estimated_delivery'),
  isDemo: boolean('is_demo').notNull().default(false),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Shipment Timeline Events
export const shipmentEvents = pgTable('shipment_events', {
  id: serial('id').primaryKey(),
  shipmentId: integer('shipment_id')
    .references(() => shipments.id, { onDelete: 'cascade' })
    .notNull(),
  status: text('status').notNull(),
  location: text('location'),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  descriptionAr: text('description_ar'),
  descriptionEn: text('description_en'),
  createdBy: integer('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 11. Documents Vault
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  ownerProfileId: integer('owner_profile_id').references(() => profiles.id, {
    onDelete: 'set null',
  }),
  quoteId: integer('quote_id').references(() => quoteRequests.id, { onDelete: 'cascade' }),
  shipmentId: integer('shipment_id').references(() => shipments.id, { onDelete: 'cascade' }),
  supplierId: integer('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }),
  docType: text('doc_type').notNull(), // 'invoice' | 'packing_list' | 'bill_of_lading' | 'certificate_of_origin' | 'acid_doc' | 'license' | 'other'
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull().default(0),
  fileData: text('file_data').notNull(),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  recipientProfileId: integer('recipient_profile_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type').notNull(),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  bodyAr: text('body_ar').notNull(),
  bodyEn: text('body_en').notNull(),
  linkPath: text('link_path'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. First-Party Analytics Events
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => profiles.id, { onDelete: 'set null' }),
  sessionId: text('session_id').notNull(),
  eventType: text('event_type').notNull(), // 'page_view' | 'click' | 'form_submit' | 'login' | 'quote_started' | 'quote_submitted' | 'product_view'
  pagePath: text('page_path').notNull(),
  referrer: text('referrer'),
  device: text('device').default('desktop'),
  country: text('country').default('EG'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 14. Immutable Audit Log
export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  actorProfileId: integer('actor_profile_id').references(() => profiles.id, {
    onDelete: 'set null',
  }),
  actorEmail: text('actor_email').notNull(),
  actorRole: text('actor_role').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  beforeState: jsonb('before_state').$type<Record<string, unknown> | null>(),
  afterState: jsonb('after_state').$type<Record<string, unknown> | null>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 15. CMS Site Content (FAQ, Testimonials, Services Text, Homepage Stats)
export const siteContent = pgTable('site_content', {
  id: serial('id').primaryKey(),
  sectionKey: text('section_key').notNull().unique(),
  contentAr: jsonb('content_ar').$type<unknown>().notNull(),
  contentEn: jsonb('content_en').$type<unknown>().notNull(),
  updatedBy: integer('updated_by').references(() => profiles.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 16. Customer & Public Inquiries Inbox
export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('new'), // 'new' | 'in_progress' | 'resolved'
  assignedTo: integer('assigned_to').references(() => profiles.id, { onDelete: 'set null' }),
  replyNote: text('reply_note'),
  isDemo: boolean('is_demo').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Legacy Contact Messages (preserved for backward compatibility)
export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 17. Platform Settings (Company info, WhatsApp, Email templates, Notification preferences)
export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  settingKey: text('setting_key').notNull().unique(),
  value: jsonb('value').$type<Record<string, unknown>>().notNull(),
  updatedBy: integer('updated_by').references(() => profiles.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Drizzle Relations
export const profilesRelations = relations(profiles, ({ one, many }) => ({
  roles: many(userRoles),
  customer: one(customers, { fields: [profiles.id], references: [customers.profileId] }),
  supplier: one(suppliers, { fields: [profiles.id], references: [suppliers.profileId] }),
  notifications: many(notifications),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  profile: one(profiles, { fields: [userRoles.profileId], references: [profiles.id] }),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  profile: one(profiles, { fields: [suppliers.profileId], references: [profiles.id] }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  supplier: one(suppliers, { fields: [products.supplierId], references: [suppliers.id] }),
  images: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const quoteRequestsRelations = relations(quoteRequests, ({ one, many }) => ({
  customer: one(customers, { fields: [quoteRequests.customerId], references: [customers.id] }),
  supplier: one(suppliers, {
    fields: [quoteRequests.assignedSupplierId],
    references: [suppliers.id],
  }),
  messages: many(quoteMessages),
  documents: many(documents),
}));

export const quoteMessagesRelations = relations(quoteMessages, ({ one }) => ({
  quote: one(quoteRequests, { fields: [quoteMessages.quoteId], references: [quoteRequests.id] }),
}));

export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
  customer: one(customers, { fields: [shipments.customerId], references: [customers.id] }),
  events: many(shipmentEvents),
  documents: many(documents),
}));

export const shipmentEventsRelations = relations(shipmentEvents, ({ one }) => ({
  shipment: one(shipments, { fields: [shipmentEvents.shipmentId], references: [shipments.id] }),
}));
