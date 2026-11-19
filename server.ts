import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { and, desc, eq } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import { contactMessages, products, quoteRequests, shipments } from './src/db/schema.ts';
import { ensureSeeded } from './src/db/seed.ts';
import { requireAuth, requireRole } from './src/middleware/auth.ts';
import type { AuthRequest } from './src/middleware/auth.ts';

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

async function sendQuoteEmailNotification(quote: {
  referenceCode: string;
  serviceType: string;
  contactName: string;
  companyName: string | null;
  phone: string;
  email: string;
  originCountry: string;
  portOfEntry: string;
  quantity: string;
  goodsDescription: string;
}): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.NOTIFY_EMAIL || 'info@wardly.eg';
  const fromEmail = process.env.EMAIL_FROM || 'Wardly <onboarding@resend.dev>';

  if (!apiKey) {
    return 'logged_no_smtp';
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `[Wardly Quote ${quote.referenceCode}] ${quote.serviceType} - ${quote.contactName}`,
        html: `
          <h2>New Wardly Quote Request (${quote.referenceCode})</h2>
          <p><strong>Service:</strong> ${quote.serviceType}</p>
          <p><strong>Client:</strong> ${quote.contactName} (${quote.companyName || 'Individual'})</p>
          <p><strong>Phone:</strong> ${quote.phone}</p>
          <p><strong>Email:</strong> ${quote.email}</p>
          <p><strong>Origin:</strong> ${quote.originCountry}</p>
          <p><strong>Port:</strong> ${quote.portOfEntry}</p>
          <p><strong>Quantity:</strong> ${quote.quantity}</p>
          <p><strong>Goods:</strong> ${quote.goodsDescription}</p>
        `,
      }),
    });

    if (!response.ok) {
      console.error('Resend API returned status:', response.status);
      return 'failed';
    }
    return 'sent';
  } catch (err) {
    console.error('Email notification dispatch error:', err);
    return 'failed';
  }
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Current authenticated user's profile & RBAC roles/permissions
app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
  if (!req.authContext) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({
    ...req.authContext,
    permissions: Array.from(req.authContext.permissions),
  });
});

// Public Products Catalog (approved items only)
app.get('/api/products', async (req, res) => {
  try {
    await ensureSeeded();
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.approvalStatus, 'approved')))
      .orderBy(products.id);
    const { category, sizeGroup, q } = req.query;

    const filtered = rows.filter((item) => {
      if (category && category !== 'all' && item.category !== String(category)) {
        return false;
      }
      if (sizeGroup && sizeGroup !== 'all' && item.sizeGroup !== String(sizeGroup)) {
        return false;
      }
      if (q && String(q).trim()) {
        const needle = String(q).trim().toLowerCase();
        const hay = `${item.nameAr} ${item.nameEn} ${item.sku} ${item.useCasesAr} ${item.useCasesEn}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });

    res.json(filtered);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ error: 'Unable to load products catalog.' });
  }
});

// Public Shipment Tracking Lookup
app.get('/api/shipments/track/:trackingNumber', async (req, res) => {
  try {
    await ensureSeeded();
    const rawCode = String(req.params.trackingNumber || '').trim().toUpperCase();
    if (!rawCode) {
      return res.status(400).json({ error: 'Tracking number is required.' });
    }

    const rows = await db
      .select()
      .from(shipments)
      .where(eq(shipments.trackingNumber, rawCode))
      .limit(1);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Shipment not found.' });
    }

    const s = rows[0];
    res.json({
      trackingNumber: s.trackingNumber,
      originCountry: s.originCountry,
      port: s.port,
      destination: s.destination,
      cargoTypeAr: s.cargoTypeAr,
      cargoTypeEn: s.cargoTypeEn,
      containerOrBill: s.containerOrBill,
      status: s.status,
      notesAr: s.notesAr,
      notesEn: s.notesEn,
      estimatedDelivery: s.estimatedDelivery,
      updatedAt: s.updatedAt,
    });
  } catch (error) {
    console.error('Failed to track shipment:', error);
    res.status(500).json({ error: 'Unable to look up shipment right now.' });
  }
});

// Public Quote Request Submission (with optional file attachment)
app.post('/api/quotes', upload.single('attachment'), async (req, res) => {
  try {
    await ensureSeeded();
    const body = req.body || {};
    const serviceType = String(body.serviceType || '').trim();
    const goodsDescription = String(body.goodsDescription || '').trim();
    const originCountry = String(body.originCountry || '').trim();
    const portOfEntry = String(body.portOfEntry || '').trim();
    const quantity = String(body.quantity || '').trim();
    const contactName = String(body.contactName || '').trim();
    const companyName = body.companyName ? String(body.companyName).trim() : null;
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const notes = body.notes ? String(body.notes).trim() : null;

    if (!serviceType || !goodsDescription || !originCountry || !portOfEntry || !quantity || !contactName || !phone || !email) {
      return res.status(400).json({ error: 'Please complete all required quote fields.' });
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `WRD-Q-${randomDigits}`;

    let attachmentName: string | null = null;
    let attachmentMime: string | null = null;
    let attachmentData: string | null = null;

    if (req.file) {
      attachmentName = req.file.originalname.slice(0, 160);
      attachmentMime = req.file.mimetype;
      attachmentData = req.file.buffer.toString('base64');
    }

    const emailStatus = await sendQuoteEmailNotification({
      referenceCode,
      serviceType,
      contactName,
      companyName,
      phone,
      email,
      originCountry,
      portOfEntry,
      quantity,
      goodsDescription,
    });

    const [created] = await db
      .insert(quoteRequests)
      .values({
        referenceCode,
        serviceType,
        goodsDescription,
        originCountry,
        portOfEntry,
        quantity,
        contactName,
        companyName,
        phone,
        email,
        notes,
        attachmentName,
        attachmentMime,
        attachmentData,
        status: 'new',
        emailNotificationStatus: emailStatus,
      })
      .returning({
        id: quoteRequests.id,
        referenceCode: quoteRequests.referenceCode,
        status: quoteRequests.status,
        emailNotificationStatus: quoteRequests.emailNotificationStatus,
        createdAt: quoteRequests.createdAt,
      });

    res.status(201).json(created);
  } catch (error) {
    console.error('Failed to submit quote request:', error);
    res.status(500).json({ error: 'Failed to submit quote request. Please try again.' });
  }
});

// Public Contact Form Submission
app.post('/api/contact', async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = body.email ? String(body.email).trim() : null;
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();

    if (!name || !phone || !subject || !message) {
      return res.status(400).json({ error: 'Please fill in name, phone, subject, and message.' });
    }

    const [created] = await db
      .insert(contactMessages)
      .values({ name, phone, email, subject, message })
      .returning();

    res.status(201).json({ id: created.id, createdAt: created.createdAt });
  } catch (error) {
    console.error('Failed to save contact message:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// Admin Overview & Management Routes (Protected via Firebase ID Token + RBAC Roles)
app.use('/api/admin', requireAuth, requireRole('staff', 'admin', 'super_admin'));

app.get('/api/admin/overview', requireAuth, async (req: AuthRequest, res) => {
  try {
    await ensureSeeded();
    const [allQuotes, allShipments, allProducts, allMessages] = await Promise.all([
      db.select({ id: quoteRequests.id, status: quoteRequests.status }).from(quoteRequests),
      db.select({ id: shipments.id, status: shipments.status }).from(shipments),
      db.select({ id: products.id, inStock: products.inStock }).from(products),
      db.select({ id: contactMessages.id }).from(contactMessages),
    ]);

    res.json({
      adminEmail: req.user?.email || '',
      newQuotes: allQuotes.filter((q) => q.status === 'new').length,
      totalQuotes: allQuotes.length,
      activeShipments: allShipments.filter((s) => s.status !== 'delivered').length,
      deliveredShipments: allShipments.filter((s) => s.status === 'delivered').length,
      totalProducts: allProducts.length,
      totalMessages: allMessages.length,
    });
  } catch (error) {
    console.error('Admin overview failed:', error);
    res.status(500).json({ error: 'Unable to load overview.' });
  }
});

app.get('/api/admin/quotes', requireAuth, async (_req, res) => {
  try {
    await ensureSeeded();
    const rows = await db
      .select({
        id: quoteRequests.id,
        referenceCode: quoteRequests.referenceCode,
        serviceType: quoteRequests.serviceType,
        goodsDescription: quoteRequests.goodsDescription,
        originCountry: quoteRequests.originCountry,
        portOfEntry: quoteRequests.portOfEntry,
        quantity: quoteRequests.quantity,
        contactName: quoteRequests.contactName,
        companyName: quoteRequests.companyName,
        phone: quoteRequests.phone,
        email: quoteRequests.email,
        notes: quoteRequests.notes,
        attachmentName: quoteRequests.attachmentName,
        status: quoteRequests.status,
        emailNotificationStatus: quoteRequests.emailNotificationStatus,
        createdAt: quoteRequests.createdAt,
      })
      .from(quoteRequests)
      .orderBy(desc(quoteRequests.createdAt));

    res.json(rows);
  } catch (error) {
    console.error('Failed to list admin quotes:', error);
    res.status(500).json({ error: 'Unable to load quote requests.' });
  }
});

app.patch('/api/admin/quotes/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = String(req.body?.status || '').trim();
    const allowed = ['new', 'reviewing', 'quoted', 'approved', 'closed'];
    if (!Number.isInteger(id) || !allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid quote status update.' });
    }

    const [updated] = await db
      .update(quoteRequests)
      .set({ status })
      .where(eq(quoteRequests.id, id))
      .returning({
        id: quoteRequests.id,
        referenceCode: quoteRequests.referenceCode,
        status: quoteRequests.status,
      });

    if (!updated) {
      return res.status(404).json({ error: 'Quote request not found.' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Failed to update quote:', error);
    res.status(500).json({ error: 'Failed to update quote status.' });
  }
});

app.get('/api/admin/quotes/:id/attachment', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid ID.' });
    }

    const rows = await db
      .select({
        attachmentName: quoteRequests.attachmentName,
        attachmentMime: quoteRequests.attachmentMime,
        attachmentData: quoteRequests.attachmentData,
      })
      .from(quoteRequests)
      .where(eq(quoteRequests.id, id))
      .limit(1);

    if (!rows.length || !rows[0].attachmentData) {
      return res.status(404).json({ error: 'Attachment not found.' });
    }

    const fileBuffer = Buffer.from(rows[0].attachmentData, 'base64');
    res.setHeader('Content-Type', rows[0].attachmentMime || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(rows[0].attachmentName || 'document')}"`
    );
    res.send(fileBuffer);
  } catch (error) {
    console.error('Attachment download failed:', error);
    res.status(500).json({ error: 'Failed to download attachment.' });
  }
});

app.get('/api/admin/shipments', requireAuth, async (_req, res) => {
  try {
    await ensureSeeded();
    const rows = await db.select().from(shipments).orderBy(desc(shipments.updatedAt));
    res.json(rows);
  } catch (error) {
    console.error('Failed to list shipments:', error);
    res.status(500).json({ error: 'Unable to load shipments.' });
  }
});

app.post('/api/admin/shipments', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    const trackingNumber = String(b.trackingNumber || '').trim().toUpperCase();
    const clientName = String(b.clientName || '').trim();
    const originCountry = String(b.originCountry || '').trim();
    const port = String(b.port || '').trim();
    const destination = String(b.destination || '').trim();
    const cargoTypeAr = String(b.cargoTypeAr || '').trim();
    const cargoTypeEn = String(b.cargoTypeEn || '').trim();
    const status = String(b.status || 'documents_received').trim();

    if (!trackingNumber || !clientName || !originCountry || !port || !destination || !cargoTypeAr || !cargoTypeEn) {
      return res.status(400).json({ error: 'Missing required shipment fields.' });
    }

    const [created] = await db
      .insert(shipments)
      .values({
        trackingNumber,
        clientName,
        clientPhone: b.clientPhone ? String(b.clientPhone).trim() : null,
        originCountry,
        port,
        destination,
        cargoTypeAr,
        cargoTypeEn,
        containerOrBill: b.containerOrBill ? String(b.containerOrBill).trim() : null,
        status,
        notesAr: b.notesAr ? String(b.notesAr).trim() : null,
        notesEn: b.notesEn ? String(b.notesEn).trim() : null,
        estimatedDelivery: b.estimatedDelivery ? String(b.estimatedDelivery).trim() : null,
      })
      .returning();

    res.status(201).json(created);
  } catch (error) {
    console.error('Failed to create shipment:', error);
    res.status(500).json({ error: 'Failed to create shipment (tracking number may already exist).' });
  }
});

app.patch('/api/admin/shipments/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid shipment ID.' });
    }

    const b = req.body || {};
    const [updated] = await db
      .update(shipments)
      .set({
        ...(b.trackingNumber ? { trackingNumber: String(b.trackingNumber).trim().toUpperCase() } : {}),
        ...(b.clientName ? { clientName: String(b.clientName).trim() } : {}),
        ...(b.clientPhone !== undefined ? { clientPhone: b.clientPhone ? String(b.clientPhone).trim() : null } : {}),
        ...(b.originCountry ? { originCountry: String(b.originCountry).trim() } : {}),
        ...(b.port ? { port: String(b.port).trim() } : {}),
        ...(b.destination ? { destination: String(b.destination).trim() } : {}),
        ...(b.cargoTypeAr ? { cargoTypeAr: String(b.cargoTypeAr).trim() } : {}),
        ...(b.cargoTypeEn ? { cargoTypeEn: String(b.cargoTypeEn).trim() } : {}),
        ...(b.containerOrBill !== undefined ? { containerOrBill: b.containerOrBill ? String(b.containerOrBill).trim() : null } : {}),
        ...(b.status ? { status: String(b.status).trim() } : {}),
        ...(b.notesAr !== undefined ? { notesAr: b.notesAr ? String(b.notesAr).trim() : null } : {}),
        ...(b.notesEn !== undefined ? { notesEn: b.notesEn ? String(b.notesEn).trim() : null } : {}),
        ...(b.estimatedDelivery !== undefined ? { estimatedDelivery: b.estimatedDelivery ? String(b.estimatedDelivery).trim() : null } : {}),
        updatedAt: new Date(),
      })
      .where(eq(shipments.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Shipment not found.' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Failed to update shipment:', error);
    res.status(500).json({ error: 'Failed to update shipment.' });
  }
});

app.delete('/api/admin/shipments/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid shipment ID.' });
    }
    await db.delete(shipments).where(eq(shipments.id, id));
    res.json({ deleted: true });
  } catch (error) {
    console.error('Failed to delete shipment:', error);
    res.status(500).json({ error: 'Failed to delete shipment.' });
  }
});

app.post('/api/admin/products', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    const sku = String(b.sku || '').trim().toUpperCase();
    const nameAr = String(b.nameAr || '').trim();
    const nameEn = String(b.nameEn || '').trim();
    const category = String(b.category || 'fragile').trim();
    const sizeLabel = String(b.sizeLabel || '').trim();
    const sizeGroup = String(b.sizeGroup || 'medium').trim();
    const thicknessMicrons = Number(b.thicknessMicrons || 65);
    const useCasesAr = String(b.useCasesAr || '').trim();
    const useCasesEn = String(b.useCasesEn || '').trim();
    const descriptionAr = String(b.descriptionAr || '').trim();
    const descriptionEn = String(b.descriptionEn || '').trim();
    const imageUrl = String(b.imageUrl || '/src/assets/images/product_air_column_bags_1795089455256.jpg').trim();
    const inStock = b.inStock !== false;

    if (!sku || !nameAr || !nameEn || !sizeLabel || !useCasesAr || !useCasesEn) {
      return res.status(400).json({ error: 'Missing required product fields.' });
    }

    const [created] = await db
      .insert(products)
      .values({
        sku,
        nameAr,
        nameEn,
        category,
        sizeLabel,
        sizeGroup,
        thicknessMicrons,
        useCasesAr,
        useCasesEn,
        descriptionAr: descriptionAr || useCasesAr,
        descriptionEn: descriptionEn || useCasesEn,
        imageUrl,
        inStock,
      })
      .returning();

    res.status(201).json(created);
  } catch (error) {
    console.error('Failed to create product:', error);
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

app.patch('/api/admin/products/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }

    const b = req.body || {};
    const [updated] = await db
      .update(products)
      .set({
        ...(b.sku ? { sku: String(b.sku).trim().toUpperCase() } : {}),
        ...(b.nameAr ? { nameAr: String(b.nameAr).trim() } : {}),
        ...(b.nameEn ? { nameEn: String(b.nameEn).trim() } : {}),
        ...(b.category ? { category: String(b.category).trim() } : {}),
        ...(b.sizeLabel ? { sizeLabel: String(b.sizeLabel).trim() } : {}),
        ...(b.sizeGroup ? { sizeGroup: String(b.sizeGroup).trim() } : {}),
        ...(b.thicknessMicrons !== undefined ? { thicknessMicrons: Number(b.thicknessMicrons) } : {}),
        ...(b.useCasesAr ? { useCasesAr: String(b.useCasesAr).trim() } : {}),
        ...(b.useCasesEn ? { useCasesEn: String(b.useCasesEn).trim() } : {}),
        ...(b.descriptionAr ? { descriptionAr: String(b.descriptionAr).trim() } : {}),
        ...(b.descriptionEn ? { descriptionEn: String(b.descriptionEn).trim() } : {}),
        ...(b.imageUrl ? { imageUrl: String(b.imageUrl).trim() } : {}),
        ...(b.inStock !== undefined ? { inStock: Boolean(b.inStock) } : {}),
      })
      .where(eq(products.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Failed to update product:', error);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

app.delete('/api/admin/products/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }
    await db.delete(products).where(eq(products.id, id));
    res.json({ deleted: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

app.get('/api/admin/messages', requireAuth, async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
    res.json(rows);
  } catch (error) {
    console.error('Failed to list contact messages:', error);
    res.status(500).json({ error: 'Failed to load messages.' });
  }
});

// Dynamic SEO Sitemap & Robots.txt
app.get('/sitemap.xml', (req, res) => {
  const baseUrl =
    process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL'
      ? process.env.APP_URL.replace(/\/$/, '')
      : `${req.protocol}://${req.get('host')}`;

  const routes = ['/', '/services', '/products', '/quote', '/track', '/about', '/faq', '/contact'];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', (req, res) => {
  const baseUrl =
    process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL'
      ? process.env.APP_URL.replace(/\/$/, '')
      : `${req.protocol}://${req.get('host')}`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

async function startServer() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const useViteDev = process.env.VITE_DEV === 'true' || (process.env.NODE_ENV !== 'production' && !fs.existsSync(distDir));

  if (useViteDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wardly server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
