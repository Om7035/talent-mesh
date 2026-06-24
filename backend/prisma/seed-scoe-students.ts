import { PrismaClient, Role, VerificationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

const studentDefs = [
  { name: 'Priya Deshpande', email: 'priya.scoe1@example.com', phone: '+91 90011 10001', skills: ['React', 'Node.js'], major: 'Computer Engineering' },
  { name: 'Rahul Joshi', email: 'rahul.scoe2@example.com', phone: '+91 90011 10002', skills: ['Python', 'Machine Learning'], major: 'Computer Engineering' },
  { name: 'Sneha Patil', email: 'sneha.scoe3@example.com', phone: '+91 90011 10003', skills: ['Figma', 'UI/UX'], major: 'Information Technology' },
  { name: 'Aditya Kulkarni', email: 'aditya.scoe4@example.com', phone: '+91 90011 10004', skills: ['TypeScript', 'Next.js'], major: 'Computer Engineering' },
  { name: 'Omkar Bhosale', email: 'omkar.scoe5@example.com', phone: '+91 90011 10005', skills: ['Flutter', 'React Native'], major: 'Information Technology' },
];

async function main() {
  console.log('🌱 Seeding 5 SCOE students (idempotent — skips any that already exist)\n');

  const scoe = await prisma.college.findUnique({ where: { domain: 'scoe.edu.in' } });
  if (!scoe) {
    throw new Error('SCOE college not found. Expected a College with domain "scoe.edu.in" to already exist.');
  }

  let department = await prisma.department.findFirst({ where: { collegeId: scoe.id, name: 'Computer Engineering' } });
  if (!department) {
    department = await prisma.department.create({ data: { name: 'Computer Engineering', collegeId: scoe.id } });
  }

  for (const def of studentDefs) {
    const existing = await prisma.user.findUnique({ where: { email: def.email } });
    if (existing) {
      console.log(`⏭  Skipping ${def.email} — already exists`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: def.email,
        passwordHash: hash('Pass123!'),
        name: def.name,
        role: Role.STUDENT,
        wallet: { create: { balance: 0 } },
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        collegeId: scoe.id,
        departmentId: department.id,
        phone: def.phone,
        major: def.major,
        yearOfStudy: 3,
        bio: `Student at Sinhgad College of Engineering specializing in ${def.skills[0]}.`,
        location: 'Pune, Maharashtra',
        verificationStatus: VerificationStatus.PENDING, // Intentionally left for manual TPO verification
      },
    });

    for (const skillName of def.skills) {
      const skill = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName },
      });
      await prisma.studentSkill.create({
        data: { studentId: student.id, skillId: skill.id, level: 'Intermediate' },
      });
    }

    console.log(`✅ Created ${def.name} (${def.email}) — Pass123! — PENDING verification`);
  }

  console.log('\n🎉 Done. Log in as a SCOE TPO (sunil@scoe.edu.in / Pass123!) to verify these students.');
  console.log('\n📝 Student credentials (all password: Pass123!):');
  for (const def of studentDefs) {
    console.log(`  ${def.name}: ${def.email} | ${def.phone} | skills: ${def.skills.join(', ')}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
