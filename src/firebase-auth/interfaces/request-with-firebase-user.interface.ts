import { Request } from 'express';
import { FirebaseUser } from '../../entities/firebase.user.entity';

interface RequestWithFirebaseUser extends Request {
  user: FirebaseUser;
  sessionId?: string;
  headers: any;
  accessToken?: string;
}

export default RequestWithFirebaseUser;
