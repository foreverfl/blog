import PQueue from "p-queue";

export const summaryQueue = new PQueue({ concurrency: 1 }); 
export const translationQueue = new PQueue({ concurrency: 1 });
export const drawQueue = new PQueue({ concurrency: 1 });