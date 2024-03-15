import { Employee, HolidayRequest } from '../types/types';
import { increaseUserHolidays, getDaysNum } from './utils';
import { saveHolidayRequests } from './holidayManager';
import * as fs from 'fs';

export const employeesFilename = './data/employees.json';
export const holidaysFilename = './data/holidays.json';

export function getEmployees(id=0): Employee[] {
  try {
    const rawData = fs.readFileSync(employeesFilename, 'utf-8');
    const jsonData: Employee[] = JSON.parse(rawData);

    if (id === 0) {
      return jsonData;
    }
  
    const requestedRequests = jsonData.filter(employee => employee.id === id);
    return requestedRequests;
  } catch (error) {
    console.error('Error reading employees data:', error);
    return [];
  }
}
  
export function getHolidayRequests(id: number = 0): HolidayRequest[] {
  try {
      const rawData = fs.readFileSync(holidaysFilename, 'utf-8');
      const jsonData: HolidayRequest[] = JSON.parse(rawData);

      jsonData.forEach(request => {
          request.startDate = new Date(request.startDate);
          request.endDate = new Date(request.endDate);
      });

      if (id === 0) {
          return jsonData;
      }
      
      const requestedRequests = jsonData.filter(request => request.idForRequest == id);
      return requestedRequests;
  } catch (error) {
      console.error('Error reading holiday requests data:', error);
      return [];
  }
}
  
  export function saveHolidayRequest(newRequest: HolidayRequest): void {
    const holidayRequests = getHolidayRequests();
    holidayRequests.push(newRequest);
  
    try {
      fs.writeFileSync(holidaysFilename, JSON.stringify(holidayRequests, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing holiday requests data:', error);
    }
  }

export function updateHolidayRequest(requestID: number, updatedRequest: HolidayRequest) {
  const holidayRequests = getHolidayRequests();
  const index = holidayRequests.findIndex(request => request.idForRequest === requestID);
    
  if (index === -1) {
    console.error('Request not found');
    return;
  }
  
  holidayRequests[index] = updatedRequest;
  
  try {
    fs.writeFileSync(holidaysFilename, JSON.stringify(holidayRequests, null, 2), 'utf-8');
  } catch (error) {
      console.error('Error writing updated holiday requests data:', error);
        }
}

export function updateEmployeeRemainingHolidays(employeeId: number, takenDays: number) {
  try {
      const rawData = fs.readFileSync(employeesFilename, 'utf-8');
      let jsonData: Employee[] = JSON.parse(rawData);
      
      const employeeIndex = jsonData.findIndex(employee => employee.id === employeeId);
      
      if (employeeIndex !== -1) {
          jsonData[employeeIndex].remainingHolidays -= takenDays;
          fs.writeFileSync(employeesFilename, JSON.stringify(jsonData, null, 2));
          console.log(`Employee ${employeeId} remaining holidays updated.`);
      } else {
          console.error(`Employee with ID ${employeeId} not found.`);
      }
  } catch (error) {
      console.error('Error updating employee remaining holidays:', error);
  }
}

export function deleteRequest(id: number): boolean {
  try {
      const rawData = fs.readFileSync(holidaysFilename, 'utf-8');
      let jsonData: HolidayRequest[] = JSON.parse(rawData);

      const requestIndex = jsonData.findIndex(request => request.idForRequest == id);

      if (requestIndex !== -1) {
          const request = jsonData[requestIndex];
          jsonData.splice(requestIndex, 1);

          const employees = increaseUserHolidays(request.employeeId, getDaysNum(request));

          fs.writeFileSync(holidaysFilename, JSON.stringify(jsonData, null, 2));

          saveHolidayRequests(jsonData);

          saveEmployeesToJson(employees);
          return true;
      } else {
          console.error(`Request with ID ${id} not found.`);
          return false;
      }
  } catch (error) {
      console.error('Error deleting holiday request:', error);
      return false;
  }
}

function saveEmployeesToJson(employees: Employee[]) {
  try {
      const jsonData = JSON.stringify(employees, null, 2);
      
      fs.writeFileSync(employeesFilename, jsonData);
      
      console.log('Changes saved to employees.json');
  } catch (error) {
      console.error('Error saving changes to JSON:', error);
  }
}
