import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { createAuthUser } from '@service/db/auth.service';

const log: Logger = config.createLogger('authWorker');

async function addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
  try {
    const { value } = job.data;
    await createAuthUser(value);
    job.progress(100);
    done(null, job.data);
  } catch (error) {
    log.error(error);
    done(error as Error);
    throw error;
  }
}

const authWorker = {
  addAuthUserToDB: addAuthUserToDB
};

export { authWorker };

/*
The overall flow can be summarized as follows:

1) When a job needs to be added to the AuthQueue, the `addAuthUserJob` function is called, passing the job name and data
  whhich in this case is `userDataForCache`

2) The job is added to the AuthQueue  using `base.queue` and stored in Redis.

3) The AuthQueue processes the job named 'addAuthUserToDB' with a concurrency of 5.

4) The authWorker.addAuthUserToDB function is invoked as the worker for the job.

5) The worker retrieves the data from the job and uses the createAuthUser function to add the authentication user
   to the database.

6) Depending on the outcome, the worker updates the job progress, calls the done callback, and resolves or rejects
the promise.

7) The AuthQueue event handlers, such as 'completed', 'global:completed', and 'global:stalled', handle the
corresponding events and perform actions like logging or removing completed jobs.

This architecture allows for the separation of concerns between adding jobs to the queue and processing them using workers.
The queue ensures that the jobs are processed asynchronously, and the worker functions perform the necessary operations,
such as adding the authentication user to the database.
*/
