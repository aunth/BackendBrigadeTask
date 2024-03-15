import express, {Response, Request} from 'express';
import { HolidayRequest} from '../types/types';
import { getEmployees, getHolidayRequests, saveHolidayRequest} from '../utils/dataManager';
import { validateRequestDates, checkHolidayConflicts, isDuplicateRequest, getPublicHolidays} from '../utils/holidayManager';
import { findEmploee } from '../utils/utils';

const router = express.Router();


router.get('/', async(req: Request, res: Response) => {
    const error = req.query.error;
    const employeeId = req.query.employeeId as string
    const publicHolidays = await getPublicHolidays(employeeId);
    res.render('add-request', {error: error, publicHolidays: publicHolidays, employeeId: employeeId});
});

router.post('/',  async(req: Request, res: Response) => {

    const {employeeId, startDate, endDate} = req.body;
   
    
    if (!employeeId || !startDate || !endDate) {
        return res.redirect(`add-request?error=Invalid input&employeeId=${employeeId}`);
    }

    let employees = getEmployees();
    let holidayRequests = getHolidayRequests();
    

    const employee = findEmploee(employees, Number(employeeId));
    if (!employee){
        return res.redirect(`/add-request?error=Employee not found&employeeId=${employeeId}`);
    }

    const validationError = validateRequestDates(startDate, endDate, employee);
    if (validationError) {
        return res.redirect(`/add-request?error=${encodeURIComponent(validationError)}&employeeId=${employeeId}`);
    }

    // Check for conflicts with public holidays

    const holidayConflict = await checkHolidayConflicts(startDate, endDate, employeeId);
    if (holidayConflict) {
        return res.redirect(`/add-request?error=${encodeURIComponent(holidayConflict)}&employeeId=${employeeId}`);
    }


    const newRequest: HolidayRequest = {
        idForRequest: holidayRequests.length + 1,
        employeeId: Number(employeeId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'pending',
    };

    if (isDuplicateRequest(newRequest)) {
        return res.redirect(`/add-request?error=Duplicate holiday request detected.&employeeId=${employeeId}`);
      } else {
        saveHolidayRequest(newRequest);
      }

    console.log(`User with ${newRequest.employeeId} id create new Holiday Request ` + 
                `from ${newRequest.startDate.toLocaleDateString('en-CA')} ` + 
                `to ${newRequest.endDate.toLocaleDateString('en-CA')}`)

    res.redirect('/requests');

});


export default router;