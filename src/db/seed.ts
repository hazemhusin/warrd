import { count, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  auditLog,
  customers,
  events,
  inquiries,
  notifications,
  productImages,
  products,
  profiles,
  quoteMessages,
  quoteRequests,
  shipmentEvents,
  shipments,
  siteContent,
  siteSettings,
  suppliers,
  userRoles,
} from './schema.ts';

let seedPromise: Promise<void> | null = null;

export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((err) => {
      seedPromise = null;
      console.error('Seed failed:', err);
    });
  }
  return seedPromise;
}

async function runSeed(): Promise<void> {
  // 1. Seed Demo Profiles, Customer, and Suppliers (clearly marked isDemo: true)
  const [{ value: profileCount }] = await db.select({ value: count() }).from(profiles);
  let demoCustomerId: number | null = null;
  let demoSupplierId: number | null = null;
  let demoCustomerProfileId: number | null = null;

  if (profileCount === 0) {
    const [custProfile] = await db
      .insert(profiles)
      .values({
        uid: 'demo-customer-uid-1',
        email: 'demo.customer@wardly.eg',
        fullName: 'أحمد محمود (Demo Customer)',
        phone: '+20 100 000 0011',
        preferredLang: 'ar',
        isDemo: true,
      })
      .returning();

    demoCustomerProfileId = custProfile.id;

    await db.insert(userRoles).values({
      profileId: custProfile.id,
      role: 'customer',
      permissions: [],
    });

    const [cust] = await db
      .insert(customers)
      .values({
        profileId: custProfile.id,
        companyName: '[DEMO] الدلتا للصناعات الغذائية',
        city: 'Al-Minya',
        address: 'المنطقة الصناعية بالمنيا الجديدة',
        accountType: 'factory',
        isDemo: true,
      })
      .returning();
    demoCustomerId = cust.id;

    const [supProfile] = await db
      .insert(profiles)
      .values({
        uid: 'demo-supplier-uid-1',
        email: 'demo.supplier@wardly.eg',
        fullName: 'شركة النور للتغليف (Demo Supplier)',
        phone: '+20 100 000 0022',
        preferredLang: 'ar',
        isDemo: true,
      })
      .returning();

    await db.insert(userRoles).values({
      profileId: supProfile.id,
      role: 'supplier',
      permissions: [],
    });

    const [sup] = await db
      .insert(suppliers)
      .values({
        profileId: supProfile.id,
        companyName: '[DEMO] مصنع النور لمواد التغليف والعبوات',
        contactPerson: 'م. كريم عادل',
        phone: '+20 100 000 0022',
        email: 'demo.supplier@wardly.eg',
        country: 'Egypt',
        city: '10th of Ramadan',
        specialties: 'Air Column Bags, Bubble Wrap, Stretch Film',
        status: 'approved',
        isDemo: true,
      })
      .returning();
    demoSupplierId = sup.id;

    const [pendingSupProfile] = await db
      .insert(profiles)
      .values({
        uid: 'demo-supplier-uid-2',
        email: 'pending.supplier@wardly.eg',
        fullName: 'شركة الصعيد للبلاستيك (Demo Pending)',
        phone: '+20 100 000 0033',
        preferredLang: 'ar',
        isDemo: true,
      })
      .returning();

    await db.insert(userRoles).values({
      profileId: pendingSupProfile.id,
      role: 'supplier',
      permissions: [],
    });

    await db.insert(suppliers).values({
      profileId: pendingSupProfile.id,
      companyName: '[DEMO] الصعيد للكرتون ومستلزمات الشحن',
      contactPerson: 'أ. وليد حسن',
      phone: '+20 100 000 0033',
      email: 'pending.supplier@wardly.eg',
      country: 'Egypt',
      city: 'Al-Minya',
      specialties: 'Corrugated Boxes, Air Pillows, Kraft Tape',
      status: 'pending',
      isDemo: true,
    });
  }

  // 2. Seed Products
  const [{ value: productCount }] = await db.select({ value: count() }).from(products);
  if (productCount === 0) {
    const insertedProducts = await db
      .insert(products)
      .values([
        {
          sku: 'WRD-ACB-1525',
          supplierId: demoSupplierId,
          nameAr: 'كيس أعمدة هوائية قياسي 15×25 سم',
          nameEn: 'Standard Air Column Bag 15x25 cm',
          category: 'fragile',
          sizeLabel: '15×25 cm',
          sizeGroup: 'small',
          thicknessMicrons: 65,
          minOrderQty: 500,
          unitPriceEgp: 4,
          useCasesAr: 'زجاجات العطور، العبوات الدوائية، مستحضرات التجميل، الإكسسوارات الحساسة',
          useCasesEn: 'Perfume bottles, pharmaceutical vials, cosmetics, fragile accessories',
          descriptionAr:
            'تغليف هوائي متعدد القنوات بصمام إغلاق ذاتي يمنع تسرب الهواء ويحمي المنتج من الصدمات بنسبة 360 درجة.',
          descriptionEn:
            'Multi-chamber inflatable column sleeve with self-sealing check valve offering 360-degree impact cushioning.',
          imageUrl: '/src/assets/images/product_air_column_bags_1795089455256.jpg',
          inStock: true,
          approvalStatus: 'approved',
          isDemo: true,
        },
        {
          sku: 'WRD-ACB-2030',
          supplierId: demoSupplierId,
          nameAr: 'كيس أعمدة هوائية للإلكترونيات 20×30 سم',
          nameEn: 'Electronics Air Column Pouch 20x30 cm',
          category: 'electronics',
          sizeLabel: '20×30 cm',
          sizeGroup: 'medium',
          thicknessMicrons: 75,
          minOrderQty: 300,
          unitPriceEgp: 6,
          useCasesAr: 'الهواتف الذكية، الأجهزة اللوحية، الراوترات، قطع غيار الكمبيوتر',
          useCasesEn: 'Smartphones, tablets, routers, PC components and hardware',
          descriptionAr:
            'تصميم مخصص بـ 7 قنوات هواء عالية الكثافة لتحمل ضغط حتى 60 كجم أثناء الشحن البري والجوي.',
          descriptionEn:
            '7-chamber high-density PA/PE film engineered to withstand up to 60 kg compression during transit.',
          imageUrl: '/src/assets/images/product_air_column_bags_1795089455256.jpg',
          inStock: true,
          approvalStatus: 'approved',
          isDemo: true,
        },
        {
          sku: 'WRD-ACB-1334-BTL',
          supplierId: demoSupplierId,
          nameAr: 'كيس أعمدة هوائية للزجاجات 13×34 سم',
          nameEn: 'Bottle Protector Air Column 13x34 cm',
          category: 'bottle',
          sizeLabel: '13×34 cm',
          sizeGroup: 'medium',
          thicknessMicrons: 70,
          minOrderQty: 500,
          unitPriceEgp: 5,
          useCasesAr: 'الزجاجات الغذائية، زيت الزيتون، العصائر الفاخرة، البرطمانات الزجاجية',
          useCasesEn: 'Olive oil bottles, specialty beverages, glass jars, syrups',
          descriptionAr:
            'حماية أسطوانية مزدوجة القاعدة تمنع الكسر حتى مع السقوط من ارتفاع 1.5 متر.',
          descriptionEn:
            'Cylindrical wrap with reinforced bottom bumper tested against 1.5m drop impacts.',
          imageUrl: '/src/assets/images/product_air_column_bags_1795089455256.jpg',
          inStock: true,
          approvalStatus: 'approved',
          isDemo: true,
        },
        {
          sku: 'WRD-ACB-3040',
          supplierId: demoSupplierId,
          nameAr: 'كيس أعمدة هوائية كبير للأجهزة 30×40 سم',
          nameEn: 'Heavy-Duty Air Column Bag 30x40 cm',
          category: 'fragile',
          sizeLabel: '30×40 cm',
          sizeGroup: 'large',
          thicknessMicrons: 80,
          minOrderQty: 200,
          unitPriceEgp: 9,
          useCasesAr: 'أجهزة المطبخ الصغيرة، شاشات العرض، الفازات والتحف الخزفية',
          useCasesEn: 'Small appliances, monitors, ceramic decor, industrial spares',
          descriptionAr:
            'طبقة مزدوجة من النايلون والبولي إيثيلين تضمن بقاء ضغط الهواء لأكثر من 6 أشهر.',
          descriptionEn:
            'Co-extruded PA+PE 9-layer barrier film retaining air pressure for over 6 months.',
          imageUrl: '/src/assets/images/product_protective_packaging_1795089455189.jpg',
          inStock: true,
          approvalStatus: 'approved',
          isDemo: true,
        },
        {
          sku: 'WRD-ROL-4050',
          supplierId: demoSupplierId,
          nameAr: 'رول أعمدة هوائية للتفصيل 40 سم × 50 م',
          nameEn: 'Air Column Cushion Roll 40cm x 50m',
          category: 'rolls',
          sizeLabel: '40cm × 50m',
          sizeGroup: 'roll',
          thicknessMicrons: 65,
          minOrderQty: 5,
          unitPriceEgp: 850,
          useCasesAr: 'مخازن التجارة الإلكترونية، خطوط التغليف السريعة، المنتجات ذات المقاسات المتنوعة',
          useCasesEn: 'E-commerce fulfillment centers, packing lines, custom-sized items',
          descriptionAr:
            'رول اقتصادي قابل للقطع حسب الطول المطلوب لتغليف مئات الطرود بتكلفة تخزين شبه منعدمة قبل النفخ.',
          descriptionEn:
            'Cut-to-length roll saving up to 90% warehouse space before inflation for high-volume shippers.',
          imageUrl: '/src/assets/images/product_protective_packaging_1795089455189.jpg',
          inStock: true,
          approvalStatus: 'approved',
          isDemo: true,
        },
        {
          sku: 'WRD-BBL-100',
          supplierId: demoSupplierId,
          nameAr: 'رول بابلز تغليف ثنائي الطبقات 100 سم × 50 م',
          nameEn: 'Double-Layer Bubble Wrap Roll 100cm x 50m',
          category: 'bubble_wrap',
          sizeLabel: '100cm × 50m',
          sizeGroup: 'roll',
          thicknessMicrons: 90,
          minOrderQty: 10,
          unitPriceEgp: 620,
          useCasesAr: 'تغليف الأثاث، الأجهزة الكهربائية الكبيرة، الشحنات المجمعة على باليتات',
          useCasesEn: 'Furniture wrapping, large electronics, palletized wholesale freight',
          descriptionAr:
            'بابلز مقوى مقاوم للثقب والتمزق لتبطين الكراتين وحماية الأسطح اللامعة أثناء النقل.',
          descriptionEn:
            'Puncture-resistant heavy-gauge bubble cushioning for surface protection and void fill.',
          imageUrl: '/src/assets/images/product_protective_packaging_1795089455189.jpg',
          inStock: true,
          approvalStatus: 'approved',
          isDemo: true,
        },
      ])
      .returning();

    if (insertedProducts.length > 0) {
      await db.insert(productImages).values(
        insertedProducts.map((p) => ({
          productId: p.id,
          imageUrl: p.imageUrl,
          altAr: p.nameAr,
          altEn: p.nameEn,
          sortOrder: 0,
        }))
      );
    }
  }

  // 3. Seed Shipments + Shipment Events
  const [{ value: shipmentCount }] = await db.select({ value: count() }).from(shipments);
  if (shipmentCount === 0) {
    const insertedShipments = await db
      .insert(shipments)
      .values([
        {
          trackingNumber: 'WRD-2026-8841',
          customerId: demoCustomerId,
          clientName: '[DEMO] شركة النيل للتجارة والتوريدات',
          clientPhone: '+20 100 000 0001',
          originCountry: 'China (Ningbo)',
          port: 'Alexandria Port',
          destination: 'Al-Minya Industrial Zone',
          cargoTypeAr: 'مستلزمات تغليف وماكينات تعبئة (حاوية 40 قدم)',
          cargoTypeEn: 'Packaging Machinery & Supplies (40ft FCL)',
          containerOrBill: 'MSCU4829104',
          acidNumber: '2026118841009912345',
          status: 'under_clearance',
          notesAr:
            'تم استلام رقم ACID ومطابقة الفواتير، وجارٍ إنهاء الفحص الجمركي على منصة نافذة.',
          notesEn:
            'ACID registration verified on Nafeza; customs inspection and tariff assessment underway.',
          estimatedDelivery: '2026-11-23',
          isDemo: true,
        },
        {
          trackingNumber: 'WRD-2026-8842',
          customerId: demoCustomerId,
          clientName: '[DEMO] متجر صعيد تك للإلكترونيات',
          clientPhone: '+20 100 000 0002',
          originCountry: 'UAE (Jebel Ali)',
          port: 'Ain Sokhna Port',
          destination: 'Al-Minya City',
          cargoTypeAr: 'إلكترونيات وإكسسوارات مغلفة بأكياس هوائية',
          cargoTypeEn: 'Consumer Electronics & Air-Column Protected Parcels',
          containerOrBill: 'COSU6391820',
          acidNumber: '2026118842009912346',
          status: 'released',
          notesAr:
            'تم الإفراج الجمركي النهائي، والشحنة الآن في مرحلة التحميل والنقل البري للمنيا.',
          notesEn: 'Final customs release granted. Cargo loaded onto bonded truck bound for Al-Minya.',
          estimatedDelivery: '2026-11-20',
          isDemo: true,
        },
        {
          trackingNumber: 'WRD-2026-8843',
          clientName: '[DEMO] مصنع الوادي للمستلزمات الطبية',
          clientPhone: '+20 100 000 0003',
          originCountry: 'Germany (Hamburg)',
          port: 'Damietta Port',
          destination: 'New Minya',
          cargoTypeAr: 'عبوات زجاجية معقمة ومواد تغليف',
          cargoTypeEn: 'Sterile Glassware & Protective Packaging',
          containerOrBill: 'HLXU9204511',
          status: 'documents_received',
          notesAr:
            'تم استلام بوليصة الشحن وشهادة المنشأ والمستندات قيد المراجعة الأولية قبل وصول المركب.',
          notesEn:
            'Bill of lading and certificate of origin received; pre-arrival document audit in progress.',
          estimatedDelivery: '2026-11-28',
          isDemo: true,
        },
        {
          trackingNumber: 'WRD-2026-8844',
          clientName: '[DEMO] مجموعة المنيا للأدوات المنزلية',
          clientPhone: '+20 100 000 0004',
          originCountry: 'Turkey (Mersin)',
          port: 'Port Said West',
          destination: 'Al-Minya',
          cargoTypeAr: 'أدوات مطبخ زجاجية ومغلفات حماية',
          cargoTypeEn: 'Glass Kitchenware & Cushioning Rolls',
          containerOrBill: 'CMAU7712049',
          status: 'delivered',
          notesAr:
            'تم التسليم بنجاح في مخازن العميل بالمنيا بعد فحص الكميات والتأكد من سلامة كافة الطرود.',
          notesEn: 'Delivered to client warehouse in Al-Minya with 100% intact parcel verification.',
          estimatedDelivery: '2026-11-15',
          isDemo: true,
        },
      ])
      .returning();

    if (insertedShipments.length > 0) {
      await db.insert(shipmentEvents).values([
        {
          shipmentId: insertedShipments[0].id,
          status: 'documents_received',
          location: 'Al-Minya Desk',
          titleAr: 'استلام ومراجعة مستندات ACID',
          titleEn: 'ACID & Commercial Docs Audited',
          descriptionAr: 'تمت مطابقة الفاتورة التجارية وبوليصة الشحن بنجاح.',
          descriptionEn: 'Commercial invoice and bill of lading verified.',
        },
        {
          shipmentId: insertedShipments[0].id,
          status: 'under_clearance',
          location: 'Alexandria Port',
          titleAr: 'بدء الفحص والتثمين الجمركي',
          titleEn: 'Port Customs Inspection Started',
          descriptionAr: 'تم فتح البيان الجمركي على منصة نافذة وتحديد مسار الكشف.',
          descriptionEn: 'Customs declaration opened on Nafeza portal.',
        },
      ]);
    }
  }

  // 4. Seed Quotes & Quote Messages
  const [{ value: quoteCount }] = await db.select({ value: count() }).from(quoteRequests);
  if (quoteCount === 0) {
    const insertedQuotes = await db
      .insert(quoteRequests)
      .values([
        {
          referenceCode: 'WRD-Q-1041',
          customerId: demoCustomerId,
          profileId: demoCustomerProfileId,
          serviceType: 'customs_clearance',
          goodsDescription: '[DEMO] خط إنتاج وتعبئة منتجات غذائية - 18 طبلية',
          originCountry: 'Italy',
          portOfEntry: 'Alexandria Port',
          quantity: '1x 40ft Container',
          contactName: 'أحمد محمود',
          companyName: '[DEMO] الدلتا للصناعات الغذائية',
          phone: '+20 100 000 0011',
          email: 'demo.customer@wardly.eg',
          notes: 'مطلوب تخليص جمركي كامل ونقل إلى المنطقة الصناعية بالمنيا.',
          quotedPriceEgp: 42500,
          status: 'quoted',
          emailNotificationStatus: 'sent',
          isDemo: true,
        },
        {
          referenceCode: 'WRD-Q-1042',
          assignedSupplierId: demoSupplierId,
          serviceType: 'packaging_supply',
          goodsDescription: '[DEMO] أكياس أعمدة هوائية مقاس 20×30 سم و 15×25 سم',
          originCountry: 'Egypt (Local Supply)',
          portOfEntry: 'Al-Minya Warehouse',
          quantity: '5,000 Units',
          contactName: 'سارة حسن',
          companyName: '[DEMO] متجر زهرة للتجارة الإلكترونية',
          phone: '+20 100 000 0012',
          email: 'sara.demo@wardly.eg',
          notes: 'توريد دوري شهري مع مضخة نفخ هوائي.',
          status: 'new',
          emailNotificationStatus: 'queued',
          isDemo: true,
        },
      ])
      .returning();

    if (insertedQuotes.length > 0) {
      await db.insert(quoteMessages).values({
        quoteId: insertedQuotes[0].id,
        senderProfileId: demoCustomerProfileId,
        senderRole: 'customer',
        senderName: 'أحمد محمود',
        message: 'يرجى تأكيد موعد وصول شهادة المنشأ وتكلفة النقل للمنيا.',
      });
    }
  }

  // 5. Seed Inquiries
  const [{ value: inqCount }] = await db.select({ value: count() }).from(inquiries);
  if (inqCount === 0) {
    await db.insert(inquiries).values({
      name: 'مصطفى كامل (Demo)',
      phone: '+20 100 000 0044',
      email: 'inquiry.demo@wardly.eg',
      subject: 'استفسار عن توريد رولات أعمدة هوائية بالجملة',
      message: 'نحتاج تسعير 20 رول مقاس 40×50 سم للتوصيل في المنيا.',
      status: 'new',
      isDemo: true,
    });
  }

  // 6. Seed CMS Site Content & Site Settings
  const [{ value: contentCount }] = await db.select({ value: count() }).from(siteContent);
  if (contentCount === 0) {
    await db.insert(siteContent).values([
      {
        sectionKey: 'homepage_stats',
        contentAr: [
          { value: '+1,450', label: 'شحنة تم تخليصها بنجاح' },
          { value: '48 ساعة', label: 'متوسط زمن الإفراج الجمركي' },
          { value: '6 موانئ', label: 'تغطية مباشرة في مصر' },
          { value: '99.4%', label: 'وصول آمن بدون تلف بفضل التغليف الهوائي' },
        ],
        contentEn: [
          { value: '+1,450', label: 'Shipments Cleared Safely' },
          { value: '48 hrs', label: 'Average Port Release Time' },
          { value: '6 Ports', label: 'Direct On-Ground Coverage' },
          { value: '99.4%', label: 'Damage-Free Air Column Delivery' },
        ],
      },
    ]);
  }

  const [{ value: settingsCount }] = await db.select({ value: count() }).from(siteSettings);
  if (settingsCount === 0) {
    await db.insert(siteSettings).values({
      settingKey: 'company_general',
      value: {
        whatsappNumber: '201096554798',
        phoneDisplay: '+20 109 655 4798',
        telegramUrl: 'https://t.me/+201096554798',
        email: 'info@wardly.eg',
        addressAr: 'شارع عدنان المالكي، حي وسط المدينة، المنيا، مصر (TODO: replace)',
        addressEn: 'Adnan El-Malky St, Downtown, Al-Minya, Egypt (TODO: replace)',
        emailNotificationsEnabled: true,
        inAppNotificationsEnabled: true,
      },
    });
  }

  // 7. Seed Initial Analytics Events & Audit Log for Demo Visibility
  const [{ value: eventCount }] = await db.select({ value: count() }).from(events);
  if (eventCount === 0) {
    await db.insert(events).values([
      { sessionId: 'demo-sess-1', eventType: 'page_view', pagePath: '/', device: 'desktop', country: 'EG' },
      { sessionId: 'demo-sess-1', eventType: 'product_view', pagePath: '/products', device: 'desktop', country: 'EG' },
      { sessionId: 'demo-sess-1', eventType: 'quote_started', pagePath: '/quote', device: 'desktop', country: 'EG' },
      { sessionId: 'demo-sess-1', eventType: 'quote_submitted', pagePath: '/quote', device: 'desktop', country: 'EG' },
      { sessionId: 'demo-sess-2', eventType: 'page_view', pagePath: '/services', device: 'mobile', country: 'EG' },
    ]);
  }

  const [{ value: auditCount }] = await db.select({ value: count() }).from(auditLog);
  if (auditCount === 0) {
    await db.insert(auditLog).values({
      actorEmail: 'system@wardly.eg',
      actorRole: 'super_admin',
      action: 'system.seeded_demo_data',
      entityType: 'database',
      entityId: 'initial',
      afterState: { demoRecordsSeeded: true },
    });
  }

  if (demoCustomerProfileId) {
    const [{ value: notifCount }] = await db
      .select({ value: count() })
      .from(notifications)
      .where(eq(notifications.recipientProfileId, demoCustomerProfileId));
    if (notifCount === 0) {
      await db.insert(notifications).values({
        recipientProfileId: demoCustomerProfileId,
        type: 'quote_update',
        titleAr: 'تم تسعير طلبك WRD-Q-1041',
        titleEn: 'Quote WRD-Q-1041 Priced',
        bodyAr: 'يمكنك مراجعة عرض السعر المبدئي من بوابة العملاء.',
        bodyEn: 'Review your custom quote estimate in the Customer Portal.',
        linkPath: '/customer',
      });
    }
  }
}
