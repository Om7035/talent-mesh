export declare enum DisputeOutcome {
    RELEASE = "RELEASE",
    REFUND = "REFUND",
    SPLIT = "SPLIT"
}
export declare class ResolveDisputeDto {
    resolution: string;
    outcome: DisputeOutcome;
}
