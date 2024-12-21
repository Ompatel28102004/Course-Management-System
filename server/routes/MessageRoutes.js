import { Router } from "express";

import { 
    getCommunityMessages
} from '../controller/MessageController.js';

import { verifyToken } from '../middlewares/AuthMiddleware.js';

const MessageRoutes = Router();

// Route to delete a TA
// MessageRoutes.put('/addmessage',verifyToken, AddMessage);
MessageRoutes.get('/getmessage/:communityId',getCommunityMessages);
// MessageRoutes.get('/getmessage/:communityId',verifyToken, getCommunityMessages);

export default MessageRoutes;