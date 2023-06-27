import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { addUserData } from '@service/db/user.service';

const log: Logger = config.createLogger('userWorker');

function addUserToDB(job: Job, done: DoneCallback): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const { value } = job.data;

    addUserData(value)
      .then(() => {
        job.progress(100);
        done(null, job.data);
        resolve();
      })
      .catch((error) => {
        log.error(error);
        done(error as Error);
        reject(error);
      });
  });
}

const userWorker = {
  addUserToDB: addUserToDB
};

export { userWorker };
