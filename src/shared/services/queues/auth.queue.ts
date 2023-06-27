import { IAuthJob } from '@auth/interfaces/auth.interface';
import { BaseQueue } from '@service/queues/base.queue';
import { authWorker } from '@worker/auth.worker';

const AuthQueue = BaseQueue('auth');

const addAuthUserJob = (name: string, data: IAuthJob): void => {
  AuthQueue.addJob(name, data);
};

AuthQueue.processJob('addAuthUserToDB', 5, authWorker.addAuthUserToDB);

export { addAuthUserJob };
export default AuthQueue;
