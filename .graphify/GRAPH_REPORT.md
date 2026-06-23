# Graph Report - .  (2026-06-05)

## Corpus Check
- Large corpus: 1828 files · ~19,25,898 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 1233 nodes · 750 edges · 91 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: contains: 358 · method: 219 · imports: 77 · calls: 57 · imports_from: 39


## Input Scope
- Requested: auto
- Resolved: all (source: default-auto)
- Included files: 1828 · Candidates: recursive
- Excluded: 0 untracked · 0 ignored · 3 sensitive · 0 missing committed
## God Nodes (most connected - your core abstractions)
1. `Card` - 12 edges
2. `CardContent` - 12 edges
3. `StudentsController` - 11 edges
4. `StudentsService` - 11 edges
5. `ContractsService` - 10 edges
6. `ProjectsService` - 10 edges
7. `DashboardLayout()` - 10 edges
8. `CardHeader` - 10 edges
9. `CardTitle` - 10 edges
10. `CardDescription` - 10 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (34): fraudAlerts, moderationQueue, platformData, revenueData, activeProjects, chartData, StatCard(), StatCardProps (+26 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (16): CStringGetDatum(), DatumGetCString(), DatumGetFloat4(), DatumGetFloat8(), DatumGetInt32(), DatumGetInt64(), DatumGetName(), DatumGetPointer() (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (10): geistMono, geistSans, metadata, Theme, ThemeContext, ThemeContextType, ThemeProvider(), useTheme() (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.21
Nodes (13): BTPageGetDeleteXid(), BTPageIsRecyclable(), BTreeTupleGetHeapTID(), BTreeTupleGetMaxHeapTID(), BTreeTupleGetNPosting(), BTreeTupleGetPosting(), BTreeTupleGetPostingN(), BTreeTupleGetPostingOffset() (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (2): GetRmgr(), RmgrIdExists()

### Community 6 - "Community 6"
Cohesion: 0.18
Nodes (1): StudentsController

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (1): StudentsService

### Community 8 - "Community 8"
Cohesion: 0.31
Nodes (1): ContractsService

### Community 9 - "Community 9"
Cohesion: 0.27
Nodes (1): ProjectsService

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (2): AuthService, AuthTokens

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (1): ContractsController

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (1): LeaderboardService

### Community 17 - "Community 17"
Cohesion: 0.22
Nodes (2): NotificationsService, SendNotificationDto

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (1): ProjectsController

### Community 19 - "Community 19"
Cohesion: 0.25
Nodes (1): AdminController

### Community 20 - "Community 20"
Cohesion: 0.25
Nodes (1): AdminService

### Community 21 - "Community 21"
Cohesion: 0.32
Nodes (1): AnalyticsService

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (1): ApplicationsController

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (1): ApplicationsService

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (1): AuthController

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (1): RecommendationEngine

### Community 26 - "Community 26"
Cohesion: 0.25
Nodes (1): TpoController

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (1): TpoService

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (1): AnalyticsController

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (1): LeaderboardController

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (1): ReputationWorker

### Community 31 - "Community 31"
Cohesion: 0.29
Nodes (1): WalletController

### Community 32 - "Community 32"
Cohesion: 0.29
Nodes (1): WalletService

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (1): PrismaService

### Community 34 - "Community 34"
Cohesion: 0.33
Nodes (5): ForgotPasswordDto, LoginDto, RefreshTokenDto, ResetPasswordDto, SignupDto

### Community 35 - "Community 35"
Cohesion: 0.33
Nodes (1): ClientsController

### Community 36 - "Community 36"
Cohesion: 0.33
Nodes (1): ClientsService

### Community 37 - "Community 37"
Cohesion: 0.33
Nodes (1): DisputesController

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (1): DisputesService

### Community 39 - "Community 39"
Cohesion: 0.33
Nodes (1): NotificationsController

### Community 40 - "Community 40"
Cohesion: 0.40
Nodes (1): ReputationEngine

### Community 41 - "Community 41"
Cohesion: 0.33
Nodes (1): RecruitersController

### Community 42 - "Community 42"
Cohesion: 0.33
Nodes (1): RecruitersService

### Community 43 - "Community 43"
Cohesion: 0.33
Nodes (1): SkillsController

### Community 44 - "Community 44"
Cohesion: 0.33
Nodes (1): SkillsService

### Community 45 - "Community 45"
Cohesion: 0.33
Nodes (1): UsersController

### Community 46 - "Community 46"
Cohesion: 0.33
Nodes (1): UsersService

### Community 47 - "Community 47"
Cohesion: 0.47
Nodes (3): ERR_COMMON_ERROR(), ERR_FATAL_ERROR(), ERR_GET_RFLAGS()

### Community 48 - "Community 48"
Cohesion: 0.40
Nodes (1): RecommendationsController

### Community 49 - "Community 49"
Cohesion: 0.40
Nodes (1): ReviewsController

### Community 50 - "Community 50"
Cohesion: 0.40
Nodes (1): ReviewsService

### Community 51 - "Community 51"
Cohesion: 0.40
Nodes (4): AddCertificationDto, AddSkillDto, StudentSearchDto, UpdateStudentProfileDto

### Community 52 - "Community 52"
Cohesion: 0.60
Nodes (3): cn(), Button(), buttonVariants

### Community 55 - "Community 55"
Cohesion: 0.50
Nodes (1): RolesGuard

### Community 56 - "Community 56"
Cohesion: 0.50
Nodes (2): ApiResponse, TransformInterceptor

### Community 57 - "Community 57"
Cohesion: 0.50
Nodes (1): JwtStrategy

### Community 58 - "Community 58"
Cohesion: 0.50
Nodes (3): ApproveDeliverableDto, FileDisputeDto, SubmitDeliverableDto

### Community 59 - "Community 59"
Cohesion: 0.50
Nodes (3): CreateProjectDto, ProjectQueryDto, UpdateProjectDto

### Community 62 - "Community 62"
Cohesion: 1.00
Nodes (2): fastgetattr(), heap_getattr()

### Community 63 - "Community 63"
Cohesion: 1.00
Nodes (2): index_getattr(), IndexInfoFindDataOffset()

### Community 65 - "Community 65"
Cohesion: 0.67
Nodes (1): prisma

### Community 66 - "Community 66"
Cohesion: 0.67
Nodes (2): JOB_NAMES, QUEUE_NAMES

### Community 67 - "Community 67"
Cohesion: 0.67
Nodes (1): HttpExceptionFilter

### Community 68 - "Community 68"
Cohesion: 0.67
Nodes (1): LoggingInterceptor

### Community 69 - "Community 69"
Cohesion: 0.67
Nodes (2): CreateApplicationDto, UpdateApplicationStatusDto

### Community 70 - "Community 70"
Cohesion: 0.67
Nodes (2): DisputeOutcome, ResolveDisputeDto

### Community 71 - "Community 71"
Cohesion: 0.67
Nodes (2): DepositDto, WithdrawDto

### Community 73 - "Community 73"
Cohesion: 1.00
Nodes (2): c99_snprintf(), c99_vsnprintf()

### Community 77 - "Community 77"
Cohesion: 1.00
Nodes (1): AdminModule

### Community 78 - "Community 78"
Cohesion: 1.00
Nodes (1): AnalyticsModule

### Community 79 - "Community 79"
Cohesion: 1.00
Nodes (1): ApplicationsModule

### Community 80 - "Community 80"
Cohesion: 1.00
Nodes (1): AuthModule

### Community 81 - "Community 81"
Cohesion: 1.00
Nodes (1): AppModule

### Community 82 - "Community 82"
Cohesion: 1.00
Nodes (1): CurrentUser

### Community 85 - "Community 85"
Cohesion: 1.00
Nodes (1): configValidationSchema

### Community 86 - "Community 86"
Cohesion: 1.00
Nodes (1): DatabaseModule

### Community 88 - "Community 88"
Cohesion: 1.00
Nodes (1): JwtAuthGuard

### Community 89 - "Community 89"
Cohesion: 1.00
Nodes (1): JwtPayload

### Community 90 - "Community 90"
Cohesion: 1.00
Nodes (1): ClientsModule

### Community 91 - "Community 91"
Cohesion: 1.00
Nodes (1): ContractsModule

### Community 92 - "Community 92"
Cohesion: 1.00
Nodes (1): DisputesModule

### Community 93 - "Community 93"
Cohesion: 1.00
Nodes (1): LeaderboardModule

### Community 94 - "Community 94"
Cohesion: 1.00
Nodes (1): NotificationsModule

### Community 95 - "Community 95"
Cohesion: 1.00
Nodes (1): ProjectsModule

### Community 96 - "Community 96"
Cohesion: 1.00
Nodes (1): RecommendationsModule

### Community 97 - "Community 97"
Cohesion: 1.00
Nodes (1): RecruitersModule

### Community 98 - "Community 98"
Cohesion: 1.00
Nodes (1): CreateReviewDto

### Community 99 - "Community 99"
Cohesion: 1.00
Nodes (1): ReviewsModule

### Community 100 - "Community 100"
Cohesion: 1.00
Nodes (1): CreateSkillDto

### Community 101 - "Community 101"
Cohesion: 1.00
Nodes (1): SkillsModule

### Community 102 - "Community 102"
Cohesion: 1.00
Nodes (1): StudentsModule

### Community 103 - "Community 103"
Cohesion: 1.00
Nodes (1): TpoModule

### Community 104 - "Community 104"
Cohesion: 1.00
Nodes (1): UsersModule

### Community 105 - "Community 105"
Cohesion: 1.00
Nodes (1): WalletModule

### Community 110 - "Community 110"
Cohesion: 1.00
Nodes (1): nextConfig

### Community 113 - "Community 113"
Cohesion: 1.00
Nodes (1): config

## Knowledge Gaps
- **87 isolated node(s):** `platformData`, `revenueData`, `moderationQueue`, `fraudAlerts`, `chartData` (+82 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 5`** (2 nodes): `GetRmgr()`, `RmgrIdExists()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (1 nodes): `StudentsController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (1 nodes): `StudentsService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (1 nodes): `ContractsService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (1 nodes): `ProjectsService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (2 nodes): `AuthService`, `AuthTokens`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `ContractsController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `LeaderboardService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `NotificationsService`, `SendNotificationDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `ProjectsController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `AdminController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `AdminService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `AnalyticsService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `ApplicationsController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `ApplicationsService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `AuthController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `RecommendationEngine`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `TpoController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `TpoService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `AnalyticsController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `LeaderboardController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `ReputationWorker`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `WalletController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `WalletService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `PrismaService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `ClientsController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `ClientsService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `DisputesController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `DisputesService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `NotificationsController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `ReputationEngine`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `RecruitersController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `RecruitersService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `SkillsController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `SkillsService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `UsersController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `UsersService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `RecommendationsController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `ReviewsController`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `ReviewsService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `RolesGuard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (2 nodes): `ApiResponse`, `TransformInterceptor`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `JwtStrategy`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (2 nodes): `fastgetattr()`, `heap_getattr()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (2 nodes): `index_getattr()`, `IndexInfoFindDataOffset()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (1 nodes): `prisma`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (2 nodes): `JOB_NAMES`, `QUEUE_NAMES`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (1 nodes): `HttpExceptionFilter`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (1 nodes): `LoggingInterceptor`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (2 nodes): `CreateApplicationDto`, `UpdateApplicationStatusDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (2 nodes): `DisputeOutcome`, `ResolveDisputeDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (2 nodes): `DepositDto`, `WithdrawDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (2 nodes): `c99_snprintf()`, `c99_vsnprintf()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (1 nodes): `AdminModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (1 nodes): `AnalyticsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (1 nodes): `ApplicationsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (1 nodes): `AuthModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (1 nodes): `AppModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (1 nodes): `CurrentUser`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (1 nodes): `configValidationSchema`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (1 nodes): `DatabaseModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (1 nodes): `JwtAuthGuard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (1 nodes): `JwtPayload`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (1 nodes): `ClientsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (1 nodes): `ContractsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (1 nodes): `DisputesModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (1 nodes): `LeaderboardModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 94`** (1 nodes): `NotificationsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 95`** (1 nodes): `ProjectsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 96`** (1 nodes): `RecommendationsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 97`** (1 nodes): `RecruitersModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 98`** (1 nodes): `CreateReviewDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (1 nodes): `ReviewsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 100`** (1 nodes): `CreateSkillDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 101`** (1 nodes): `SkillsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (1 nodes): `StudentsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 103`** (1 nodes): `TpoModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (1 nodes): `UsersModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 105`** (1 nodes): `WalletModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 110`** (1 nodes): `nextConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 113`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Navbar()` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **What connects `platformData`, `revenueData`, `moderationQueue` to the rest of the system?**
  _87 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08106473079249849 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07207207207207207 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09359605911330049 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._