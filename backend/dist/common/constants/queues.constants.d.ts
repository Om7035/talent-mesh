export declare const QUEUE_NAMES: {
    readonly REPUTATION: "reputation-engine";
    readonly RECOMMENDATIONS: "recommendation-engine";
    readonly LEADERBOARD: "leaderboard-sync";
    readonly NOTIFICATIONS: "notifications";
    readonly ANALYTICS: "analytics-snapshot";
};
export declare const JOB_NAMES: {
    readonly REPUTATION: {
        readonly RECALCULATE: "recalculate-reputation";
    };
    readonly RECOMMENDATIONS: {
        readonly GENERATE_FOR_STUDENT: "generate-for-student";
        readonly GENERATE_FOR_PROJECT: "generate-for-project";
    };
    readonly LEADERBOARD: {
        readonly REBUILD_GLOBAL: "rebuild-global";
        readonly REBUILD_COLLEGE: "rebuild-college";
    };
    readonly NOTIFICATIONS: {
        readonly SEND: "send-notification";
        readonly SEND_BULK: "send-bulk-notification";
    };
    readonly ANALYTICS: {
        readonly SNAPSHOT_PLATFORM: "snapshot-platform";
        readonly SNAPSHOT_COLLEGE: "snapshot-college";
        readonly SNAPSHOT_STUDENT: "snapshot-student";
    };
};
