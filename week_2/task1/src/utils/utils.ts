
import { Employee, HolidayRequest} from '../types/types';
import { getEmployees } from './dataManager';

export const employeesFilename = './data/employees.json';
export const holidaysFilename = './data/holidays.json';


export function increaseUserHolidays(employeeId: number, daysNum: number) {
  const employees: Employee[] = getEmployees();
  const user = employees.find(employee => employee.id === employeeId);

  if (user) {
    user.remainingHolidays += daysNum;
  }
  return employees;
}

export function getDaysNum(request: HolidayRequest) {
  const endDate = new Date(request.endDate);
  const startDate = new Date(request.startDate);

  return (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1
}


export function getNameById(id: number): string | undefined {
    const employees: Employee[] = getEmployees();
    const user = employees.find(employee => employee.id === id);
  
    if (!user) {
      return undefined;
    }
    return user.name;
}

export function getCountryById(id: number): string {
  const employees: Employee[] = getEmployees();
  const employee = employees.find(employee => employee.id === id);
  return employee ? employee.country : "";
}

export function findEmploee(employees: Employee[], empId: number){
  return employees.find(emp => emp.id === empId);
}
