import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMonthlyAttendance, updateAttendanceStatus } from "../../services/api";

function MonthlyAttendance() {
  const { token } = useAuth();

  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [savingCell, setSavingCell] = useState("");
  const [statusError, setStatusError] = useState("");
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    loadMonthlyAttendance();
  }, [year, month]);

  async function loadMonthlyAttendance() {
    try {
      setLoading(true);
      setError("");

      const result = await getMonthlyAttendance(
        token,
        year,
        month
      );

      setData(result);
    } catch (error) {
      console.error(error);
      setError("Unable to load monthly attendance.");
    } finally {
      setLoading(false);
    }
  }

  const monthName = new Date(
    year,
    month - 1,
    1
  ).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const days = Array.from(
    { length: data?.daysInMonth || 0 },
    (_, index) => index + 1
  );

  function getDayName(day) {
    return new Date(
      year,
      month - 1,
      day
    ).toLocaleDateString("en-IN", {
      weekday: "short",
    });
  }

  function getStatus(employee, day) {
    const recordedStatus = employee.attendance?.[day];
    if (recordedStatus) return recordedStatus;
    const dayType = data?.nonWorkingDays?.[day];
    if (dayType) return dayType;

    const attendanceDate = new Date(year, month - 1, day);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    return attendanceDate < currentDate ? "ABSENT" : "-";
  }

  function getStatusClass(status) {
    if (status === "PRESENT") {
      return "present";
    }

    if (status === "ABSENT") {
      return "absent";
    }

    if (status === "HALF_DAY") return "halfday";
    if (status === "LEAVE") return "leave";
    if (status === "HOLIDAY") return "holiday";
    if (status === "WEEKLY_OFF") return "weekoff";

    return "empty";
  }

  function getStatusLabel(status) {
    return ({ PRESENT: "P", ABSENT: "A", HALF_DAY: "HD", LEAVE: "L", HOLIDAY: "H", WEEKLY_OFF: "WO" })[status] || "-";
  }

  function requestAttendanceStatusChange(employee, day) {
    const currentStatus = getStatus(employee, day);
    if (currentStatus !== "PRESENT" && currentStatus !== "ABSENT") return;

    const nextStatus = currentStatus === "PRESENT" ? "ABSENT" : "PRESENT";
    setStatusError("");
    setPendingStatusChange({ employee, day, currentStatus, nextStatus });
  }

  async function confirmAttendanceStatusChange() {
    if (!pendingStatusChange) return;

    const { employee, day, nextStatus } = pendingStatusChange;
    const cellKey = `${employee.employeeId}-${day}`;
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    setSavingCell(cellKey);
    setStatusError("");

    try {
      await updateAttendanceStatus(token, employee.employeeId, date, nextStatus);
      setData((currentData) => ({
        ...currentData,
        employees: currentData.employees.map((currentEmployee) =>
          currentEmployee.employeeId === employee.employeeId
            ? {
                ...currentEmployee,
                attendance: {
                  ...currentEmployee.attendance,
                  [day]: nextStatus,
                },
              }
            : currentEmployee
        ),
      }));
      setPendingStatusChange(null);
    } catch (updateError) {
      console.error(updateError);
      setStatusError(
        updateError.response?.data?.message || "Unable to update this attendance status. Please try again."
      );
    } finally {
      setSavingCell("");
    }
  }

  const employees = data?.employees || [];
  const visibleEmployees = employees.filter((employee) => {
    const query = employeeSearch.trim().toLowerCase();
    return !query || [
      employee.firstName,
      employee.lastName,
      employee.employeeCode,
      employee.department,
    ].some((value) => value?.toLowerCase().includes(query));
  });
  const presentCount = employees.reduce(
    (total, employee) => total + days.filter((day) => getStatus(employee, day) === "PRESENT").length,
    0
  );
  const absentCount = employees.reduce(
    (total, employee) => total + days.filter((day) => getStatus(employee, day) === "ABSENT").length,
    0
  );
  const halfDayCount = employees.reduce(
    (total, employee) => total + days.filter((day) => getStatus(employee, day) === "HALF_DAY").length,
    0
  );
  const countedAttendanceDays = presentCount + halfDayCount + absentCount;
  const attendanceRate = countedAttendanceDays
    ? Math.round(((presentCount + halfDayCount * 0.5) / countedAttendanceDays) * 100)
    : 0;

  async function exportExcel() {
    if (!data || employees.length === 0) return;

    setExporting(true);
    setExportError("");

    try {
      const { default: ExcelJS } = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "AttendPro";
      workbook.created = new Date();
      const worksheet = workbook.addWorksheet("Monthly Attendance", {
        properties: { defaultRowHeight: 22 },
        views: [{ state: "frozen", xSplit: 3, ySplit: 6, topLeftCell: "D7" }],
        pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
      });

      const headerRow = 6;
      const lastColumn = 3 + days.length + 3;
      const lastColumnLetter = worksheet.getColumn(lastColumn).letter;

      worksheet.mergeCells(`A1:${lastColumnLetter}1`);
      worksheet.getCell("A1").value = `Attendance Sheet — ${monthName}`;
      worksheet.getCell("A1").font = { name: "Aptos Display", size: 18, bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF17365D" } };
      worksheet.getCell("A1").alignment = { vertical: "middle" };
      worksheet.getRow(1).height = 34;

      worksheet.mergeCells(`A2:${lastColumnLetter}2`);
      worksheet.getCell("A2").value = "Daily attendance by employee. P = Present, A = Absent, – = No record.";
      worksheet.getCell("A2").font = { italic: true, color: { argb: "FF526174" } };

      const summary = [
        ["Employees", employees.length],
        ["Present days", presentCount],
        ["Half days", halfDayCount],
        ["Absent days", absentCount],
        ["Attendance rate", `${attendanceRate}%`],
      ];
      summary.forEach(([label, value], index) => {
        const labelCell = worksheet.getCell(4, index * 2 + 1);
        const valueCell = worksheet.getCell(4, index * 2 + 2);
        labelCell.value = label;
        valueCell.value = value;
        labelCell.font = { bold: true, color: { argb: "FF334155" } };
        valueCell.font = { bold: true, color: { argb: "FF17365D" } };
        labelCell.fill = valueCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEAF0F6" },
        };
      });

      const headers = [
        "Employee Code",
        "Employee",
        "Department",
        ...days.map((day) => `${day} ${getDayName(day)}`),
        "Present Days",
        "Half Days",
        "Absent Days",
      ];
      const header = worksheet.getRow(headerRow);
      header.values = [undefined, ...headers];
      header.height = 30;
      header.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = { bottom: { style: "medium", color: { argb: "FF17365D" } } };
      });

      employees.forEach((employee, employeeIndex) => {
        const dailyStatuses = days.map((day) => getStatus(employee, day));
        const row = worksheet.addRow([
          employee.employeeCode || "",
          `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
          employee.department || "",
          ...dailyStatuses,
          dailyStatuses.filter((status) => status === "PRESENT").length,
          dailyStatuses.filter((status) => status === "HALF_DAY").length,
          dailyStatuses.filter((status) => status === "ABSENT").length,
        ]);

        row.height = 24;
        if (employeeIndex % 2 === 1) {
          row.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F8FC" } };
          });
        }

        row.eachCell((cell, columnNumber) => {
          cell.alignment = {
            horizontal: columnNumber > 3 && columnNumber <= 3 + days.length ? "center" : "left",
            vertical: "middle",
          };
          cell.border = { bottom: { style: "hair", color: { argb: "FFD7E0EA" } } };
          if (columnNumber > 3 && columnNumber <= 3 + days.length) {
            if (["PRESENT", "ABSENT", "HALF_DAY", "LEAVE", "HOLIDAY", "WEEKLY_OFF"].includes(cell.value)) {
              const originalStatus = cell.value;
              cell.value = getStatusLabel(originalStatus);
              if (originalStatus === "PRESENT") {
              cell.font = { bold: true, color: { argb: "FF166534" } };
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCFCE7" } };
              } else if (originalStatus === "ABSENT") {
              cell.font = { bold: true, color: { argb: "FFB91C1C" } };
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
              } else if (originalStatus === "HALF_DAY") {
                cell.font = { bold: true, color: { argb: "FF6B21A8" } };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3E8FF" } };
              } else if (originalStatus === "LEAVE") {
                cell.font = { color: { argb: "FF1D4ED8" } };
              } else {
                cell.font = { color: { argb: "FF64748B" } };
              }
            } else {
              cell.value = "–";
              cell.font = { color: { argb: "FF94A3B8" } };
            }
          }
        });
      });

      worksheet.columns = [
        { width: 17 },
        { width: 28 },
        { width: 20 },
        ...days.map(() => ({ width: 11 })),
        { width: 15 },
        { width: 15 },
        { width: 15 },
      ];
      worksheet.autoFilter = {
        from: { row: headerRow, column: 1 },
        to: { row: headerRow + employees.length, column: lastColumn },
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const url = URL.createObjectURL(new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance-${year}-${String(month).padStart(2, "0")}.xlsx`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error(error);
      setExportError("Unable to create the Excel workbook. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div style={styles.page}>

      <div style={styles.header}>

        <div>
          <h1 style={styles.title}>
            Attendance Sheet
          </h1>

          <p style={styles.subtitle}>
            Monthly employee attendance
          </p>
        </div>

        <div style={styles.controls}>

          <select
            aria-label="Attendance month"
            value={month}
            onChange={(event) =>
              setMonth(Number(event.target.value))
            }
            style={styles.select}
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option
                key={index + 1}
                value={index + 1}
              >
                {new Date(
                  2000,
                  index,
                  1
                ).toLocaleString("en-IN", {
                  month: "long",
                })}
              </option>
            ))}
          </select>

          <select
            aria-label="Attendance year"
            value={year}
            onChange={(event) =>
              setYear(Number(event.target.value))
            }
            style={styles.select}
          >
            {Array.from(
              { length: 5 },
              (_, index) =>
                today.getFullYear() - 2 + index
            ).map((yearValue) => (
              <option
                key={yearValue}
                value={yearValue}
              >
                {yearValue}
              </option>
            ))}
          </select>

          <button
            onClick={loadMonthlyAttendance}
            style={styles.refreshButton}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

        </div>

      </div>


      {/* Summary */}

      <div style={styles.summary}>

        <div style={styles.summaryCard}>
          <span>Total Employees</span>
          <strong>
            {loading
              ? "..."
              : data?.totalEmployees ?? 0}
          </strong>
        </div>

        <div style={styles.summaryCard}>
          <span>Present</span>
          <strong>
            {loading
              ? "..."
              : presentCount}
          </strong>
        </div>

        <div style={styles.summaryCard}>
          <span>Half Days</span>
          <strong>{loading ? "..." : halfDayCount}</strong>
        </div>

        <div style={styles.summaryCard}>
          <span>Absent</span>
          <strong>
            {loading
              ? "..."
              : absentCount}
          </strong>
        </div>

        <div style={styles.summaryCard}>
          <span>Attendance Rate</span>
          <strong>
            {loading
              ? "..."
              : `${attendanceRate}%`}
          </strong>
        </div>

      </div>


      <div style={styles.monthToolbar}>
        <div>
          <h2 style={styles.monthTitle}>{monthName}</h2>
          <p style={styles.resultCount}>
            Showing {visibleEmployees.length} of {employees.length} employees
          </p>
        </div>
        <label style={styles.searchLabel}>
          <span>Find an employee</span>
          <input
            type="search"
            value={employeeSearch}
            onChange={(event) => setEmployeeSearch(event.target.value)}
            placeholder="Name, code, or department"
            style={styles.searchInput}
          />
        </label>
        <button
          type="button"
          onClick={exportExcel}
          style={styles.exportButton}
          disabled={loading || exporting || employees.length === 0}
        >
          {exporting ? "Creating workbook..." : "Export Excel"}
        </button>
      </div>

      {exportError && <div role="alert" style={styles.error}>{exportError}</div>}


      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* Attendance table */}

      <div style={styles.tableContainer}>

        {loading ? (
          <div style={styles.loading}>
            Loading attendance...
          </div>
        ) : error ? (
          <div style={styles.loading}>Attendance data could not be loaded.</div>
        ) : employees.length === 0 ? (
          <div style={styles.loading}>No employee attendance data is available for this month.</div>
        ) : visibleEmployees.length === 0 ? (
          <div style={styles.loading}>No employees match your search. Try another name, code, or department.</div>
        ) : (

          <table style={styles.table}>

            <thead>
              <tr>

                <th style={styles.employeeHeader}>
                  Employee
                </th>

                <th style={styles.departmentHeader}>
                  Department
                </th>

                {days.map((day) => (
                  <th
                    key={day}
                    style={styles.dayHeader}
                  >
                    <div>{day}</div>

                    <small>
                      {getDayName(day)}
                    </small>
                  </th>
                ))}

              </tr>
            </thead>

            <tbody>

              {visibleEmployees.map((employee) => (

                <tr key={employee.employeeId}>

                  <td style={styles.employeeCell}>

                    <div style={styles.employeeName}>
                      {employee.firstName}{" "}
                      {employee.lastName}
                    </div>

                    <div style={styles.employeeCode}>
                      {employee.employeeCode}
                    </div>

                  </td>

                  <td style={styles.departmentCell}>
                    {employee.department || "-"}
                  </td>

                  {days.map((day) => {

                    const status =
                      getStatus(
                        employee,
                        day
                      );

                    return (
                      <td
                        key={day}
                        style={styles.statusCell}
                      >
                        {status === "PRESENT" || status === "ABSENT" ? (
                          <button
                            type="button"
                            className={getStatusClass(status)}
                            style={{
                              ...styles.statusButton,
                              ...(status === "PRESENT" ? styles.present : styles.absent),
                              ...(savingCell === `${employee.employeeId}-${day}` ? styles.savingStatus : {}),
                            }}
                            disabled={savingCell === `${employee.employeeId}-${day}`}
                            onClick={() => requestAttendanceStatusChange(employee, day)}
                            title={`Change ${status.toLowerCase()} to ${status === "PRESENT" ? "absent" : "present"}`}
                            aria-label={`${employee.firstName} ${employee.lastName}, ${getDayName(day)} ${day}: ${status.toLowerCase()}. Click to change to ${status === "PRESENT" ? "absent" : "present"}.`}
                          >
                            {savingCell === `${employee.employeeId}-${day}` ? "…" : status === "PRESENT" ? "P" : "A"}
                          </button>
                        ) : (
                          <span style={{ ...styles.statusBadge, ...(status === "HALF_DAY" ? styles.halfDayBadge : status === "LEAVE" ? styles.leaveBadge : status === "HOLIDAY" ? styles.holidayBadge : status === "WEEKLY_OFF" ? styles.weekOffBadge : styles.empty) }} title={status.replaceAll("_", " ")}>{getStatusLabel(status)}</span>
                        )}
                      </td>
                    );
                  })}

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>


      <div style={styles.legend}>

        <span>
          <b style={styles.presentLegend}>
            P
          </b>{" "}
          Present
        </span>

        <span>
          <b style={styles.absentLegend}>
            A
          </b>{" "}
          Absent
        </span>

        <span>
          <b style={styles.emptyLegend}>
            -
          </b>{" "}
          No record
        </span>
        <span><b style={styles.halfDayLegend}>HD</b> Half day</span>
        <span><b style={styles.leaveLegend}>L</b> Approved leave</span>
        <span><b style={styles.dayOffLegend}>H / WO</b> Holiday / weekly off</span>

        <span style={styles.editHint}>
          Click P or A, then confirm to change a recorded status
        </span>

      </div>

      {pendingStatusChange && (
        <div style={styles.dialogBackdrop}>
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="attendance-status-dialog-title"
            aria-describedby="attendance-status-dialog-description"
            style={styles.dialog}
          >
            <h2 id="attendance-status-dialog-title" style={styles.dialogTitle}>
              Confirm attendance change
            </h2>
            <p id="attendance-status-dialog-description" style={styles.dialogText}>
              Change {pendingStatusChange.employee.firstName} {pendingStatusChange.employee.lastName}’s status for {new Date(year, month - 1, pendingStatusChange.day).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} from {pendingStatusChange.currentStatus} to {pendingStatusChange.nextStatus}?
            </p>
            {statusError && <p role="alert" style={styles.dialogError}>{statusError}</p>}
            <div style={styles.dialogActions}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={() => setPendingStatusChange(null)}
                disabled={Boolean(savingCell)}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                style={styles.confirmButton}
                onClick={confirmAttendanceStatusChange}
                disabled={Boolean(savingCell)}
              >
                {savingCell ? "Saving..." : "Confirm change"}
              </button>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}


const styles = {

  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
    padding: "30px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    color: "#1f2937",
  },

  subtitle: {
    marginTop: "6px",
    color: "#6b7280",
  },

  controls: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  select: {
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    fontSize: "14px",
  },

  refreshButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
  },

  exportButton: {
    minHeight: "42px",
    padding: "10px 16px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#1f2937",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
  },

  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "18px",
    marginBottom: "25px",
  },

  summaryCard: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  monthTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1f2937",
  },

  monthToolbar: {
    display: "flex",
    alignItems: "end",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "15px",
  },

  searchLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: "1 1 240px",
    color: "#374151",
    fontSize: "13px",
    fontWeight: 600,
  },

  searchInput: {
    width: "100%",
    minHeight: "42px",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
  },

  resultCount: {
    marginTop: "5px",
    color: "#6b7280",
    fontSize: "13px",
  },

  tableContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    overflowX: "auto",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  table: {
    borderCollapse: "collapse",
    width: "max-content",
    minWidth: "100%",
  },

  employeeHeader: {
    position: "sticky",
    left: 0,
    backgroundColor: "#f9fafb",
    padding: "14px 18px",
    textAlign: "left",
    minWidth: "220px",
    borderBottom: "1px solid #e5e7eb",
    zIndex: 2,
  },

  departmentHeader: {
    padding: "14px",
    backgroundColor: "#f9fafb",
    minWidth: "110px",
    borderBottom: "1px solid #e5e7eb",
  },

  dayHeader: {
    padding: "8px 10px",
    minWidth: "48px",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "center",
    fontSize: "13px",
  },

  employeeCell: {
    position: "sticky",
    left: 0,
    backgroundColor: "#ffffff",
    padding: "14px 18px",
    borderBottom: "1px solid #e5e7eb",
    zIndex: 1,
  },

  employeeName: {
    fontWeight: "bold",
    color: "#1f2937",
  },

  employeeCode: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },

  departmentCell: {
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    color: "#4b5563",
    textAlign: "center",
  },

  statusCell: {
    textAlign: "center",
    padding: "10px 6px",
    borderBottom: "1px solid #e5e7eb",
  },

  present: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#dcfce7",
    color: "#15803d",
    fontWeight: "bold",
    fontSize: "12px",
  },

  statusButton: {
    border: 0,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "transform 120ms ease, box-shadow 120ms ease",
  },

  savingStatus: {
    opacity: 0.6,
    cursor: "wait",
  },

  absent: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    fontWeight: "bold",
    fontSize: "12px",
  },

  empty: {
    color: "#9ca3af",
    fontWeight: "bold",
  },

  loading: {
    padding: "50px",
    textAlign: "center",
    color: "#6b7280",
  },

  error: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "15px",
  },

  legend: {
    display: "flex",
    gap: "25px",
    marginTop: "15px",
    color: "#6b7280",
    fontSize: "14px",
  },

  presentLegend: {
    color: "#15803d",
  },

  absentLegend: {
    color: "#dc2626",
  },

  emptyLegend: {
    color: "#9ca3af",
  },

  statusBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, height: 28, padding: "0 5px", borderRadius: 15, fontSize: 10, fontWeight: 700, boxSizing: "border-box" },
  halfDayBadge: { background: "#f3e8ff", color: "#7e22ce" },
  leaveBadge: { background: "#dbeafe", color: "#1d4ed8" },
  holidayBadge: { background: "#ccfbf1", color: "#0f766e" },
  weekOffBadge: { background: "#e2e8f0", color: "#475569" },
  halfDayLegend: { color: "#7e22ce" },
  leaveLegend: { color: "#1d4ed8" },
  dayOffLegend: { color: "#0f766e" },

  editHint: {
    marginLeft: "auto",
    color: "#4b5563",
  },

  dialogBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    backgroundColor: "rgba(15, 23, 42, 0.48)",
  },

  dialog: {
    width: "100%",
    maxWidth: "440px",
    padding: "24px",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.25)",
  },

  dialogTitle: {
    margin: 0,
    color: "#1f2937",
    fontSize: "20px",
  },

  dialogText: {
    marginTop: "12px",
    color: "#4b5563",
    lineHeight: 1.5,
  },

  dialogError: {
    marginTop: "12px",
    color: "#b91c1c",
    fontSize: "14px",
  },

  dialogActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "24px",
  },

  cancelButton: {
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#374151",
    cursor: "pointer",
  },

  confirmButton: {
    padding: "10px 14px",
    border: 0,
    borderRadius: "7px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default MonthlyAttendance;
