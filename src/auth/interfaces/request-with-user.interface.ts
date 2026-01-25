import { Request } from 'express';
import { User } from '../../entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
  sessionId?: string;
  headers: any;
  accessToken?: string;
}

export default RequestWithUser;
