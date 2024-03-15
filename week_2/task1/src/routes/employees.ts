
import { Employee, HolidayRequest } from '../types/types';
import { getEmployees, getHolidayRequests } from '../utils/dataManager';
import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    const employees: Employee[] =  getEmployees();
    const holidayRequests: HolidayRequest[] = getHolidayRequests();
    res.render('employees', {employees, holidayRequests});
});

export default router;
