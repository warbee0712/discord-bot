import { Collections } from './collections';
import { model } from 'mongoose';
import { userSchema, User } from './user';
import { UserSuspension } from './user-suspension';
import { userSuspendSchema } from '../APIs/mongo-suspend';
import { UserLog, userLogSchema } from './user-log';

/**
 * Initializes, and holds all models by their collection
 */
export const models = {
  [Collections.USER]: model<User>(Collections.USER, userSchema),
  [Collections.USER_SUSPENSIONS]: model<UserSuspension>(
    Collections.USER_SUSPENSIONS,
    userSuspendSchema
  ),
  [Collections.USER_LOGS]: model<UserLog>(Collections.USER_LOGS, userLogSchema)
};
