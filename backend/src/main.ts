import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

  // ─────────────────────────────────────────
  // Security Middleware
  // ─────────────────────────────────────────
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: nodeEnv === 'production',
  }));

  app.use(compression());

  // ─────────────────────────────────────────
  // CORS
  // Vercel generates a new deployment URL on every push (preview and
  // git-branch URLs), so we allow any *.vercel.app subdomain of this
  // project in addition to the configured production FRONTEND_URL.
  // ─────────────────────────────────────────
  const allowedOrigins = [frontendUrl, 'http://localhost:3000'];
  const vercelPreviewPattern = /^https:\/\/talent-mesh[a-z0-9-]*\.vercel\.app$/;

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    credentials: true,
  });

  // ─────────────────────────────────────────
  // API Versioning
  // ─────────────────────────────────────────
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // ─────────────────────────────────────────
  // Global Pipes, Filters & Interceptors
  // ─────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // ─────────────────────────────────────────
  // Swagger Documentation
  // ─────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('TalentMesh AI API')
      .setDescription(
        '## TalentMesh AI - Talent Intelligence Platform API\n\n' +
        'A production-grade backend for the TalentMesh student freelance marketplace, ' +
        'featuring Reputation Scoring, Recommendation Engine, Escrow workflows, ' +
        'Leaderboards, and Analytics.\n\n' +
        '### Authentication\nUse the `/api/v1/auth/login` endpoint to get a JWT token, ' +
        'then click **Authorize** and enter `Bearer <token>`.',
      )
      .setVersion('1.0.0')
      .setContact('TalentMesh Team', 'https://talentmesh.ai', 'support@talentmesh.ai')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT',
      )
      .addTag('auth', 'Authentication & Authorization')
      .addTag('users', 'User Profile Management')
      .addTag('students', 'Student Profiles & Portfolio')
      .addTag('clients', 'Client Profiles & Projects')
      .addTag('recruiters', 'Recruiter Talent Discovery')
      .addTag('tpo', 'Training & Placement Officers')
      .addTag('admin', 'Platform Administration')
      .addTag('projects', 'Project Marketplace')
      .addTag('applications', 'Project Applications')
      .addTag('contracts', 'Contract & Escrow Workflow')
      .addTag('wallet', 'Wallet & Transactions')
      .addTag('reviews', 'Reviews & Ratings')
      .addTag('skills', 'Skills Management')
      .addTag('recommendations', 'AI Recommendation Engine')
      .addTag('leaderboard', 'Leaderboard Rankings')
      .addTag('analytics', 'Analytics & Reporting')
      .addTag('notifications', 'Notifications')
      .addTag('disputes', 'Dispute Resolution')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    console.log(`\n📖 Swagger Docs → http://localhost:${port}/${apiPrefix}/docs`);
  }

  await app.listen(port);
  console.log(`\n🚀 TalentMesh API running on http://localhost:${port}/${apiPrefix}`);
  console.log(`🌍 Environment: ${nodeEnv}`);
}

bootstrap();
