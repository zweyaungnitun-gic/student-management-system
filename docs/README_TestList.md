# Test List – Student Management System

This folder contains the **test list** for unit and end-to-end testing of the project.

## Files

- **`TestList_StudentManagementSystem.csv`** – Full test list in CSV format (open in Excel to track status).
- **`TestList_ByPageAndService.md`** – Same test cases grouped **by page (controller)** and **by service** with a short description for each.

## How to open in Excel

1. Open **Excel**.
2. **File → Open** and select `TestList_StudentManagementSystem.csv`.
3. If the **Text Import Wizard** appears:
   - Choose **Delimited** → Next.
   - Select **Comma** as delimiter → Next → Finish.
4. If you prefer to keep it as a proper Excel workbook:
   - After opening, use **File → Save As** and save as **Excel Workbook (.xlsx)**.

## Columns

| Column | Description |
|--------|-------------|
| **Test ID** | Unique id (UT-xxx = Unit, E2E-xxx = End-to-End). |
| **Category** | `Unit` or `E2E`. |
| **Module** | Component (e.g. StudentService, Auth, Registration). |
| **Test Case Title** | Short name of the test. |
| **Steps / Description** | What to do or what is under test. |
| **Endpoint / Component** | URL, method, or class/method. |
| **Expected Result** | What should happen. |
| **Priority** | High / Medium / Low. |
| **Status** | Not Run / Pass / Fail (editable in Excel). |
| **Notes** | e.g. Public, Admin only. |

## Filtering in Excel

- To see only **Unit** tests: filter the **Category** column by `Unit`.
- To see only **E2E** tests: filter by `E2E`.
- You can also filter by **Module**, **Priority**, or **Status** and use **Status** to track execution (e.g. set to Pass/Fail).

## Test ID scheme and counts

| Prefix | Category | Count | Description |
|--------|----------|-------|-------------|
| **UT-P-** | Unit (page) | 42 | One unit test per controller action (view, model, redirect). |
| **UT-S-** | Unit (service) | 51 | One or more unit tests per service method and for validation/enums. |
| **UT-V-** | Validation | 23 | Server-side and constraint validation (registration, student, user, DTOs). |
| **UI-**   | UI | 30 | Page elements, navigation, forms, role-based visibility, flash messages. |
| **E2E-**  | End-to-end | 40 | Full flow tests (HTTP, auth, redirects). |

## Coverage summary

- **Unit tests by page (UT-P-xxx)**: HomeController, AuthController, Admin/Guest dashboard, RegistrationController (all steps), StudentController (list/detail/create/update/delete/export), StudentRestController, UserController, N5/N4/InterviewNotes controllers, GlobalExceptionHandler.
- **Unit tests by service (UT-S-xxx)**: StudentService, StudentExportService, UserService, RegisterStudentService, N5ClassService, N4ClassService, InterviewNotesService, StudentIdGeneratorService, DataMigrationService, EmployeeService, CustomUserDetailsService, JwtTokenProvider, FirstPage/SecondPage/ThirdPage validation, Religion, YesNoDisplay.
- **Validation tests (UT-V-xxx)**: Registration step 1–3 (required, pattern, size), Student create/update (BasicInfo, Status, nationalID duplicate), User add/edit (username, email, password, role, duplicate email), N5/N4/InterviewNotes DTO size.
- **UI tests (UI-xxx)**: Home, Login, Registration (steps and errors), Student list/detail/update (table, search, filter, Create/Edit/Delete visibility by role), Users list/form, Dashboards, access denied, flash messages, navigation/sidebar/logout, responsive (optional).
- **E2E tests (E2E-xxx)**: Home, Login/Logout, Registration (multi-step), Student list/detail/CRUD/export, User CRUD (admin), Dashboards, API duplicate-check.

Use the CSV for execution tracking in Excel; use **TestList_ByPageAndService.md** to see the list grouped by page, service, validation, and UI.
