"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOB_NAMES = exports.QUEUE_NAMES = void 0;
exports.QUEUE_NAMES = {
    REPUTATION: 'reputation-engine',
    RECOMMENDATIONS: 'recommendation-engine',
    LEADERBOARD: 'leaderboard-sync',
    NOTIFICATIONS: 'notifications',
    ANALYTICS: 'analytics-snapshot',
};
exports.JOB_NAMES = {
    REPUTATION: {
        RECALCULATE: 'recalculate-reputation',
    },
    RECOMMENDATIONS: {
        GENERATE_FOR_STUDENT: 'generate-for-student',
        GENERATE_FOR_PROJECT: 'generate-for-project',
    },
    LEADERBOARD: {
        REBUILD_GLOBAL: 'rebuild-global',
        REBUILD_COLLEGE: 'rebuild-college',
    },
    NOTIFICATIONS: {
        SEND: 'send-notification',
        SEND_BULK: 'send-bulk-notification',
    },
    ANALYTICS: {
        SNAPSHOT_PLATFORM: 'snapshot-platform',
        SNAPSHOT_COLLEGE: 'snapshot-college',
        SNAPSHOT_STUDENT: 'snapshot-student',
    },
};
//# sourceMappingURL=queues.constants.js.map