/*
 A basic job queue system using the Bull library  integrated  with a logging system using the
 Bunyan library. Also configures a `server adapter` for the Bull Board, which provides a web
 interface to monitor and manage the job queues.
*/

import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { createBullBoard } from '@bull-board/api';
import { config } from '@root/config';
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { IEmailJob, IUserJob } from '@user/interfaces/user.interface';

type IBaseJobData = IAuthJob | IEmailJob | IUserJob;

let bullAdapters: BullAdapter[] = [];

// web interface to monitor and manage the job queues.
let serverAdapter: ExpressAdapter | null = null;

export const getServerAdapter = (): ExpressAdapter => {
  if (!serverAdapter) {
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');
    createBullBoard({
      queues: bullAdapters,
      serverAdapter
    });
  }
  return serverAdapter;
};

// Create the queue
export const BaseQueue = (queueName: string) => {
  const queue = new Queue(queueName, `${config.REDIS_HOST}`);
  let log: Logger;

  bullAdapters.push(new BullAdapter(queue));
  bullAdapters = [...new Set(bullAdapters)];

  // eslint-disable-next-line
  log = config.createLogger(`${queueName}Queue`);

  queue.on('completed', (job: Job) => {
    job.remove();
  });

  queue.on('global:completed', (jobId: string) => {
    if (log) {
      log.info(`Job ${jobId} completed`);
    }
  });

  queue.on('global:stalled', (jobId: string) => {
    log.info(`Job ${jobId} is stalled`);
  });

  // Add Jobs
  const addJob = (name: string, data: IBaseJobData) => {
    queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
  };

  // Process Jobs
  const processJob = (name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void => {
    queue.process(name, concurrency, callback);
  };

  return {
    addJob,
    processJob
  };
};
