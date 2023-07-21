import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import mailTransport from '@service/emails/mail.transport';

const addNotificationEmail = async (job: Job, done: DoneCallback): Promise<void> => {
  const log: Logger = config.createLogger('emailWorker');
  const { template, receiverEmail, subject } = job.data;

  try {
    await mailTransport.sendEmail(receiverEmail, subject, template);
    job.progress(100);
    done(null, job.data);
  } catch (error) {
    log.error(error);
    done(error as Error);
  }
};

export default addNotificationEmail;

//////////////////////////////////////////////////////////////////////////////////////////////////////
//using .then

// import { DoneCallback, Job } from 'bull';
// import Logger from 'bunyan';
// import { config } from '@root/config';
// import mailTransport from '@service/emails/mail.transport';

// const addNotificationEmail = (job: Job, done: DoneCallback): void => {
//   const log: Logger = config.createLogger('emailWorker');
//   const { template, receiverEmail, subject } = job.data;

//   mailTransport
//     .sendEmail(receiverEmail, subject, template)
//     .then(() => {
//       job.progress(100);
//       done(null, job.data);
//     })
//     .catch((error: Error) => {
//       log.error(error);
//       done(error);
//     });
// };

// export default addNotificationEmail;
