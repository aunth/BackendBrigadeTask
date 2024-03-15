import axios from 'axios';
import { Employee, Holiday, HolidayRequest } from '../types/types';
import { getEmployees, getHolidayRequests } from './dataManager';
import { getCountryById } from './utils';
import { holidayRulesByDepartment } from '../../data/dataStore';
import { getDaysNum } from '../utils/utils';
import { updateEmployeeRemainingHolidays } from './dataManager';
import * as fs from 'fs';

export const employeesFilename = './data/employees.json';
export const holidaysFilename = './data/holidays.json';


export async function getNextPublicHolidays(countryCode: string) {
    try {
      const response = await axios.get(`https://date.nager.at/api/v3/NextPublicHolidays/${countryCode}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
          console.error('Error fetching public holidays:', error.message);
          console.error('Response status:', error.response?.status);
          console.error('Response data:', error.response?.data);
      } else {
          console.error('An unexpected error occurred:', error);
      }
      return []; 
    }
}

export function validateRequestDates(startDate: string, endDate: string, employee: Employee) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
        return 'Start date must be before end date';
    }
  
    const dayDifference = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1;
    if (dayDifference > holidayRulesByDepartment[employee.department].maxConsecutiveDays) {
        return 'Exceeds maximum consecutive holiday days';
    } else if (employee.remainingHolidays < dayDifference) {
        return 'Insufficient remaining holiday days';
    }
  
    // Check for blackout periods
    const hasBlackoutPeriod = holidayRulesByDepartment[employee.department].blackoutPeriods.some(period => {
      const blackoutStart = new Date(period.start);
      const blackoutEnd = new Date(period.end);
     
      return (start <= blackoutEnd && start >= blackoutStart) || (end <= blackoutEnd && end >= blackoutStart);
    });
  
    if (hasBlackoutPeriod) {
      return 'Request falls within a blackout period';
    }
    
    return null;
}

function updateHolidayRequestStatus(requestId: number, status: 'pending' | 'approved' | 'rejected') {
  try {
      const rawData = fs.readFileSync(holidaysFilename, 'utf-8');
      let jsonData: HolidayRequest[] = JSON.parse(rawData);
      
      const requestIndex = jsonData.findIndex(request => request.idForRequest === requestId);
      
      if (requestIndex !== -1) {
          jsonData[requestIndex].status = status;
          fs.writeFileSync(holidaysFilename, JSON.stringify(jsonData, null, 2));
          console.log(`Holiday request ${requestId} status updated to ${status}.`);
      } else {
          console.error(`Holiday request with ID ${requestId} not found.`);
      }
  } catch (error) {
      console.error('Error updating holiday request status:', error);
  }
}

export async function getPublicHolidays(employeeId: string) {
    const empId = Number(employeeId);
    const countryCode = getCountryById(empId);
    return await getNextPublicHolidays(countryCode);
}

export async function checkHolidayConflicts(startDate: Date, endDate: Date, employeeId: string) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const holidays = await getPublicHolidays(employeeId);
      const holidayConflict = holidays.filter((holiday: Holiday) => {
        const holidayDate = new Date(holiday.date);
        return start <= holidayDate && holidayDate <= end;
      });
  
      if (holidayConflict.length > 0) {
        let dates = holidayConflict.map((holiday: Holiday) => holiday.date).join(', ');
        return `Request conflicts with a public holiday (${dates}). Please choose different dates.`;
      }
      
      return null;
    } catch (error) {
      console.error("Failed to check for holiday conflicts:", error);
    }
}

export function isDuplicateRequest(newRequest: HolidayRequest): boolean {
    const holidayRequests = getHolidayRequests();
  
    const duplicate = holidayRequests.some(request => {
      if (request.employeeId === newRequest.employeeId) {
  
        const existingStartDate = new Date(request.startDate);
        const existingEndDate = new Date(request.endDate);
        const newStartDate = new Date(newRequest.startDate);
        const newEndDate = new Date(newRequest.endDate);
  
        const isExactMatch = existingStartDate.getTime() === newStartDate.getTime() && existingEndDate.getTime() === newEndDate.getTime();
  
        return isExactMatch;
      }
      return false;
    });
    return duplicate;
}

export function saveHolidayRequests(requests: HolidayRequest[]) {
  try {
    const jsonData = JSON.stringify(requests, null, 2);
    fs.writeFileSync(holidaysFilename, jsonData);
    console.log(`Holiday requests saved to ${holidaysFilename}`);
  } catch (error) {
    console.error(`Error saving holiday requests to ${holidaysFilename}:`, error);
  }
}

export function rejectRequest(requestId: number) {
  updateHolidayRequestStatus(requestId, 'rejected');
  console.log(`Request with ${requestId} was rejected`);
}


export function approveRequest(requestId: number) {
  const holidayRequest = getHolidayRequests(requestId);

  if (holidayRequest.length == 0) {
      console.error('Holiday request not found');
      return;
  }

  let employee = getEmployees(holidayRequest[0].employeeId);

  if (!employee) {
      console.error('Employee not found');
      return;
  }

  const takenDays = getDaysNum(holidayRequest[0]);

  if (takenDays >= 0) {
      updateHolidayRequestStatus(requestId, 'approved');
      updateEmployeeRemainingHolidays(employee[0].id, takenDays);
      console.log('Request approved');
  } else {
      console.log('Insufficient remaining holidays');
  }
}