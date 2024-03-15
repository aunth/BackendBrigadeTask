import express, {Response, Request} from 'express';
import { HolidayRequest} from '../types/types';
import { getEmployees, getHolidayRequests, updateHolidayRequest} from '../utils/dataManager';
import { validateRequestDates, checkHolidayConflicts, isDuplicateRequest, getPublicHolidays} from '../utils/holidayManager';
import { findEmploee } from '../utils/utils';


const router = express.Router();


router.get('/', async(req: Request, res: Response) => {
    const error = req.query.error;
    const employeeId = req.query.employeeId as string;
    const publicHolidays = await getPublicHolidays(employeeId);
    const holidayRequests: HolidayRequest[] = getHolidayRequests().filter(request => request.employeeId.toString() === employeeId && request.status === "pending");
    res.render('update-request', {error: error, publicHolidays: publicHolidays, holidayRequests: holidayRequests, employeeId: employeeId});
});

router.put('/', async(req: Request, res: Response) => {
    const { idForRequest, employeeId, startDate, endDate } = req.body;
    const requestID = Number(idForRequest);
    
    
    if (!employeeId || !startDate || !endDate || !idForRequest) {
        return res.json({success: true, redirectUrl: `/update-request?error=Invalid input&employeeId=${employeeId}`});
    }

    let holidayRequests = getHolidayRequests();
    const requestIndex = holidayRequests.findIndex(request => request.idForRequest === requestID);
    let employees = getEmployees();
    const employee = findEmploee(employees, Number(employeeId));

    if (!employee){
        return res.json({success: true, redirectUrl: `/update-request?error=Employee not found&employeeId=${employeeId}`});
    }

    if (requestIndex === -1) {
        return res.json({success: true, redirectUrl: `/update-request?error=Request not found&employeeId=${employeeId}`});
    }

    const validationError = validateRequestDates(startDate, endDate, employee);
    if (validationError) {
        return res.json({success: true, redirectUrl: `/update-request?error=${encodeURIComponent(validationError)}&employeeId=${employeeId}`});
    }

    const holidayConflict = await checkHolidayConflicts(startDate, endDate, employeeId);
    if (holidayConflict) {
        return res.json({success: true, redirectUrl: `/update-request?error=${encodeURIComponent(holidayConflict)}&employeeId=${employeeId}`});
    }

    // Updating the found request
    const updatedRequest: HolidayRequest = {
        ...holidayRequests[requestIndex],
        startDate: new Date(startDate),
        endDate: new Date(endDate)
    };

    if (isDuplicateRequest(updatedRequest)) {
        return res.json({success: true, redirectUrl: `/update-request?error=Duplicate holiday request detected.&employeeId=${employeeId}`});
      } else {
        updateHolidayRequest(requestID, updatedRequest);
      }

    console.log(`User with id ${updatedRequest.employeeId} updated their Holiday Request ` + 
                `from ${updatedRequest.startDate.toLocaleDateString('en-CA')} ` + 
                `to ${updatedRequest.endDate.toLocaleDateString('en-CA')}`);


    res.json({ success: true, redirectUrl: '/requests' })
});

export default router;