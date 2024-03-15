
import express, {Response, Request} from 'express';
import { getNameById } from '../utils/utils';
import { getHolidayRequests } from '../utils/dataManager';
import { approveRequest, rejectRequest } from '../utils/holidayManager';
import { HolidayRequest } from '../types/types';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    const holidayRequests: HolidayRequest[] = getHolidayRequests();
    res.render('requests', {holidayRequests, getNameById});
});

router.post('/approve/:requestId', (req, res) => {
    const { requestId } = req.params;
    console.log(1);
    approveRequest(Number(requestId));
    res.sendStatus(200); // You might want to send back a more meaningful response
});

router.post('/reject/:requestId', (req, res) => {
    const { requestId } = req.params;
    rejectRequest(Number(requestId));
    res.sendStatus(200);
});

export default router;
