import { BaseQueue } from '@service/queues/base.queue';
import { IUserJob } from '@user/interfaces/user.interface';
import { userWorker } from '@worker/user.worker';

const UserQueue = BaseQueue('user');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addUserJob = (name: string, data: IUserJob): void => {
  UserQueue.addJob(name, data);
};

UserQueue.processJob('addUserToDB', 5, userWorker.addUserToDB);

export { addUserJob };
export default UserQueue;
