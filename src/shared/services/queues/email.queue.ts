import { BaseQueue } from '@service/queues/base.queue';
import { IEmailJob } from '@user/interfaces/user.interface';
import addNotificationEmail from '@worker/email.worker';

const EmailQueue = BaseQueue('email');

const addEmailJob = (name: string, data: IEmailJob): void => {
  EmailQueue.addJob(name, data);
};

EmailQueue.processJob('forgotPasswordEmail', 5, addNotificationEmail);

export { addEmailJob };
export default EmailQueue;
