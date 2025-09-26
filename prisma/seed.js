/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Default categories
  const categories = [
    'Politics',
    'Human Rights',
    'Activism',
    'News',
    'Opinion',
  ];

  const categoryRecords = [];
  for (const name of categories) {
    const c = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categoryRecords.push(c);
  }

  // Default tags
  const tags = ['2025 Elections', 'Land Rights', 'Police Reform', 'Governance'];
  const tagRecords = [];
  for (const name of tags) {
    const t = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    tagRecords.push(t);
  }

  // Admin user (for local dev). Update email to your own if desired.
  const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0]?.trim() || 'admin@example.com';
  const adminPassword = '12345678';
  const adminHash = bcrypt.hashSync(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN', passwordHash: adminHash },
    create: { email: adminEmail, name: 'Admin', role: 'ADMIN', passwordHash: adminHash },
  });

  // Sample post
  const sampleTitle = 'Youth Activism and Electoral Reforms';
  const exists = await prisma.post.findFirst({ where: { title: sampleTitle } });
  if (!exists) {
    const post = await prisma.post.create({
      data: {
        title: sampleTitle,
        content:
          '<p>Kenya\'s youth are driving change through grassroots movements and sustained civic engagement. This report explores strategies, challenges, and the road ahead for electoral reforms.</p>',
        authorId: admin.id,
        published: true,
        imageUrl: null,
        videoUrl: null,
      },
    });

    // Connect categories and tags
    const catLinks = categoryRecords
      .filter((c) => ['Politics', 'Human Rights'].includes(c.name))
      .map((c) => ({ postId: post.id, categoryId: c.id }));
    const tagLinks = tagRecords
      .filter((t) => ['2025 Elections', 'Governance'].includes(t.name))
      .map((t) => ({ postId: post.id, tagId: t.id }));

    for (const link of catLinks) {
      await prisma.postCategory.create({ data: link });
    }
    for (const link of tagLinks) {
      await prisma.postTag.create({ data: link });
    }

    console.log('Seeded sample post:', post.id);
  } else {
    console.log('Sample post already exists.');
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
