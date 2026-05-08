import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import "dotenv/config";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seed: Creating users...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const memberPassword = await bcrypt.hash('member123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const member = await prisma.user.create({
    data: {
      name: 'Team Member',
      email: 'member@example.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  console.log('Seed: Creating projects...');

  const project1 = await prisma.project.create({
    data: {
      title: 'Marketing Website Redesign',
      description: 'Overhaul the main company website with modern design and improved SEO focus.',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days out
      members: {
        create: [
          { userId: admin.id },
          { userId: member.id }
        ]
      }
    }
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Customer Feedback App',
      description: 'Internal tool to collect and categorize customer feedback from multiple channels.',
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days out
      members: {
        create: [
          { userId: admin.id },
          { userId: member.id }
        ]
      }
    }
  });

  console.log('Seed: Creating tasks...');

  await prisma.task.createMany({
    data: [
      {
        title: 'Design high-fidelity mockups',
        description: 'Create Figma designs for the homepage and product pages.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        projectId: project1.id,
        assignedToId: member.id,
        createdById: admin.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Draft technical specification',
        description: 'Document the architecture and external API integrations.',
        priority: 'MEDIUM',
        status: 'TODO',
        projectId: project1.id,
        assignedToId: admin.id,
        createdById: admin.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Finalize UX flow',
        description: 'Review and lock down the user journey mapping.',
        priority: 'MEDIUM',
        status: 'COMPLETED',
        projectId: project1.id,
        assignedToId: member.id,
        createdById: admin.id,
      },
      {
        title: 'Database schema design',
        description: 'Create ERD and Prisma schema for the feedback app.',
        priority: 'HIGH',
        status: 'TODO',
        projectId: project2.id,
        assignedToId: admin.id,
        createdById: admin.id,
      },
      {
        title: 'Setup initial repository',
        description: 'Initialize Git, Vite, and CI/CD pipelines.',
        priority: 'LOW',
        status: 'COMPLETED',
        projectId: project2.id,
        assignedToId: member.id,
        createdById: admin.id,
      }
    ]
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
