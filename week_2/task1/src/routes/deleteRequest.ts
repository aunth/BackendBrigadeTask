
import express, {Response, Request} from 'express'
import { getNameById } from '../utils/utils';
import { getEmployees, getHolidayRequests, deleteRequest } from '../utils/dataManager';
import { HolidayRequest } from '../types/types';

const router = express.Router();

router.get('/', async(req: Request, res: Response) => {
	const employees = getEmployees();
	const employee = employees.filter((emp) => emp.id === Number(req.query.employeeId));

	if (employee.length == 0) {
		return res.render('deleteRequest', {error: "There is not user with this id"});
	}
	const allRequests: HolidayRequest[] = getHolidayRequests();

    const employeeHolidayRequests = allRequests.filter(request => request.employeeId == employee[0].id);


	res.render('deleteRequest', {holidayRequests: employeeHolidayRequests, getNameById});
})

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const requestId = req.params.id;

        const success = deleteRequest(Number(requestId));

        if (success) {
            res.status(200).json({ message: 'Request was deleted' });
        } else {
            res.status(500).send('Failed to delete holiday request');
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).send('Internal server error');
    }
});



export default router;