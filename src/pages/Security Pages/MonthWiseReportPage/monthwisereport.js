// import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
// import {
//   Row,
//   Col,
//   Card,
//   CardBody,
//   CardTitle,
//   Input,
//   Pagination,
//   PaginationItem,
//   PaginationLink,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Button,
//   FormGroup,
//   Label,
//   InputGroup,
//   Table,
// } from "reactstrap";
// import { connect } from "react-redux";
// import { MDBDataTable } from "mdbreact";
// import { setBreadcrumbItems } from "../../../store/actions";
// import { toast, ToastContainer } from "react-toastify";
// import axios from "axios";
// import PropTypes from "prop-types";
// import { debounce } from "lodash";
// import Papa from "papaparse";
// import DOMPurify from "dompurify";
// import Loader from "components/Loader";
// import Flatpickr from "react-flatpickr";
// import "react-toastify/dist/ReactToastify.css";
// import "flatpickr/dist/themes/material_blue.css";
// import "./monthwisereport.css";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { useNavigate } from "react-router-dom";

// // Constants for API settings
// const ENTRIES_PER_PAGE = 10;
// const BREADCRUMB_ITEMS = [
//   { title: "Security", link: "#" },
//   { title: "Reports", link: "#" },
//   { title: "Month Wise Report", link: "#" },
// ];
// const API_URL = process.env.REACT_APP_API_BASE_URL || "https://security-project-pe9c.onrender.com";
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 1000;

// // HTTP Status Codes
// const HTTP_STATUS = {
//   OK: 200,
//   CREATED: 201,
//   UNAUTHORIZED: 401,
//   TOO_MANY_REQUESTS: 429,
// };

// // Logging utility
// const logger = {
//   info: (message, data = null) => {
//     if (process.env.NODE_ENV === 'development') {
//       // console.log(`[INFO] ${message}`, data || '');
//     }
//   },
//   error: (message, error = null) => {
//     if (process.env.NODE_ENV === 'development') {
//       // console.error(`[ERROR] ${message}`, error || '');
//     }
//   },
//   warn: (message, data = null) => {
//     if (process.env.NODE_ENV === 'development') {
//       // console.warn(`[WARN] ${message}`, data || '');
//     }
//   }
// };

// // Utility function to sanitize input to prevent XSS attacks
// const sanitizeInput = (input) => {
//   if (input == null) return "";
//   if (typeof input !== "string") return String(input);
//   return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
// };

// // Utility function to sanitize CSV data to prevent formula injection
// const sanitizeCSVData = (value) => {
//   if (typeof value !== "string") return String(value || "");
//   if (value.startsWith("=") || value.startsWith("+") || value.startsWith("-") || value.startsWith("@")) {
//     return `\t${value}`;
//   }
//   return value;
// };

// // Utility function to validate date strings (YYYY-MM-DD or ISO format)
// const isValidDate = (dateString) => {
//   if (!dateString || typeof dateString !== "string") return false;
//   const cleanedDate = dateString.split("T")[0];
//   const date = new Date(cleanedDate);
//   const isValid = !isNaN(date.getTime()) && cleanedDate.match(/^\d{4}-\d{2}-\d{2}$/);
//   logger.info(`isValidDate: ${dateString} -> cleaned: ${cleanedDate}, valid: ${isValid}`);
//   return isValid;
// };

// // Utility function to create a date in local timezone to avoid timezone issues
// const createLocalDate = (dateString) => {
//   if (!dateString) return null;
  
//   let dateStr;
//   if (typeof dateString === 'string') {
//     dateStr = dateString;
//   } else if (dateString instanceof Date) {
//     return dateString;
//   } else {
//     logger.warn("createLocalDate received invalid input:", dateString);
//     return null;
//   }
  
//   try {
//     const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
//     if (isNaN(year) || isNaN(month) || isNaN(day)) {
//       logger.warn("createLocalDate failed to parse date:", dateStr);
//       return null;
//     }
//     return new Date(year, month - 1, day);
//   } catch (error) {
//     logger.error("createLocalDate error:", error);
//     return null;
//   }
// };

// // Utility function to format date as YYYY-MM-DD in local timezone
// const formatDateForAPI = (date) => {
//   if (!date) return null;
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

// // ErrorBoundary component to catch and display errors in child components
// class ErrorBoundary extends React.Component {
//   state = { hasError: false, error: null };

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   componentDidCatch(error, errorInfo) {
//     logger.error("ErrorBoundary caught an error:", { error, errorInfo });
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div role="alert" className="alert alert-danger">
//           An error occurred: {this.state.error?.message || "Unknown error"}. Please refresh the page.
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// // MonthWiseTable component to display the month-wise report table
// const MonthWiseTable = React.memo(({ employees, openEmployeeModal, isLoading, navigateToChart }) => {
//   const tableData = useMemo(
//     () => ({
//       columns: [
//         { label: "ID", field: "id", sort: "asc", width: 100, attributes: { className: "id", "aria-label": "Employee ID" } },
//         { label: "Name", field: "name", sort: "asc", width: 200, attributes: { className: "name" } },
//         { label: "Present Days", field: "present", sort: "asc", width: 120, attributes: { className: "present" } },
//         { label: "Absent Days", field: "absent", sort: "asc", width: 120, attributes: { className: "absent" } },
//         { label: "Leave Days", field: "leaveDays", sort: "asc", width: 120, attributes: { className: "leaveDays" } },
//         { label: "Week Off", field: "weekOff", sort: "asc", width: 120, attributes: { className: "weekOff" } },
//         { label: "Remaining CLs", field: "remainingCL", sort: "asc", width: 140, attributes: { className: "remainingCL" } },
//         { label: "OD", field: "od", sort: "asc", width: 100, attributes: { className: "od" } },
//         { label: "Actions", field: "actions", sort: "disabled", width: 120, attributes: { className: "actions" } },
//       ],
//       rows: (employees || []).map((employee) => ({
//         id: employee.id || "N/A",
//         name: sanitizeInput(employee.name) || "Unknown Employee",
//         present: employee.present || 0,
//         absent: employee.absent || 0,
//         leaveDays: employee.leaveDays || 0,
//         weekOff: employee.weekOff || 0,
//         remainingCL: employee.remainingCL || 0,
//         od: employee.od || 0,
//         actions: (
//           <Button
//             className="btn btn-primary btn-sm"
//             onClick={() => navigateToChart(employee.id, employee.name)}
//             disabled={!employee.id || employee.id === "N/A"}
//             aria-label={`View chart for ${sanitizeInput(employee.name) || "Unknown Employee"}`}
//           >
//             View Chart
//           </Button>
//         ),
//       })),
//     }),
//     [employees, openEmployeeModal, navigateToChart]
//   );

//   return (
//     <div className="table-container">
//       {isLoading ? (
//         <div className="loading-overlay" aria-live="polite">
//           <Loader />
//           <span className="loading-text">Loading month-wise report...</span>
//         </div>
//       ) : (employees || []).length === 0 ? (
//         <p className="text-center" aria-live="polite">
//           No month-wise report data found
//         </p>
//       ) : (
//         <div className="table-responsive">
//           <MDBDataTable
//             key={(employees || []).map((e) => e.id).join("-")}
//             responsive
//             striped
//             bordered
//             data={tableData}
//             paging={false}
//             searching={false}
//             noBottomColumns
//             hover
//             displayEntries={false}
//             className="md-table"
//             role="grid"
//             aria-label="Month Wise Report Table"
//           />
//         </div>
//       )}
//     </div>
//   );
// });

// MonthWiseTable.propTypes = {
//   employees: PropTypes.arrayOf(
//     PropTypes.shape({
//       id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//       name: PropTypes.string,
//       present: PropTypes.number,
//       absent: PropTypes.number,
//       leaveDays: PropTypes.number,
//       weekOff: PropTypes.number,
//       remainingCL: PropTypes.number,
//       od: PropTypes.number,
//     })
//   ).isRequired,
//   openEmployeeModal: PropTypes.func.isRequired,
//   isLoading: PropTypes.bool.isRequired,
//   navigateToChart: PropTypes.func.isRequired,
// };

// const MonthWiseReport = ({ setBreadcrumbItems }) => {
//   document.title = "Month Wise Report";
//   const navigate = useNavigate();
//   const today = new Date();
//   const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
//   const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

//   const deduplicateEmployees = (employees) => {
//     if (!Array.isArray(employees)) return [];
//     const seen = new Set();
//     return employees.filter((emp) => {
//       const idStr = String(emp?.id ?? "");
//       if (seen.has(idStr)) {
//         logger.warn(`Duplicate employee ID found: ${idStr}, Name: ${emp?.name ?? "Unknown"}`);
//         return false;
//       }
//       seen.add(idStr);
//       return true;
//     });
//   };

//   const [searchQuery, setSearchQuery] = useState("");
//   const [fromDate, setFromDate] = useState(currentMonthStart);
//   const [toDate, setToDate] = useState(currentMonthEnd);
//   const [modal, setModal] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [allEmployees, setAllEmployees] = useState([]);
//   const [filteredRows, setFilteredRows] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [downloadFormat, setDownloadFormat] = useState("pdf");
//   const entries = ENTRIES_PER_PAGE; // Fixed to 10 entries per page
//   const [currentPage, setCurrentPage] = useState(1);
//   const [employeeDetailsCache, setEmployeeDetailsCache] = useState({});
//   const [isModalLoading, setIsModalLoading] = useState(false);
//   const [debouncedLoading, setDebouncedLoading] = useState(false);
//   const debouncedLoadingTimeoutRef = useRef(null);
//   const [isExporting, setIsExporting] = useState(false);

//   const abortControllersRef = useRef(new Map());
//   const lastFetchTimeRef = useRef(0);

//   const debouncedSearch = useMemo(
//     () => debounce((value) => setSearchQuery(sanitizeInput(value)), 300),
//     []
//   );

//   const retry = async (fn, retries = MAX_RETRIES, delay = RETRY_DELAY) => {
//     for (let i = 0; i < retries; i++) {
//       try {
//         return await fn();
//       } catch (error) {
//         if (error.name === "AbortError") {
//           throw error;
//         }
//         if (error.response?.status === HTTP_STATUS.TOO_MANY_REQUESTS) {
//           await new Promise((resolve) => setTimeout(resolve, delay * 2));
//         } else if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
//           toast.error("Unauthorized: Please log in again");
//           throw error;
//         } else if (!error.response) {
//           toast.error("Network error: Please check your connection");
//           throw error;
//         }
//         if (i === retries - 1) throw error;
//         await new Promise((resolve) => setTimeout(resolve, delay));
//       }
//     }
//   };

//   const countWeekOffDays = (startDate, endDate, weekOffDay) => {
//     if (!weekOffDay) return 0;
//     let count = 0;
//     let currentDate = new Date(startDate);
//     while (currentDate <= endDate) {
//       if (currentDate.toLocaleString("en-US", { weekday: "long" }) === weekOffDay) {
//         count++;
//       }
//       currentDate.setDate(currentDate.getDate() + 1);
//     }
//     return count;
//   };

//   const fetchEmployeeDetails = useCallback(async () => {
//     try {
//       if (Object.keys(employeeDetailsCache).length > 0) return employeeDetailsCache;
      
//       const controllerId = 'fetchEmployeeDetails';
//       const controller = new AbortController();
//       abortControllersRef.current.set(controllerId, controller);
      
//       const response = await retry(() =>
//         axios.get(`${API_URL}/emp/details`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
//           signal: controller.signal,
//         })
//       );
      
//       const employees = response.data.reduce((acc, emp) => {
//         acc[emp.empId] = {
//           name: sanitizeInput(emp.empName) || "N/A",
//           phone: emp.empMobileNo ? String(emp.empMobileNo) : "N/A",
//           designation: sanitizeInput(emp.empDesignation) || "N/A",
//           aadharNo: emp.empAadharNo ? String(emp.empAadharNo) : "N/A",
//           panNo: sanitizeInput(emp.empPanNo) || "N/A",
//           dob: emp.empDob ? new Date(emp.empDob).toISOString().split("T")[0] : "N/A",
//           doj: emp.empDoj || "N/A",
//           image: emp.empImage || "N/A",
//           department: sanitizeInput(emp.empDepartment) || "N/A",
//           address: sanitizeInput(emp.address) || "N/A",
//           bankAccountNo: emp.bankAccountNo ? String(emp.bankAccountNo) : "N/A",
//           epfNo: emp.epfNo || "N/A",
//           esiNo: emp.esiNo || "N/A",
//           weekOff: emp.empWeekOff || "Sunday",
//         };
//         return acc;
//       }, {});
//       setEmployeeDetailsCache(employees);
//       return employees;
//     } catch (err) {
//       if (err.name !== "AbortError") {
//         logger.error("Error fetching employee details:", err);
//         const errorMessage = `Failed to fetch employee details: ${err.message}`;
//         setError(errorMessage);
//         toast.error(errorMessage, {
//           position: "top-right",
//           autoClose: 3000,
//         });
//       }
//       return {};
//     } finally {
//       abortControllersRef.current.delete('fetchEmployeeDetails');
//     }
//   }, [employeeDetailsCache]);

//   const fetchRemainingCLs = async (empId) => {
//     try {
//       const response = await axios.get(`${API_URL}/leaves/remaining-cl/${empId}`, {
//         params: { startDate: formatDateForAPI(fromDate), endDate: formatDateForAPI(toDate) },
//         headers: { Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
//       });
//       return response.data.remainingCL || 0;
//     } catch (err) {
//       logger.error(`Error fetching remaining CLs for empId ${empId}:`, err);
//       return 0;
//     }
//   };

//   const fetchMonthWiseReport = async (empId, startDate, endDate) => {
//     try {
//       const response = await axios.get(`${API_URL}/month/monthwise-report/${empId}`, {
//         params: { startDate: formatDateForAPI(startDate), endDate: formatDateForAPI(endDate) },
//         headers: { Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
//       });
//       logger.info(`MonthWise Report for empId ${empId}:`, response.data);

//       const { combinedReport } = response.data;
//       if (!combinedReport || typeof combinedReport !== "object") {
//         logger.warn(`Invalid combinedReport for empId ${empId}:`, combinedReport);
//         return { present: 0, absent: 0, leaveDays: 0, od: 0 };
//       }

//       const startYear = startDate.getFullYear();
//       const startMonth = startDate.getMonth() + 1;
//       const endYear = endDate.getFullYear();
//       const endMonth = endDate.getMonth() + 1;

//       let present = 0, absent = 0, leaveDays = 0, od = 0;

//       if (Array.isArray(combinedReport.attendance)) {
//         combinedReport.attendance.forEach((entry) => {
//           const entryYear = entry._id.year;
//           const entryMonth = entry._id.month;
//           if (
//             (entryYear > startYear || (entryYear === startYear && entryMonth >= startMonth)) &&
//             (entryYear < endYear || (entryYear === endYear && entryMonth <= endMonth))
//           ) {
//             present += entry.present || 0;
//             absent += entry.absent || 0;
//           }
//         });
//       }

//       if (Array.isArray(combinedReport.leaves)) {
//         combinedReport.leaves.forEach((entry) => {
//           const entryYear = entry._id.year;
//           const entryMonth = entry._id.month;
//           if (
//             (entryYear > startYear || (entryYear === startYear && entryMonth >= startMonth)) &&
//             (entryYear < endYear || (entryYear === endYear && entryMonth <= endMonth))
//           ) {
//             leaveDays += entry.totalLeaves || 0;
//           }
//         });
//       }

//       if (Array.isArray(combinedReport.ods)) {
//         combinedReport.ods.forEach((entry) => {
//           const entryYear = entry._id.year;
//           const entryMonth = entry._id.month;
//           if (
//             (entryYear > startYear || (entryYear === startYear && entryMonth >= startMonth)) &&
//             (entryYear < endYear || (entryYear === endYear && entryMonth <= endMonth))
//           ) {
//             od += entry.totalOds || 0;
//           }
//         });
//       }

//       logger.info(`Processed data for empId ${empId}:`, { present, absent, leaveDays, od });
//       return { present, absent, leaveDays, od };
//     } catch (err) {
//       logger.error(`Error in fetchMonthWiseReport for empId ${empId}:`, err);
//       return { present: 0, absent: 0, leaveDays: 0, od: 0 };
//     }
//   };

//   const fetchEmployeeData = useCallback(async () => {
//     // Prevent fetching on invalid range
//     if (fromDate && toDate && fromDate > toDate) {
//       setError("Invalid date range. 'From Date' cannot be after 'To Date'.");
//       setAllEmployees([]);
//       setFilteredRows([]);
//       return;
//     }

//     const now = Date.now();
//     // Avoid rapid successive calls
//     if (now - lastFetchTimeRef.current < 1000) {
//       logger.info("Skipping fetch - too soon after last fetch");
//       return;
//     }
//     lastFetchTimeRef.current = now;

//     setIsLoading(true);
//     setDebouncedLoading(true);
//     setError(null);
    
//     const controllerId = 'fetchEmployeeData';
//     const controller = new AbortController();
//     abortControllersRef.current.set(controllerId, controller);
    
//     try {
//       const employeeDetails = await fetchEmployeeDetails();
//       const empIds = Object.keys(employeeDetails);
//       if (empIds.length === 0) {
//         setError("No employee data available.");
//         setAllEmployees([]);
//         setFilteredRows([]);
//         return;
//       }

//       const employees = await Promise.all(
//         empIds.map(async (empId) => {
//           const report = await fetchMonthWiseReport(empId, fromDate, toDate);
//           const empDetails = employeeDetails[empId];
//           const remainingCL = await fetchRemainingCLs(empId);
//           return {
//             id: empId,
//             name: empDetails.name,
//             present: report.present,
//             absent: report.absent,
//             leaveDays: report.leaveDays,
//             weekOff: countWeekOffDays(fromDate, toDate, empDetails.weekOff),
//             remainingCL: remainingCL,
//             od: report.od,
//           };
//         })
//       );
//       const deduplicatedEmployees = deduplicateEmployees(employees);
//       logger.info("Fetched and processed employees:", deduplicatedEmployees);
//       setAllEmployees(deduplicatedEmployees);
//       setFilteredRows(deduplicatedEmployees);
//     } catch (err) {
//       if (err.name !== "AbortError") {
//         logger.error("Error in fetchEmployeeData:", err);
//         const errorMessage = `Failed to fetch employee data: ${err.message}`;
//         setError(errorMessage);
//         toast.error(errorMessage, {
//           position: "top-right",
//           autoClose: 5000,
//         });
//         setAllEmployees([]);
//         setFilteredRows([]);
//       }
//     } finally {
//       setIsLoading(false);
//       abortControllersRef.current.delete(controllerId);
      
//       // Clear any existing timeout and set new one
//       if (debouncedLoadingTimeoutRef.current) {
//         clearTimeout(debouncedLoadingTimeoutRef.current);
//       }
//       debouncedLoadingTimeoutRef.current = setTimeout(() => setDebouncedLoading(false), 300);
//     }
//   }, [fromDate, toDate, fetchEmployeeDetails]);

//   const formatDate = (date) => {
//     if (!date) return null;
//     if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
//     const d = new Date(date);
//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, "0");
//     const day = String(d.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   useEffect(() => {
//     setBreadcrumbItems("Month Wise Report", BREADCRUMB_ITEMS);
//     return () => {
//       debouncedSearch.cancel();
//       // Clear debounced loading timeout
//       if (debouncedLoadingTimeoutRef.current) {
//         clearTimeout(debouncedLoadingTimeoutRef.current);
//       }
//       // Abort all pending requests
//       abortControllersRef.current.forEach(controller => {
//         if (controller && !controller.signal.aborted) {
//           controller.abort();
//         }
//       });
//       abortControllersRef.current.clear();
//     };
//   }, [setBreadcrumbItems, debouncedSearch]);

//   useEffect(() => {
//     logger.info("useEffect triggered with fromDate:", formatDate(fromDate), "toDate:", formatDate(toDate));
//     if (fromDate && toDate) {
//       const fetchData = async () => {
//         const employees = await fetchEmployeeData();
//         logger.info("Employees after fetch:", employees);
//         applySearchFilter(employees);
//       };
//       fetchData();
//     } else {
//       setAllEmployees([]);
//       setFilteredRows([]);
//       setError(null);
//     }
//   }, [fromDate, toDate, fetchEmployeeData]);

//   const applySearchFilter = useCallback((employees) => {
//     const query = searchQuery.toLowerCase().trim();
//     if (query === "") {
//       setFilteredRows(employees);
//     } else {
//       const filtered = employees.filter(
//         (emp) => emp.name.toLowerCase().includes(query) || emp.id.toString().includes(query)
//       );
//       setFilteredRows(filtered);
//     }
//     setCurrentPage(1); // Reset to first page when filter changes
//   }, [searchQuery]);

//   useEffect(() => {
//     applySearchFilter(allEmployees);
//   }, [searchQuery, allEmployees, applySearchFilter]);

//   const handleSearch = (e) => debouncedSearch(e.target.value || "");

//   const handleFromDateChange = (date) => {
//     logger.info("From Date Selected:", date[0], "Formatted:", formatDate(date[0]));
//     setFromDate(date[0]);
//     setError(null);
//   };

//   const handleToDateChange = (date) => {
//     logger.info("To Date Selected:", date[0], "Formatted:", formatDate(date[0]));
//     setToDate(date[0]);
//     setError(null);
//   };

//   const toggleModal = useCallback(() => {
//     setModal((prev) => {
//       if (!prev) {
//         // Opening modal - reset state
//         setSelectedEmployee(null);
//         setIsModalLoading(false);
//       }
//       return !prev;
//     });
//   }, []);

//   const openEmployeeModal = useCallback(async (empId) => {
//     if (!empId || empId === "N/A") {
//       toast.error("Invalid employee ID");
//       return;
//     }
    
//     try {
//       setIsModalLoading(true);
//       const employeeDetails = await fetchEmployeeDetails();
//       const employee = employeeDetails[empId];
//       if (employee) {
//         setSelectedEmployee({
//           empId,
//           empName: employee.name,
//           empDesignation: employee.designation,
//           empMobileNo: employee.phone,
//           empAadharNo: employee.aadharNo,
//           empPanNo: employee.panNo,
//           empDob: employee.dob,
//           empDoj: employee.doj,
//           empImage: employee.image,
//           empDepartment: employee.department,
//           empAddress: employee.address,
//           empBankAccountNo: employee.bankAccountNo,
//           empEpfNo: employee.epfNo,
//           empEsiNo: employee.esiNo,
//         });
//       } else {
//         setSelectedEmployee(null);
//       }
//       setModal(true);
//     } catch (err) {
//       logger.error("Modal Fetch Error:", err);
//       setSelectedEmployee(null);
//       setModal(true);
//     } finally {
//       setIsModalLoading(false);
//     }
//   }, [fetchEmployeeDetails]);

//   const navigateToChart = useCallback((empId, empName) => {
//     navigate("/month-wise-chart", {
//       state: {
//         empId: empId,
//         empName: empName,
//         fromDate,
//         toDate,
//         searchQuery,
//         allEmployees,
//         filteredRows,
//       },
//     });
//   }, [navigate, fromDate, toDate, searchQuery, allEmployees, filteredRows]);

//   const exportToCSV = useCallback(() => {
//     if ((allEmployees || []).length === 0) {
//       toast.warn("No month-wise report data available to export");
//       return;
//     }
    
//     setIsExporting(true);
    
//     try {
//       const dataToDownload = (filteredRows || []).length > 0 ? filteredRows : allEmployees;
//       const data = (dataToDownload || []).map((employee) => ({
//         "Employee ID": sanitizeCSVData(employee.id),
//         "Name": sanitizeCSVData(employee.name),
//         "Present Days": sanitizeCSVData(employee.present),
//         "Absent Days": sanitizeCSVData(employee.absent),
//         "Leave Days": sanitizeCSVData(employee.leaveDays),
//         "Week Off": sanitizeCSVData(employee.weekOff),
//         "Remaining CLs": sanitizeCSVData(employee.remainingCL),
//         "OD": sanitizeCSVData(employee.od),
//         "From Date": formatDate(fromDate) || "Unknown",
//         "To Date": formatDate(toDate) || "Unknown",
//       }));

//       const csv = Papa.unparse(data);
//       const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//       const link = document.createElement("a");
//       const url = URL.createObjectURL(blob);
//       link.setAttribute("href", url);
//       link.setAttribute("download", `month_wise_report_${formatDate(fromDate)}_to_${formatDate(toDate)}.csv`);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);
//       toast.success("Report exported as CSV");
//     } catch (error) {
//       logger.error("Error exporting CSV:", error);
//       toast.error("Failed to export CSV");
//     } finally {
//       setIsExporting(false);
//     }
//   }, [allEmployees, filteredRows, fromDate, toDate]);

//   const exportToPDF = useCallback(() => {
//     if ((allEmployees || []).length === 0) {
//       toast.warn("No month-wise report data available to export");
//       return;
//     }
    
//     setIsExporting(true);
    
//     try {
//       const dataToDownload = (filteredRows || []).length > 0 ? filteredRows : allEmployees;
//       const headers = ["ID", "Name", "Present Days", "Absent Days", "Leave Days", "Week Off", "Remaining CLs", "OD"];
//       const csvData = [
//         headers,
//         ...(dataToDownload || []).map((row) => [
//           sanitizeCSVData(row.id),
//           sanitizeCSVData(row.name),
//           sanitizeCSVData(row.present),
//           sanitizeCSVData(row.absent),
//           sanitizeCSVData(row.leaveDays),
//           sanitizeCSVData(row.weekOff),
//           sanitizeCSVData(row.remainingCL),
//           sanitizeCSVData(row.od),
//         ]),
//       ];

//       const doc = new jsPDF();
//       autoTable(doc, {
//         head: [csvData[0]],
//         body: csvData.slice(1),
//         startY: 20,
//       });
//       doc.save(`month_wise_report_${formatDate(fromDate)}_to_${formatDate(toDate)}.pdf`);
//       toast.success("Report exported as PDF");
//     } catch (err) {
//       logger.error("PDF generation error:", err);
//       toast.error("Failed to generate PDF");
//     } finally {
//       setIsExporting(false);
//     }
//   }, [allEmployees, filteredRows, fromDate, toDate]);

//   const isInvalidRange = Boolean(fromDate && toDate && fromDate > toDate);

//   const totalItems = (filteredRows || []).length;
//   const totalPages = Math.ceil(totalItems / entries);
//   const startIndex = (currentPage - 1) * entries;
//   const endIndex = Math.min(startIndex + entries, totalItems);
//   const paginatedRows = (filteredRows || []).slice(startIndex, endIndex);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <ErrorBoundary>
//       <div className="month-wise-report">
//         <Row>
//           <Col xs={12}>
//             <Card>
//               <CardBody>
//                 <CardTitle className="h4">Month Wise Report</CardTitle>
//                 <p className="card-title-desc">View attendance summary for employees within a date range</p>

//                 <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap">
//                   <div className="d-flex align-items-center flex-wrap gap-2">
//                     <Input
//                       type="text"
//                       placeholder="Search by Employee ID or Name"
//                       onChange={handleSearch}
//                       style={{ maxWidth: "300px" }}
//                       aria-label="Search employees"
//                       disabled={isLoading}
//                     />
//                     <Flatpickr
//                       className="form-control"
//                       value={fromDate}
//                       onChange={handleFromDateChange}
//                       options={{
//                         altInput: true,
//                         altFormat: "F j, Y",
//                         dateFormat: "Y-m-d",
//                         allowInput: true,
//                       }}
//                       placeholder="From Date"
//                       style={{ maxWidth: "200px" }}
//                     />
//                     <Flatpickr
//                       className="form-control"
//                       value={toDate}
//                       onChange={handleToDateChange}
//                       options={{
//                         altInput: true,
//                         altFormat: "F j, Y",
//                         dateFormat: "Y-m-d",
//                         allowInput: true,
//                       }}
//                       placeholder="To Date"
//                       style={{ maxWidth: "200px" }}
//                     />
//                   </div>
//                   <div className="d-flex gap-2">
//                     <Button
//                       color="success"
//                       onClick={exportToCSV}
//                       aria-label="Export report as CSV"
//                       disabled={isLoading || isExporting}
//                     >
//                       {isExporting ? (
//                         <>
//                           <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                           Exporting...
//                         </>
//                       ) : (
//                         "Export as CSV"
//                       )}
//                     </Button>
//                     <Button
//                       color="info"
//                       onClick={exportToPDF}
//                       aria-label="Export report as PDF"
//                       disabled={isLoading || isExporting}
//                     >
//                       {isExporting ? (
//                         <>
//                           <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                           Exporting...
//                         </>
//                       ) : (
//                         "Export as PDF"
//                       )}
//                     </Button>
//                   </div>
//                 </div>

//                 {isInvalidRange && (
//                   <div className="text-danger small mb-2">From Date cannot be after To Date.</div>
//                 )}

//                 <MonthWiseTable
//                   employees={paginatedRows}
//                   openEmployeeModal={openEmployeeModal}
//                   isLoading={debouncedLoading}
//                   navigateToChart={navigateToChart}
//                 />

//                 {(filteredRows || []).length > 0 && totalPages > 1 && !debouncedLoading && (
//                   <Pagination className="mt-3" aria-label="Report pagination">
//                     <PaginationItem disabled={currentPage === 1}>
//                       <PaginationLink
//                         previous
//                         onClick={() => paginate(currentPage - 1)}
//                         aria-label="Previous page"
//                         aria-disabled={currentPage === 1}
//                       >
//                         Previous
//                       </PaginationLink>
//                     </PaginationItem>
//                     {[...Array(totalPages)].map((_, index) => (
//                       <PaginationItem key={index} active={index + 1 === currentPage}>
//                         <PaginationLink
//                           onClick={() => paginate(index + 1)}
//                           aria-label={`Page ${index + 1}`}
//                           aria-current={index + 1 === currentPage ? "page" : undefined}
//                         >
//                           {index + 1}
//                         </PaginationLink>
//                       </PaginationItem>
//                     ))}
//                     <PaginationItem disabled={currentPage === totalPages}>
//                       <PaginationLink
//                         next
//                         onClick={() => paginate(currentPage + 1)}
//                         aria-label="Next page"
//                         aria-disabled={currentPage === totalPages}
//                       >
//                         Next
//                       </PaginationLink>
//                     </PaginationItem>
//                   </Pagination>
//                 )}

//                 {error && (
//                   <div className="text-center py-4 text-danger" role="alert">
//                     {error}
//                   </div>
//                 )}

//                 {!fromDate && !isLoading && (
//                   <div className="text-center py-4 text-muted">
//                     Please select a date range to view records.
//                   </div>
//                 )}

//                 {fromDate && toDate && (allEmployees || []).length === 0 && !isLoading && !error && (
//                   <div className="text-center py-4 text-muted">
//                     No records found for the selected date range.
//                   </div>
//                 )}
//               </CardBody>
//             </Card>
//           </Col>
//         </Row>

//         <ErrorBoundary>
//           <Modal isOpen={modal} toggle={toggleModal} className="custom-modal" centered size="lg">
//             <ModalHeader toggle={toggleModal}>Employee Full Details</ModalHeader>
//             <ModalBody>
//               {isModalLoading ? (
//                 <div className="loading-overlay" aria-live="polite">
//                   <Loader />
//                   <span className="loading-text">Loading employee details...</span>
//                 </div>
//               ) : selectedEmployee ? (
//                 <>
//                   <div className="employee-image-container">
//                     <div className="text-center">
//                       <img
//                         src={`${API_URL}/emp/uploads/${selectedEmployee.empId}.JPG`}
//                         alt={selectedEmployee.empName || "Employee"}
//                         style={{
//                           width: "85px",
//                           height: "85px",
//                           objectFit: "contain",
//                           borderRadius: "40px",
//                           border: "1px solid #ccc",
//                           backgroundColor: "#fff",
//                           padding: "5px",
//                         }}
//                         onError={(e) => {
//                           const currentSrc = e.target.src;
//                           if (currentSrc.endsWith(".JPG")) {
//                             e.target.src = `${API_URL}/emp/uploads/${selectedEmployee.empId}.jpg`;
//                           } else {
//                             e.target.src = `${API_URL}/emp/uploads/0000.jpg`;
//                           }
//                         }}
//                       />
//                     </div>
//                   </div>
//                   <Table className="table table-bordered">
//                     <tbody>
//                       <tr>
//                         <td className="label"><strong>ID</strong></td>
//                         <td className="detail">{selectedEmployee.empId || "N/A"}</td>
//                         <td className="label"><strong>Name</strong></td>
//                         <td className="detail">{sanitizeInput(selectedEmployee.empName) || "N/A"}</td>
//                       </tr>
//                       <tr>
//                         <td className="label"><strong>Designation</strong></td>
//                         <td className="detail">{sanitizeInput(selectedEmployee.empDesignation) || "N/A"}</td>
//                         <td className="label"><strong>Department</strong></td>
//                         <td className="detail">{sanitizeInput(selectedEmployee.empDepartment) || "N/A"}</td>
//                       </tr>
//                       <tr>
//                         <td className="label"><strong>Mobile No</strong></td>
//                         <td className="detail">{selectedEmployee.empMobileNo || "N/A"}</td>
//                         <td className="label"><strong>Aadhar No</strong></td>
//                         <td className="detail">{selectedEmployee.empAadharNo || "N/A"}</td>
//                       </tr>
//                       <tr>
//                         <td className="label"><strong>PAN No</strong></td>
//                         <td className="detail">{sanitizeInput(selectedEmployee.empPanNo) || "N/A"}</td>
//                         <td className="label"><strong>Date of Joining</strong></td>
//                         <td className="detail">
//                           {selectedEmployee.empDoj !== "N/A"
//                             ? new Date(selectedEmployee.empDoj).toLocaleDateString()
//                             : "N/A"}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td className="label"><strong>Date of Birth</strong></td>
//                         <td className="detail">
//                           {selectedEmployee.empDob !== "N/A"
//                             ? new Date(selectedEmployee.empDob).toLocaleDateString()
//                             : "N/A"}
//                         </td>
//                         <td className="label"><strong>ESI No</strong></td>
//                         <td className="detail">{selectedEmployee.empEsiNo || "N/A"}</td>
//                       </tr>
//                       <tr>
//                         <td className="label"><strong>Bank Account No</strong></td>
//                         <td className="detail">{selectedEmployee.empBankAccountNo || "N/A"}</td>
//                         <td className="label"><strong>EPF No</strong></td>
//                         <td className="detail">{selectedEmployee.empEpfNo || "N/A"}</td>
//                       </tr>
//                       <tr>
//                         <td colSpan={4} className="address">
//                           <strong>Address: </strong>
//                           {sanitizeInput(selectedEmployee.empAddress) || "N/A"}
//                         </td>
//                       </tr>
//                     </tbody>
//                   </Table>
//                 </>
//               ) : (
//                 <p className="text-center text-muted">Employee details not found</p>
//               )}
//             </ModalBody>
//             <ModalFooter>
//               <Button color="secondary" onClick={toggleModal} aria-label="Close modal">
//                 Close
//               </Button>
//             </ModalFooter>
//           </Modal>
//         </ErrorBoundary>

//         <ToastContainer
//           position="top-right"
//           autoClose={5000}
//           hideProgressBar={false}
//           newestOnTop
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//         />
//       </div>
//     </ErrorBoundary>
//   );
// };

// MonthWiseReport.propTypes = {
//   setBreadcrumbItems: PropTypes.func.isRequired,
// };

// export default connect(null, { setBreadcrumbItems })(MonthWiseReport);


import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Input,
  Pagination,
  PaginationItem,
  PaginationLink,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
} from "reactstrap";
import { connect } from "react-redux";
import { MDBDataTable } from "mdbreact";
import { setBreadcrumbItems } from "../../../store/actions";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import PropTypes from "prop-types";
import { debounce } from "lodash";
import Papa from "papaparse";
import DOMPurify from "dompurify";
import Loader from "components/Loader";
import Flatpickr from "react-flatpickr";
import "react-toastify/dist/ReactToastify.css";
import "flatpickr/dist/themes/material_blue.css";
import "./monthwisereport.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";

// Constants
const ENTRIES_PER_PAGE = 10;
const BATCH_SIZE = 5; // Reduces load by processing only 5 employees at a time
const BREADCRUMB_ITEMS = [
  { title: "Security", link: "#" },
  { title: "Reports", link: "#" },
  { title: "Month Wise Report", link: "#" },
];
const API_URL = process.env.REACT_APP_API_BASE_URL || "https://security-project-pe9c.onrender.com";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Logging utility
const logger = {
  error: (message, error = null) => {
    if (process.env.NODE_ENV === 'development') console.error(`[ERROR] ${message}`, error || '');
  }
};

const sanitizeInput = (input) => {
  if (input == null) return "";
  if (typeof input !== "string") return String(input);
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

const sanitizeCSVData = (value) => {
  if (typeof value !== "string") return String(value || "");
  if (value.startsWith("=") || value.startsWith("+") || value.startsWith("-") || value.startsWith("@")) {
    return `\t${value}`;
  }
  return value;
};

const formatDateForAPI = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- FIX 1: Smart Batch Processing ---
// This function allows us to stop the loop immediately if the user leaves the page (signal.aborted)
const processInBatches = async (items, batchSize, fn, signal) => {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    // CRITICAL: Stop processing if user navigated away
    if (signal && signal.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
};

// ErrorBoundary
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { logger.error("ErrorBoundary caught an error:", { error, errorInfo }); }
  render() {
    if (this.state.hasError) return <div className="alert alert-danger">An error occurred. Please refresh.</div>;
    return this.props.children;
  }
}

// MonthWiseTable Component
const MonthWiseTable = React.memo(({ employees, navigateToChart, tableVersion, isLoading }) => {
  const tableData = useMemo(() => ({
    columns: [
      { label: "ID", field: "id", sort: "asc", width: 100 },
      { label: "Name", field: "name", sort: "asc", width: 200 },
      { label: "Present Days", field: "present", sort: "asc", width: 120 },
      { label: "Absent Days", field: "absent", sort: "asc", width: 120 },
      { label: "Leave Days", field: "leaveDays", sort: "asc", width: 120 },
      { label: "Week Off", field: "weekOff", sort: "asc", width: 120 },
      { label: "Remaining CLs", field: "remainingCL", sort: "asc", width: 140 },
      { label: "OD", field: "od", sort: "asc", width: 100 },
      { label: "Actions", field: "actions", sort: "disabled", width: 120 },
    ],
    rows: (employees || []).map((employee) => ({
      id: employee.id || "N/A",
      name: sanitizeInput(employee.name) || "Unknown",
      present: employee.present || 0,
      absent: employee.absent || 0,
      leaveDays: employee.leaveDays || 0,
      weekOff: employee.weekOff || 0,
      remainingCL: employee.remainingCL || 0,
      od: employee.od || 0,
      actions: (
        <Button
          className="btn btn-primary btn-sm"
          onClick={() => navigateToChart(employee.id, employee.name)}
          disabled={!employee.id || employee.id === "N/A"}
        >
          View Chart
        </Button>
      ),
    })),
  }), [employees, navigateToChart]);

  return (
    <div className="table-container">
      {isLoading ? (
        <div className="loading-overlay">
          <Loader />
          <span className="loading-text">Loading month-wise report...</span>
        </div>
      ) : (employees || []).length === 0 ? (
        <p className="text-center">No month-wise report data found</p>
      ) : (
        <div className="table-responsive">
          <MDBDataTable
            key={tableVersion}
            responsive
            striped
            bordered
            data={tableData}
            paging={false}
            searching={false}
            noBottomColumns
            hover
            displayEntries={false}
            className="md-table"
          />
        </div>
      )}
    </div>
  );
});

MonthWiseTable.propTypes = {
  employees: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  navigateToChart: PropTypes.func.isRequired,
  tableVersion: PropTypes.number.isRequired,
};

const MonthWiseReport = ({ setBreadcrumbItems }) => {
  document.title = "Month Wise Report";
  const navigate = useNavigate();
  const today = new Date();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [toDate, setToDate] = useState(new Date(today.getFullYear(), today.getMonth() + 1, 0));
  const [modal, setModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeeDetailsCache, setEmployeeDetailsCache] = useState({});
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [debouncedLoading, setDebouncedLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [tableVersion, setTableVersion] = useState(0);

  const abortControllersRef = useRef(new Map());
  const lastFetchTimeRef = useRef(0);

  const debouncedSearch = useMemo(() => debounce((value) => setSearchQuery(sanitizeInput(value)), 300), []);

  const retry = async (fn, retries = MAX_RETRIES, delay = RETRY_DELAY) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (error.name === "AbortError") throw error;
        if (error.response?.status === 429) await new Promise((r) => setTimeout(r, delay * 2));
        else if (i < retries - 1) await new Promise((r) => setTimeout(r, delay));
        else throw error;
      }
    }
  };

  const countWeekOffDays = (startDate, endDate, weekOffDay) => {
    if (!weekOffDay) return 0;
    let count = 0;
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (currentDate.toLocaleString("en-US", { weekday: "long" }) === weekOffDay) count++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
  };

  const fetchEmployeeDetails = useCallback(async () => {
    if (Object.keys(employeeDetailsCache).length > 0) return employeeDetailsCache;
    
    // --- FIX 2: AbortController for details fetch ---
    const controllerId = 'fetchEmployeeDetails';
    if (abortControllersRef.current.has(controllerId)) {
      abortControllersRef.current.get(controllerId).abort();
    }
    const controller = new AbortController();
    abortControllersRef.current.set(controllerId, controller);
    
    try {
      const response = await retry(() =>
        axios.get(`${API_URL}/emp/details`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
          signal: controller.signal,
        })
      );
      
      const employees = response.data.reduce((acc, emp) => {
        acc[emp.empId] = {
          name: sanitizeInput(emp.empName) || "N/A",
          phone: emp.empMobileNo ? String(emp.empMobileNo) : "N/A",
          designation: sanitizeInput(emp.empDesignation) || "N/A",
          aadharNo: emp.empAadharNo ? String(emp.empAadharNo) : "N/A",
          panNo: sanitizeInput(emp.empPanNo) || "N/A",
          dob: emp.empDob ? new Date(emp.empDob).toISOString().split("T")[0] : null,
          doj: emp.empDoj ? new Date(emp.empDoj).toISOString().split("T")[0] : null,
          image: emp.empImage || "N/A",
          department: sanitizeInput(emp.empDepartment) || "N/A",
          address: sanitizeInput(emp.address) || "N/A",
          bankAccountNo: emp.bankAccountNo ? String(emp.bankAccountNo) : "N/A",
          epfNo: emp.epfNo || "N/A",
          esiNo: emp.esiNo || "N/A",
          weekOff: emp.empWeekOff || "Sunday",
        };
        return acc;
      }, {});
      setEmployeeDetailsCache(employees);
      return employees;
    } catch (err) {
      if (err.name !== "AbortError") logger.error("Error fetching employee details:", err);
      return {}; // Return empty object instead of throwing to prevent main flow crash
    } finally {
      abortControllersRef.current.delete(controllerId);
    }
  }, [employeeDetailsCache]);

  const fetchRemainingCLs = async (empId, signal) => {
    try {
      const response = await axios.get(`${API_URL}/leaves/remaining-cl/${empId}`, {
        params: { startDate: formatDateForAPI(fromDate), endDate: formatDateForAPI(toDate) },
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
        signal: signal 
      });
      return response.data.remainingCL || 0;
    } catch (err) {
      return 0;
    }
  };

  const fetchMonthWiseReport = async (empId, startDate, endDate, signal) => {
    try {
      const response = await axios.get(`${API_URL}/month/monthwise-report/${empId}`, {
        params: { startDate: formatDateForAPI(startDate), endDate: formatDateForAPI(endDate) },
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` },
        signal: signal
      });

      const { combinedReport } = response.data;
      if (!combinedReport || typeof combinedReport !== "object") return { present: 0, absent: 0, leaveDays: 0, od: 0 };

      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth() + 1;
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;

      const sumInDateRange = (list, key) => {
        let total = 0;
        if (Array.isArray(list)) {
          list.forEach((entry) => {
            const y = entry._id.year;
            const m = entry._id.month;
            if ((y > startYear || (y === startYear && m >= startMonth)) &&
                (y < endYear || (y === endYear && m <= endMonth))) {
              total += entry[key] || 0;
            }
          });
        }
        return total;
      };

      return {
        present: sumInDateRange(combinedReport.attendance, 'present'),
        absent: sumInDateRange(combinedReport.attendance, 'absent'),
        leaveDays: sumInDateRange(combinedReport.leaves, 'totalLeaves'),
        od: sumInDateRange(combinedReport.ods, 'totalOds'),
      };
    } catch (err) {
      return { present: 0, absent: 0, leaveDays: 0, od: 0 };
    }
  };

  const fetchEmployeeData = useCallback(async () => {
    if (fromDate && toDate && fromDate > toDate) {
      setError("Invalid date range. 'From Date' cannot be after 'To Date'.");
      setAllEmployees([]);
      setFilteredRows([]);
      return;
    }

    const now = Date.now();
    if (now - lastFetchTimeRef.current < 1000) return;
    lastFetchTimeRef.current = now;

    setIsLoading(true);
    setDebouncedLoading(true);
    setError(null);
    
    // --- FIX 3: Main AbortController for the bulk fetch ---
    const controllerId = 'fetchEmployeeData';
    // If a fetch is already running, abort it before starting a new one
    if (abortControllersRef.current.has(controllerId)) {
      abortControllersRef.current.get(controllerId).abort();
    }
    const controller = new AbortController();
    abortControllersRef.current.set(controllerId, controller);
    
    try {
      const employeeDetails = await fetchEmployeeDetails();
      const empIds = Object.keys(employeeDetails);
      
      if (empIds.length === 0) {
        setError("No employee data available.");
        setAllEmployees([]);
        setFilteredRows([]);
        return;
      }

      // Pass the signal to processInBatches
      const processedEmployees = await processInBatches(empIds, BATCH_SIZE, async (empId) => {
        // Pass signal to individual API calls so they cancel instantly
        const [report, remainingCL] = await Promise.all([
          fetchMonthWiseReport(empId, fromDate, toDate, controller.signal),
          fetchRemainingCLs(empId, controller.signal)
        ]);

        const empDetails = employeeDetails[empId];
        return {
          id: empId,
          name: empDetails.name,
          present: report.present,
          absent: report.absent,
          leaveDays: report.leaveDays,
          weekOff: countWeekOffDays(fromDate, toDate, empDetails.weekOff),
          remainingCL: remainingCL,
          od: report.od,
        };
      }, controller.signal); // <-- Signal passed here stops the loop

      const validEmployees = processedEmployees.filter(Boolean);
      // Ensure uniqueness
      const uniqueEmployees = Array.from(new Map(validEmployees.map(item => [item.id, item])).values());
      
      setAllEmployees(uniqueEmployees);
      setFilteredRows(uniqueEmployees);
      setTableVersion(v => v + 1);
    } catch (err) {
      // --- FIX 4: Ignore AbortErrors ---
      // This ensures we DO NOT show an error if the user navigated away
      if (err.name !== "AbortError") {
        const errorMessage = `Failed to fetch employee data: ${err.message}`;
        setError(errorMessage);
        toast.error(errorMessage);
        setAllEmployees([]);
        setFilteredRows([]);
      } else {
        console.log("Fetch aborted by user navigation");
      }
    } finally {
      setIsLoading(false);
      // Use setTimeout to avoid state update on unmounted component in edge cases
      setTimeout(() => setDebouncedLoading(false), 300);
      abortControllersRef.current.delete(controllerId);
    }
  }, [fromDate, toDate, fetchEmployeeDetails]);

  // Cleanup on unmount
  useEffect(() => {
    setBreadcrumbItems("Month Wise Report", BREADCRUMB_ITEMS);
    return () => {
      debouncedSearch.cancel();
      // CRITICAL: Abort all pending requests when the user leaves the page
      abortControllersRef.current.forEach(controller => controller.abort());
      abortControllersRef.current.clear();
    };
  }, [setBreadcrumbItems, debouncedSearch]);

  // Initial Fetch
  useEffect(() => {
    if (fromDate && toDate) {
      fetchEmployeeData();
    }
  }, [fromDate, toDate, fetchEmployeeData]);

  // Search Logic
  const applySearchFilter = useCallback((employees) => {
    const query = searchQuery.toLowerCase().trim();
    if (query === "") {
      setFilteredRows(employees);
    } else {
      const filtered = employees.filter(
        (emp) => emp.name.toLowerCase().includes(query) || String(emp.id).includes(query)
      );
      setFilteredRows(filtered);
    }
    setCurrentPage(1);
    setTableVersion(v => v + 1);
  }, [searchQuery]);

  useEffect(() => {
    applySearchFilter(allEmployees);
  }, [searchQuery, allEmployees, applySearchFilter]);

  const handleSearch = (e) => debouncedSearch(e.target.value || "");

  const handleFromDateChange = (date) => {
    setFromDate(date[0]);
    setError(null);
  };

  const handleToDateChange = (date) => {
    setToDate(date[0]);
    setError(null);
  };

  // Modal Logic
  const toggleModal = useCallback(() => {
    setModal((prev) => !prev);
    if (!modal) setSelectedEmployee(null);
  }, [modal]);

  const openEmployeeModal = useCallback(async (empId) => {
    if (!empId || empId === "N/A") {
      toast.error("Invalid employee ID");
      return;
    }
    try {
      setIsModalLoading(true);
      const employeeDetails = await fetchEmployeeDetails();
      const employee = employeeDetails[empId];
      if (employee) {
        setSelectedEmployee({
          empId,
          empName: employee.name,
          empDesignation: employee.designation,
          empMobileNo: employee.phone,
          empAadharNo: employee.aadharNo,
          empPanNo: employee.panNo,
          empDob: employee.dob,
          empDoj: employee.doj,
          empImage: employee.image,
          empDepartment: employee.department,
          empAddress: employee.address,
          empBankAccountNo: employee.bankAccountNo,
          empEpfNo: employee.epfNo,
          empEsiNo: employee.esiNo,
        });
        setModal(true);
      }
    } catch (err) {
      if(err.name !== "AbortError") toast.error("Failed to load employee details");
    } finally {
      setIsModalLoading(false);
    }
  }, [fetchEmployeeDetails]);

  const navigateToChart = useCallback((empId, empName) => {
    navigate("/month-wise-chart", {
      state: { empId, empName, fromDate, toDate, searchQuery, allEmployees, filteredRows },
    });
  }, [navigate, fromDate, toDate, searchQuery, allEmployees, filteredRows]);

  // Export Logic
  const exportToCSV = useCallback(() => {
    if ((allEmployees || []).length === 0) {
      toast.warn("No data available to export");
      return;
    }
    setIsExporting(true);
    try {
      const dataToDownload = (filteredRows || []).length > 0 ? filteredRows : allEmployees;
      const data = dataToDownload.map((employee) => ({
        "Employee ID": sanitizeCSVData(employee.id),
        "Name": sanitizeCSVData(employee.name),
        "Present Days": sanitizeCSVData(employee.present),
        "Absent Days": sanitizeCSVData(employee.absent),
        "Leave Days": sanitizeCSVData(employee.leaveDays),
        "Week Off": sanitizeCSVData(employee.weekOff),
        "Remaining CLs": sanitizeCSVData(employee.remainingCL),
        "OD": sanitizeCSVData(employee.od),
        "From Date": formatDateForAPI(fromDate),
        "To Date": formatDateForAPI(toDate),
      }));
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `month_wise_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV Exported successfully");
    } catch (error) {
      toast.error("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  }, [allEmployees, filteredRows, fromDate, toDate]);

  const exportToPDF = useCallback(() => {
    if ((allEmployees || []).length === 0) {
      toast.warn("No data available to export");
      return;
    }
    setIsExporting(true);
    try {
      const dataToDownload = (filteredRows || []).length > 0 ? filteredRows : allEmployees;
      const headers = ["ID", "Name", "Present", "Absent", "Leaves", "W-Off", "Rem CL", "OD"];
      const csvData = [
        headers,
        ...dataToDownload.map((row) => [
          sanitizeCSVData(row.id),
          sanitizeCSVData(row.name),
          row.present,
          row.absent,
          row.leaveDays,
          row.weekOff,
          row.remainingCL,
          row.od,
        ]),
      ];
      const doc = new jsPDF();
      autoTable(doc, {
        head: [csvData[0]],
        body: csvData.slice(1),
        startY: 20,
        styles: { fontSize: 8 },
      });
      doc.save(`month_wise_report.pdf`);
      toast.success("PDF Exported successfully");
    } catch (err) {
      toast.error("Failed to generate PDF");
    } finally {
      setIsExporting(false);
    }
  }, [allEmployees, filteredRows, fromDate, toDate]);

  // Pagination Logic
  const totalItems = (filteredRows || []).length;
  const totalPages = Math.ceil(totalItems / ENTRIES_PER_PAGE);
  const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
  const endIndex = Math.min(startIndex + ENTRIES_PER_PAGE, totalItems);
  const paginatedRows = (filteredRows || []).slice(startIndex, endIndex);

  return (
    <ErrorBoundary>
      <div className="month-wise-report">
        <Row>
          <Col xs={12}>
            <Card>
              <CardBody>
                <CardTitle className="h4">Month Wise Report</CardTitle>
                <p className="card-title-desc">View attendance summary for employees within a date range</p>

                <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap">
                  <div className="d-flex align-items-center flex-wrap gap-2">
                    <Input
                      type="text"
                      placeholder="Search by Employee ID or Name"
                      onChange={handleSearch}
                      style={{ maxWidth: "300px" }}
                    />
                    <Flatpickr
                      className="form-control"
                      value={fromDate}
                      onChange={handleFromDateChange}
                      options={{ altInput: true, altFormat: "F j, Y", dateFormat: "Y-m-d" }}
                      style={{ maxWidth: "200px" }}
                    />
                    <Flatpickr
                      className="form-control"
                      value={toDate}
                      onChange={handleToDateChange}
                      options={{ altInput: true, altFormat: "F j, Y", dateFormat: "Y-m-d" }}
                      style={{ maxWidth: "200px" }}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <Button color="success" onClick={exportToCSV} disabled={isLoading || isExporting}>
                      {isExporting ? "Exporting..." : "Export as CSV"}
                    </Button>
                    <Button color="info" onClick={exportToPDF} disabled={isLoading || isExporting}>
                      {isExporting ? "Exporting..." : "Export as PDF"}
                    </Button>
                  </div>
                </div>

                <MonthWiseTable
                  employees={paginatedRows}
                  isLoading={debouncedLoading}
                  navigateToChart={navigateToChart}
                  tableVersion={tableVersion}
                />

                {!debouncedLoading && filteredRows.length > 0 && totalPages > 1 && (
                  <Pagination className="mt-3">
                    <PaginationItem disabled={currentPage === 1}>
                      <PaginationLink previous onClick={() => setCurrentPage(c => c - 1)} />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, index) => (
                      <PaginationItem key={index} active={index + 1 === currentPage}>
                        <PaginationLink onClick={() => setCurrentPage(index + 1)}>
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem disabled={currentPage === totalPages}>
                      <PaginationLink next onClick={() => setCurrentPage(c => c + 1)} />
                    </PaginationItem>
                  </Pagination>
                )}

                {error && <div className="text-center py-4 text-danger">{error}</div>}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <ErrorBoundary>
          <Modal isOpen={modal} toggle={toggleModal} centered size="lg">
            <ModalHeader toggle={toggleModal}>Employee Full Details</ModalHeader>
            <ModalBody>
              {isModalLoading ? (
                <Loader />
              ) : selectedEmployee ? (
                <>
                  <div className="employee-image-container text-center mb-3">
                    <img
                      src={`${API_URL}/emp/uploads/${selectedEmployee.empId}.JPG`}
                      alt="Employee"
                      style={{ width: "85px", height: "85px", borderRadius: "50%", objectFit: "cover" }}
                      onError={(e) => { e.target.src = `${API_URL}/emp/uploads/default.jpg`; }}
                    />
                  </div>
                  <Table bordered>
                    <tbody>
                      <tr>
                        <td className="fw-bold">ID</td><td>{selectedEmployee.empId}</td>
                        <td className="fw-bold">Name</td><td>{selectedEmployee.empName}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Designation</td><td>{selectedEmployee.empDesignation}</td>
                        <td className="fw-bold">Department</td><td>{selectedEmployee.empDepartment}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Mobile</td><td>{selectedEmployee.empMobileNo}</td>
                        <td className="fw-bold">Aadhar</td><td>{selectedEmployee.empAadharNo}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">DOJ</td>
                        <td>{selectedEmployee.empDoj ? new Date(selectedEmployee.empDoj).toLocaleDateString() : "N/A"}</td>
                        <td className="fw-bold">DOB</td>
                        <td>{selectedEmployee.empDob ? new Date(selectedEmployee.empDob).toLocaleDateString() : "N/A"}</td>
                      </tr>
                    </tbody>
                  </Table>
                </>
              ) : (
                <p className="text-center">No details available.</p>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={toggleModal}>Close</Button>
            </ModalFooter>
          </Modal>
        </ErrorBoundary>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </ErrorBoundary>
  );
};

MonthWiseReport.propTypes = {
  setBreadcrumbItems: PropTypes.func.isRequired,
};

export default connect(null, { setBreadcrumbItems })(MonthWiseReport);