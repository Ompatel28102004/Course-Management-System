import { Router } from "express";

import { 
    getCommunityMessages,DeleteMessage,getCommunityDetails
} from '../controller/MessageController.js';

import { verifyToken } from '../middlewares/AuthMiddleware.js';

const MessageRoutes = Router();

// Route to delete a TA
// MessageRoutes.delete('/delete/:messageId',verifyToken, DeleteMessage);
MessageRoutes.get('/getmessage/:communityId',verifyToken, getCommunityMessages);
MessageRoutes.get('/getcommunity/:communityId',verifyToken, getCommunityDetails);

export default MessageRoutes;