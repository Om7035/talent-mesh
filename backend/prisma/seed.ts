import { PrismaClient, Role, DifficultyLevel, ProjectStatus, VerificationStatus, ApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

async function clearDatabase() {
  console.log('🧹 Clearing database...');
  // Delete in reverse order of dependencies
  await prisma.review.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.escrow.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.projectApplication.deleteMany();
  await prisma.projectSkill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.student.deleteMany();
  await prisma.client.deleteMany();
  await prisma.tPO.deleteMany();
  await prisma.recruiter.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.college.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.leaderboard.deleteMany();
}

async function isDatabaseSeeded(): Promise<boolean> {
  const count = await prisma.user.count();
  return count > 0;
}

async function main() {
  console.log('🌱 TalentMesh AI — Pune Demo Dataset Seeder\n');

  const force = process.argv.includes('--force');
  const alreadySeeded = await isDatabaseSeeded();

  if (alreadySeeded && !force) {
    console.log('✅ Database already has data. Skipping seed.');
    console.log('   To reseed, run: npm run db:seed -- --force\n');
    return;
  }

  if (force) {
    await clearDatabase();
  }

  // ─────────────────────────────────────────────────────────────────
  // COLLEGES
  // ─────────────────────────────────────────────────────────────────
  const coep = await prisma.college.create({
    data: { name: 'College of Engineering Pune', domain: 'coep.org.in', city: 'Pune', country: 'India', isVerified: true },
  });
  const pict = await prisma.college.create({
    data: { name: 'Pune Institute of Computer Technology', domain: 'pict.edu', city: 'Pune', country: 'India', isVerified: true },
  });
  const mitwpu = await prisma.college.create({
    data: { name: 'MIT World Peace University', domain: 'mitwpu.edu.in', city: 'Pune', country: 'India', isVerified: true },
  });
  const scoe = await prisma.college.create({
    data: { name: 'Sinhgad College of Engineering (SCOE)', domain: 'scoe.edu.in', city: 'Pune', country: 'India', isVerified: true },
  });

  const colleges = [coep, pict, mitwpu, scoe];
  const cseDeps = await Promise.all(colleges.map(c => 
    prisma.department.create({ data: { name: 'Computer Engineering', collegeId: c.id } })
  ));

  console.log('✅ Colleges seeded');

  // ─────────────────────────────────────────────────────────────────
  // SKILLS
  // ─────────────────────────────────────────────────────────────────
  const skillDefs = [
    { name: 'React', category: 'Frontend' }, { name: 'Node.js', category: 'Backend' },
    { name: 'TypeScript', category: 'Language' }, { name: 'Python', category: 'Language' },
    { name: 'PostgreSQL', category: 'Database' }, { name: 'MongoDB', category: 'Database' },
    { name: 'AWS', category: 'Cloud' }, { name: 'Docker', category: 'DevOps' },
    { name: 'Figma', category: 'Design' }, { name: 'UI/UX', category: 'Design' },
    { name: 'Machine Learning', category: 'AI/ML' }, { name: 'Next.js', category: 'Frontend' },
    { name: 'Django', category: 'Backend' }, { name: 'Flutter', category: 'Mobile' },
    { name: 'React Native', category: 'Mobile' }
  ];

  const skills: Record<string, any> = {};
  for (const sk of skillDefs) {
    skills[sk.name] = await prisma.skill.create({ data: sk });
  }
  console.log('✅ Skills seeded');

  // ─────────────────────────────────────────────────────────────────
  // ADMIN, TPOS, RECRUITERS
  // ─────────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.create({
    data: { email: 'admin@talentmesh.in', passwordHash: hash('Admin123!'), name: 'Amit Shah', role: Role.ADMIN, wallet: { create: { balance: 0 } } }
  });
  await prisma.admin.create({ data: { userId: adminUser.id, permissions: ['MANAGE_USERS', 'RESOLVE_DISPUTES'] } });

  const recruiters = [
    { email: 'sunita@tcs.com', name: 'Sunita Rao', company: 'TCS' },
    { email: 'manoj@infosys.com', name: 'Manoj Tiwari', company: 'Infosys' }
  ];
  for (const r of recruiters) {
    const u = await prisma.user.create({ data: { email: r.email, passwordHash: hash('Pass123!'), name: r.name, role: Role.RECRUITER, wallet: { create: { balance: 0 } } } });
    await prisma.recruiter.create({ data: { userId: u.id, companyName: r.company, industry: 'IT Services', isVerified: true } });
  }

  const tpos = [
    { email: 'milind@coep.org.in', name: 'Dr. Milind Joshi', collegeId: coep.id },
    { email: 'sanjay@pict.edu', name: 'Prof. Sanjay Patil', collegeId: pict.id },
    { email: 'ramesh@mitwpu.edu.in', name: 'Dr. Ramesh Kulkarni', collegeId: mitwpu.id },
    { email: 'sunil@scoe.edu.in', name: 'Dr. Sunil Bhosale', collegeId: scoe.id }
  ];
  for (const t of tpos) {
    const u = await prisma.user.create({ data: { email: t.email, passwordHash: hash('Pass123!'), name: t.name, role: Role.TPO, wallet: { create: { balance: 0 } } } });
    await prisma.tPO.create({ data: { userId: u.id, collegeId: t.collegeId, designation: 'TPO Head' } });
  }

  // ─────────────────────────────────────────────────────────────────
  // CLIENTS
  // ─────────────────────────────────────────────────────────────────
  const clientDefs = [
    { email: 'rahul@techsolutions.in', name: 'Rahul Sharma', company: 'TechSolutions India', balance: 50000 },
    { email: 'vikram@innovate.in', name: 'Vikram Singh', company: 'InnovateTech', balance: 75000 },
    { email: 'anjali@designhub.in', name: 'Anjali Patel', company: 'DesignHub Pune', balance: 30000 },
    { email: 'suresh@cloudscale.in', name: 'Suresh Kumar', company: 'CloudScale', balance: 100000 },
    { email: 'meera@aisystems.in', name: 'Meera Reddy', company: 'AI Systems', balance: 120000 },
    { email: 'karan@dataworks.in', name: 'Karan Desai', company: 'DataWorks', balance: 40000 },
    { email: 'pooja@webmakers.in', name: 'Pooja Gupta', company: 'WebMakers', balance: 25000 },
    { email: 'manish@appforge.in', name: 'Manish Jain', company: 'AppForge', balance: 60000 },
    { email: 'rohit@financetech.in', name: 'Rohit Verma', company: 'FinanceTech', balance: 90000 },
    { email: 'sneha@edulearn.in', name: 'Sneha Kulkarni', company: 'EduLearn', balance: 35000 }
  ];

  const clientRecords: any[] = [];
  for (const c of clientDefs) {
    const u = await prisma.user.create({ data: { email: c.email, passwordHash: hash('Pass123!'), name: c.name, role: Role.CLIENT, wallet: { create: { balance: c.balance } } } });
    const clientProfile = await prisma.client.create({ data: { userId: u.id, companyName: c.company, industry: 'Technology', isVerified: true } });
    clientRecords.push({ user: u, profile: clientProfile });
  }

  console.log('✅ Clients, TPOs, Recruiters seeded');

  // ─────────────────────────────────────────────────────────────────
  // STUDENTS (25 total across 4 tiers)
  // ─────────────────────────────────────────────────────────────────
  const studentDefs = [
    // Elite (3)
    { name: 'Rohan Deshmukh', c: 0, s: 95.5, e: 6000, p: 12, r: 4.9, skills: ['React', 'Node.js', 'AWS'] },
    { name: 'Priya Nair', c: 1, s: 98.0, e: 8500, p: 15, r: 5.0, skills: ['Python', 'Machine Learning', 'Docker'] },
    { name: 'Aditya Joshi', c: 2, s: 92.3, e: 5200, p: 9, r: 4.8, skills: ['Next.js', 'TypeScript', 'UI/UX'] },
    // Professional (5)
    { name: 'Neha Patil', c: 0, s: 85.0, e: 3500, p: 6, r: 4.7, skills: ['React Native', 'Node.js'] },
    { name: 'Akash Singh', c: 1, s: 82.5, e: 2800, p: 5, r: 4.6, skills: ['Django', 'Python', 'PostgreSQL'] },
    { name: 'Varun Mehta', c: 2, s: 88.0, e: 4100, p: 7, r: 4.8, skills: ['Figma', 'UI/UX'] },
    { name: 'Shruti Iyer', c: 0, s: 79.5, e: 2100, p: 4, r: 4.5, skills: ['Flutter', 'AWS'] },
    { name: 'Rakesh Sharma', c: 1, s: 78.0, e: 2400, p: 4, r: 4.4, skills: ['React', 'Next.js'] },
    // Rising Talent (7)
    { name: 'Snehal Kadam', c: 2, s: 68.0, e: 800, p: 2, r: 4.3, skills: ['Node.js', 'MongoDB'] },
    { name: 'Kunal Bhatia', c: 0, s: 65.5, e: 650, p: 1, r: 4.5, skills: ['React'] },
    { name: 'Aarti Desai', c: 1, s: 71.0, e: 1200, p: 3, r: 4.4, skills: ['Python'] },
    { name: 'Omkar Joshi', c: 2, s: 62.5, e: 500, p: 1, r: 4.2, skills: ['UI/UX'] },
    { name: 'Riya Gupta', c: 0, s: 69.0, e: 950, p: 2, r: 4.6, skills: ['TypeScript'] },
    { name: 'Gaurav Patil', c: 1, s: 64.0, e: 700, p: 1, r: 4.0, skills: ['Docker'] },
    { name: 'Ishita Jain', c: 2, s: 72.5, e: 1400, p: 3, r: 4.7, skills: ['Machine Learning'] },
    // Beginner (10)
    { name: 'Siddharth Rao', c: 0, s: 45.0, e: 0, p: 0, r: 0, skills: ['React'] },
    { name: 'Anushka Sen', c: 1, s: 42.0, e: 0, p: 0, r: 0, skills: ['Python'] },
    { name: 'Yash Chavan', c: 2, s: 48.0, e: 0, p: 0, r: 0, skills: ['Node.js'] },
    { name: 'Tanya Verma', c: 0, s: 35.0, e: 0, p: 0, r: 0, skills: ['Figma'] },
    { name: 'Karthik Pillai', c: 1, s: 40.0, e: 0, p: 0, r: 0, skills: ['React Native'] },
    { name: 'Megha Singh', c: 2, s: 38.0, e: 0, p: 0, r: 0, skills: ['AWS'] },
    { name: 'Aryan Shah', c: 0, s: 46.5, e: 0, p: 0, r: 0, skills: ['Next.js'] },
    { name: 'Divya Kumar', c: 1, s: 44.0, e: 0, p: 0, r: 0, skills: ['UI/UX'] },
    { name: 'Pranav Kulkarni', c: 2, s: 49.0, e: 0, p: 0, r: 0, skills: ['Django'] },
    { name: 'Shivani More', c: 0, s: 30.0, e: 0, p: 0, r: 0, skills: ['Machine Learning'] }
  ];

  const studentRecords: any[] = [];
  for (let i = 0; i < studentDefs.length; i++) {
    const def = studentDefs[i];
    const email = `${def.name.split(' ')[0].toLowerCase()}${i}@student.in`;
    const col = colleges[def.c];
    
    const u = await prisma.user.create({
      data: { email, passwordHash: hash('Pass123!'), name: def.name, role: Role.STUDENT, wallet: { create: { balance: def.e } } }
    });
    
    const isVerified = def.p > 0 ? 'VERIFIED' : 'PENDING'; // Beginners pending
    
    const profile = await prisma.student.create({
      data: {
        userId: u.id, collegeId: col.id, departmentId: cseDeps[def.c].id,
        bio: `Enthusiastic developer specializing in ${def.skills[0]}`,
        location: 'Pune, Maharashtra', yearOfStudy: 3, major: 'Computer Engineering',
        reputationScore: def.s, totalEarnings: def.e, projectsCompleted: def.p, avgClientRating: def.r,
        verificationStatus: isVerified as VerificationStatus, completionRate: def.p > 0 ? 0.9 : 0, onTimeDeliveryRate: def.p > 0 ? 0.9 : 0
      }
    });

    for (const sk of def.skills) {
      if (skills[sk]) {
        await prisma.studentSkill.create({
          data: { studentId: profile.id, skillId: skills[sk].id, level: def.p > 5 ? 'Advanced' : 'Intermediate', endorsed: def.p * 2 }
        });
      }
    }

    await prisma.leaderboard.create({
      data: { studentId: profile.id, score: def.s, globalRank: i + 1, collegeRank: Math.floor(i / 3) + 1, departmentRank: Math.floor(i / 3) + 1 }
    });

    studentRecords.push({ user: u, profile });
  }

  console.log('✅ Students seeded');

  // ─────────────────────────────────────────────────────────────────
  // PROJECTS (25)
  // ─────────────────────────────────────────────────────────────────
  const projectTitles = [
    'E-Commerce Frontend in React', 'Backend API for Logistics App', 'AI Chatbot for Customer Support',
    'Figma UI Redesign for EdTech', 'AWS Migration for Startup', 'React Native Delivery App',
    'Django Admin Dashboard', 'Flutter Fitness Tracker', 'Machine Learning Recommendation Engine',
    'Node.js Payment Gateway Integration', 'Next.js SEO Optimization', 'MongoDB Database Tuning',
    'Docker Containerization Pipeline', 'UI/UX Audit and Revamp', 'Python Web Scraper',
    'Custom CMS Development', 'IoT Dashboard Frontend', 'GraphQL API Implementation',
    'Automated Testing Suite', 'Real-time Chat App Backend', 'Video Streaming App UI',
    'Analytics Dashboard in React', 'Serverless AWS Architecture', 'E-Learning Platform Backend',
    'Financial App UI Design'
  ];

  const projectRecords: any[] = [];
  for (let i = 0; i < 25; i++) {
    const client = clientRecords[i % 10]; // Cycle through clients
    // Determine status:
    // First 5: DRAFT
    // Next 10: PUBLISHED/APPLICATIONS_OPEN
    // Next 5: IN_PROGRESS
    // Next 5: COMPLETED
    let status: any = ProjectStatus.PUBLISHED;
    if (i < 5) status = ProjectStatus.DRAFT;
    else if (i < 10) status = ProjectStatus.PUBLISHED;
    else if (i < 15) status = ProjectStatus.APPLICATIONS_OPEN;
    else if (i < 20) status = ProjectStatus.IN_PROGRESS;
    else status = ProjectStatus.COMPLETED;

    const p = await prisma.project.create({
      data: {
        clientId: client.profile.id,
        title: projectTitles[i],
        description: `Detailed requirements for ${projectTitles[i]}. Looking for talented students from Pune.`,
        budget: 500 + (i * 100),
        timelineDays: 14 + (i % 4) * 7,
        difficulty: i % 3 === 0 ? DifficultyLevel.ADVANCED : DifficultyLevel.INTERMEDIATE,
        category: i % 2 === 0 ? 'Web Development' : 'AI/ML',
        projectType: 'Fixed Price',
        status,
        applicationCount: status === ProjectStatus.DRAFT ? 0 : (i % 5) + 3,
        createdAt: new Date(Date.now() - (30 - i) * 86400000)
      }
    });

    // Add a random skill
    const skillKeys = Object.keys(skills);
    await prisma.projectSkill.create({
      data: { projectId: p.id, skillId: skills[skillKeys[i % skillKeys.length]].id }
    });

    projectRecords.push(p);
  }

  console.log('✅ Projects seeded');

  // ─────────────────────────────────────────────────────────────────
  // APPLICATIONS (100) & CONTRACTS (15)
  // ─────────────────────────────────────────────────────────────────
  let appCount = 0;
  let contractCount = 0;
  const contractRecords: any[] = [];

  for (let i = 5; i < 25; i++) { // Skip DRAFT projects (0-4)
    const project = projectRecords[i];
    
    // Apply 4 students to each project
    for (let j = 0; j < 4; j++) {
      const student = studentRecords[(i + j) % 25].profile;
      
      let appStatus: any = ApplicationStatus.PENDING;
      
      // For projects IN_PROGRESS (15-19) or COMPLETED (20-24), one student is ACCEPTED
      if (i >= 15 && j === 0) {
        appStatus = ApplicationStatus.ACCEPTED;
      } else if (i >= 15 && j !== 0) {
        appStatus = ApplicationStatus.REJECTED;
      }

      const application = await prisma.projectApplication.create({
        data: {
          projectId: project.id, studentId: student.id,
          coverLetter: `Hi, I am interested in ${project.title}. I study at a top Pune college.`,
          proposedBudget: project.budget,
          status: appStatus, createdAt: new Date(project.createdAt.getTime() + 86400000)
        }
      });
      appCount++;

      // Create Contracts for accepted applications
      if (appStatus === ApplicationStatus.ACCEPTED) {
        const cStatus = i >= 20 ? ProjectStatus.COMPLETED : ProjectStatus.IN_PROGRESS;
        const contract = await prisma.contract.create({
          data: {
            projectId: project.id, studentId: student.id,
            status: cStatus, agreedBudget: project.budget, timelineDays: project.timelineDays,
            startedAt: new Date(application.createdAt.getTime() + 86400000),
            completedAt: cStatus === ProjectStatus.COMPLETED ? new Date(Date.now() - 86400000) : null
          }
        });
        contractCount++;

        // ESCROW & WALLET logic
        const clientUserId = clientRecords.find(c => c.profile.id === project.clientId)!.user.id;
        contractRecords.push({ contract, project, student, clientUserId });
        
        // Lock Escrow
        const platformFee = project.budget * 0.1;
        const escrow = await prisma.escrow.create({
          data: { contractId: contract.id, amount: project.budget, platformFee, isFunded: true, fundedAt: contract.startedAt, walletId: (await prisma.wallet.findUnique({where: {userId: clientUserId}}))!.id }
        });

        // Record Transaction for lock
        await prisma.transaction.create({
          data: { walletId: escrow.walletId, amount: project.budget + platformFee, type: 'ESCROW_LOCK', status: 'SUCCESS', reference: contract.id }
        });

        if (cStatus === ProjectStatus.COMPLETED) {
          // Release Escrow
          await prisma.escrow.update({ where: { id: escrow.id }, data: { isReleased: true, releasedAt: contract.completedAt! } });
          
          // Transactions for release
          await prisma.transaction.create({ data: { walletId: escrow.walletId, amount: project.budget, type: 'ESCROW_RELEASE', status: 'SUCCESS', reference: contract.id } });
          const stuWallet = await prisma.wallet.findUnique({ where: { userId: student.userId } });
          await prisma.transaction.create({ data: { walletId: stuWallet!.id, amount: project.budget - platformFee, type: 'DEPOSIT', status: 'SUCCESS', reference: contract.id } });

          // Create Review
          await prisma.review.create({
            data: { contractId: contract.id, reviewerId: clientUserId, revieweeId: student.userId, rating: 5, feedback: 'Excellent work from this Pune talent!', reviewerRole: Role.CLIENT, revieweeRole: Role.STUDENT }
          });
        }
      }
    }
  }

  console.log(`✅ ${appCount} Applications and ${contractCount} Contracts seeded with Escrow logic`);

  // ─────────────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────
  let notificationCount = 0;
  for (const { contract, project, student, clientUserId } of contractRecords) {
    const isCompleted = contract.status === ProjectStatus.COMPLETED;

    await prisma.notification.create({
      data: {
        userId: student.userId, type: 'APPLICATION_ACCEPTED', title: 'Application Accepted!',
        message: `You've been hired for "${project.title}". Get started once escrow is funded.`,
        actionUrl: `/student/projects/${project.id}`, isRead: false,
      },
    });
    await prisma.notification.create({
      data: {
        userId: clientUserId, type: 'CONTRACT_FUNDED', title: 'Escrow Funded',
        message: `Escrow for "${project.title}" has been funded and the contract is active.`,
        actionUrl: `/client/projects/${project.id}`, isRead: true,
      },
    });
    notificationCount += 2;

    if (isCompleted) {
      await prisma.notification.create({
        data: {
          userId: student.userId, type: 'PAYMENT_RELEASED', title: 'Payment Released',
          message: `Your payment for "${project.title}" has been released to your wallet.`,
          actionUrl: '/student/wallet', isRead: false,
        },
      });
      await prisma.notification.create({
        data: {
          userId: student.userId, type: 'REVIEW_RECEIVED', title: 'New Review Received',
          message: `You received a 5-star review for "${project.title}".`,
          actionUrl: `/student/projects/${project.id}`, isRead: false,
        },
      });
      notificationCount += 2;
    }
  }
  await prisma.notification.create({
    data: { userId: adminUser.id, type: 'SYSTEM_ALERT', title: 'Weekly Platform Summary', message: 'Platform activity report is ready for review.', isRead: false },
  });
  notificationCount++;
  console.log(`✅ ${notificationCount} Notifications seeded`);

  // ─────────────────────────────────────────────────────────────────
  // MESSAGES / CONVERSATIONS
  // ─────────────────────────────────────────────────────────────────
  let messageCount = 0;
  const conversationPairs = contractRecords.slice(0, 4);
  for (const { project, student, clientUserId } of conversationPairs) {
    const conversation = await prisma.conversation.create({
      data: {
        lastMessage: 'Sounds good, looking forward to it!',
        lastMessageAt: new Date(),
        participants: {
          create: [
            { userId: clientUserId, unreadCount: 0 },
            { userId: student.userId, unreadCount: 1 },
          ],
        },
      },
    });

    const thread = [
      { senderId: clientUserId, content: `Hi! Excited to have you on board for "${project.title}".` },
      { senderId: student.userId, content: 'Thank you! I will start right away and keep you updated.' },
      { senderId: clientUserId, content: 'Great, let me know if you need any clarification on requirements.' },
      { senderId: student.userId, content: 'Sounds good, looking forward to it!' },
    ];
    for (const [idx, m] of thread.entries()) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id, senderId: m.senderId, content: m.content,
          isRead: idx < thread.length - 1, createdAt: new Date(Date.now() - (thread.length - idx) * 3600000),
        },
      });
      messageCount++;
    }
  }
  console.log(`✅ ${messageCount} Messages across ${conversationPairs.length} Conversations seeded`);

  // ─────────────────────────────────────────────────────────────────
  // DISPUTES
  // ─────────────────────────────────────────────────────────────────
  const disputeCandidates = contractRecords.filter(c => c.contract.status === ProjectStatus.IN_PROGRESS).slice(0, 2);
  for (const [idx, { contract, project, student, clientUserId }] of disputeCandidates.entries()) {
    await prisma.dispute.create({
      data: {
        contractId: contract.id,
        filedById: clientUserId,
        filedAgainst: student.userId,
        reason: `Deliverables for "${project.title}" are behind the agreed timeline.`,
        evidence: 'See attached screenshots of the project board showing missed checkpoints.',
        status: idx === 0 ? 'OPEN' : 'UNDER_INVESTIGATION',
      },
    });
  }
  console.log(`✅ ${disputeCandidates.length} Disputes seeded`);

  console.log('\n🎉 Pune Demo Dataset seeding complete!');
  console.log('\n📝 Test Accounts (Password for all except Admin is Pass123!):');
  console.log('  Admin:     admin@talentmesh.in / Admin123!');
  console.log('  Client:    rahul@techsolutions.in');
  console.log('  TPO:       milind@coep.org.in');
  console.log('  TPO (SCOE): sunil@scoe.edu.in');
  console.log('  Recruiter: sunita@tcs.com');
  console.log('  Student:   rohan0@student.in (Elite, COEP)');
  console.log('  Student:   siddharth15@student.in (Beginner, COEP)\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
