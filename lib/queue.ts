import PQueue from "p-queue";

export const summarizeQueue = new PQueue({ concurrency: 10 });
export const translateQueue = new PQueue({ concurrency: 10 });
export const drawQueue = new PQueue({ concurrency: 1 });
export const modifyQueue = new PQueue({ concurrency: 1 });
