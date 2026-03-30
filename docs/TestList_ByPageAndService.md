# Test List by Page and Service

Unit test cases grouped **by page (controller)** and **by service** for the Student Management System.  
Full details (steps, expected results, priority, status) are in **`TestList_StudentManagementSystem.csv`**.

---

## 1. Unit tests by PAGE (controller)

Each row is one unit test case for that controller action (view name, model, status, redirect).

### 1.1 HomeController

| Test ID   | Action        | Endpoint | Test case (unit) |
|-----------|---------------|----------|-------------------|
| UT-P-001  | homePage      | GET /    | Returns view name "home/index" and 200 |

### 1.2 AuthController

| Test ID   | Action            | Endpoint        | Test case (unit) |
|-----------|-------------------|-----------------|-------------------|
| UT-P-002  | loginPage         | GET /login      | Returns view "login" |
| UT-P-003  | accessDeniedPage  | GET /access-denied | Returns view "access-denied" |

### 1.3 AdminDashboardController

| Test ID   | Action             | Endpoint             | Test case (unit) |
|-----------|--------------------|----------------------|-------------------|
| UT-P-004  | getAdminDashboard  | GET /admin/dashboard | Returns "layouts/admin-dashboard"; model has pageTitle, pageSubtitle |

### 1.4 GuestDashboardController

| Test ID   | Action              | Endpoint              | Test case (unit) |
|-----------|---------------------|------------------------|-------------------|
| UT-P-005  | getGuestDashboard   | GET /guest/dashboard  | Returns "layouts/guest-dashboard"; model has pageTitle, pageSubtitle |

### 1.5 RegistrationController

| Test ID   | Action               | Endpoint                    | Test case (unit) |
|-----------|----------------------|-----------------------------|-------------------|
| UT-P-006  | showRegistrationForm| GET /register               | Returns "register/register"; session studentData optional in model |
| UT-P-007  | secondPage           | GET /register/second-page   | Returns "register/second-page"; session data in model |
| UT-P-008  | thirdPage            | GET /register/third-page    | Returns "register/third-page"; session data in model |
| UT-P-009  | checkPage            | GET /register/check-page    | With session: "register/check-page"; without: redirect /register |
| UT-P-010  | successPage          | GET /register/success       | Returns "register/success"; model has studentId, studentName from session |
| UT-P-011  | saveStep1            | POST /register/save-step1  | Valid body: 200 + success; session has studentData. Invalid: 400 + errors |
| UT-P-012  | saveStep2            | POST /register/save-step2   | Valid + session: 200 success. No session: 400 |
| UT-P-013  | saveStep3            | POST /register/save-step3   | Valid + session: 200 success. No session: 400 |
| UT-P-014  | submitFinal          | POST /register/submit-final | With session: 200 "success", student created. No session: 400 |

### 1.6 StudentController

| Test ID   | Action              | Endpoint / method              | Test case (unit) |
|-----------|---------------------|--------------------------------|-------------------|
| UT-P-015  | getStudents         | GET /students                  | View "students/student-list"; model students, nameSearch, status; no filter → getAllStudents |
| UT-P-016  | getStudents filtered| GET /students?nameSearch=&status= | getStudentsByStatuses called; model has filtered list |
| UT-P-017  | showStudentDetails  | GET /students/detail/{id}      | View "students/student-details"; model student, n5Class, n4Class, interviewNotes, tabs; not found → exception |
| UT-P-018  | deleteStudent       | GET /students/delete/{id}      | ADMIN: deleteStudent(id) called; redirect with query params |
| UT-P-019  | createStudent       | POST /students/create          | Valid: createStudent called; redirect /students + flash success. Invalid: "students/student-form" |
| UT-P-020  | showUpdateForm      | GET /students/student-update/{id} | View "students/student-update"; model student, n5Class, n4Class, interviewNotes; not found → exception |
| UT-P-021  | updateBasicInfo     | POST /students/update-basic/{id} | Valid: save() called; redirect + flash. Invalid: return update form with errors |
| UT-P-022  | updateStatusInfo    | POST /students/update-status/{id} | Valid: save(); redirect. Invalid: return update form |
| UT-P-023  | updateN5ClassInfo   | POST /students/update-n5/{id}  | saveN5ClassDTO called; redirect + flash |
| UT-P-024  | updateN4ClassInfo   | POST /students/update-n4/{id}  | saveN4ClassDTO called; redirect + flash |
| UT-P-025  | updateInterviewNotes| POST /students/update-interview/{id} | saveInterviewNotesDTO called; redirect + flash |
| UT-P-026  | getStudentsExport   | GET /students/export           | With ids: getStudentsByIds; else getAllStudentsFull; returns list body |

### 1.7 StudentRestController

| Test ID   | Action         | Endpoint                          | Test case (unit) |
|-----------|----------------|-----------------------------------|-------------------|
| UT-P-027  | checkDuplicate | GET /api/students/check-duplicate-id | isNationalIDDuplicate called; returns boolean |

### 1.8 UserController

| Test ID   | Action        | Endpoint              | Test case (unit) |
|-----------|----------------|------------------------|-------------------|
| UT-P-028  | listUsers      | GET /users             | View "users/list-dashboard"; model users, search; searchUsers(search) used |
| UT-P-029  | addUserForm    | GET /users/add         | View "users/add"; model user (new), roles |
| UT-P-030  | addUser        | POST /users/add        | Valid + email unique: createUser; redirect /users + success. Duplicate email: reject. Invalid: "users/add" |
| UT-P-031  | editUserFormPost | POST /users/edit     | Redirect or view "users/edit"; model user, roles; not found → redirect + error |
| UT-P-032  | updateUser     | POST /users/edit/{id}  | Valid: updateUser; redirect + success. Duplicate email (other user): reject. Optional newPassword applied |
| UT-P-033  | deleteUser     | GET /users/delete/{id}  | deleteUser(id); redirect /users + success or error |

### 1.9 N5ClassController

| Test ID   | Action            | Endpoint                     | Test case (unit) |
|-----------|-------------------|------------------------------|-------------------|
| UT-P-034  | showN5ClassForm   | GET /students/{id}/n5-class   | Returns view/fragment with N5 form for studentId |
| UT-P-035  | saveN5ClassForm   | POST /students/{id}/n5-class | saveN5ClassDTO called; redirect or success |

### 1.10 N4ClassController

| Test ID   | Action            | Endpoint                     | Test case (unit) |
|-----------|-------------------|------------------------------|-------------------|
| UT-P-036  | showN4ClassForm   | GET /students/{id}/n4-class   | Returns view/fragment with N4 form for studentId |
| UT-P-037  | saveN4ClassForm   | POST /students/{id}/n4-class | saveN4ClassDTO called; redirect or success |

### 1.11 InterviewNotesController

| Test ID   | Action                 | Endpoint                          | Test case (unit) |
|-----------|------------------------|-----------------------------------|-------------------|
| UT-P-038  | showInterviewNotesForm | GET /students/{id}/interview-notes | Returns form view for studentId |
| UT-P-039  | saveInterviewNotesForm | POST /students/{id}/interview-notes | saveInterviewNotesDTO called; redirect or success |

### 1.12 GlobalExceptionHandler

| Test ID   | Handler                  | Test case (unit) |
|-----------|--------------------------|-------------------|
| UT-P-040  | handleIllegalArgument    | IllegalArgumentException → error view/model |
| UT-P-041  | handleMethodNotAllowed   | HttpRequestMethodNotSupportedException → error view |
| UT-P-042  | handleValidation        | MethodArgumentNotValidException → validation error view/model |

---

## 2. Unit tests by SERVICE

Each service method has at least one unit test case (and edge cases where needed).

### 2.1 StudentService

| Test ID   | Method                    | Test case (unit) |
|-----------|---------------------------|-------------------|
| UT-S-001  | getAllStudents            | Returns list of StudentDTO (empty or ordered) |
| UT-S-002  | getStudentsByFilter       | Returns filtered list by nameSearch and status |
| UT-S-003  | getStudentById(id)        | Found: returns StudentDTO; not found: empty/exception |
| UT-S-004  | createStudent(dto)         | Valid: creates entity, returns DTO with studentId |
| UT-S-005  | updateStudent(id, dto)     | Updates and returns StudentDTO |
| UT-S-006  | deleteStudent(id)          | Deletes student and cascades N5/N4/InterviewNotes |
| UT-S-007  | findAll                   | Returns list of Student entities |
| UT-S-008  | findById(id)              | Returns Optional<Student> |
| UT-S-009  | getStudentsByFilterFull   | Returns list of Student by name and status |
| UT-S-010  | save(student)             | Persists and returns saved Student |
| UT-S-011  | getStudentsByStatuses    | Returns StudentDTO list filtered by name and status list |
| UT-S-012  | findAllByIds(ids)        | Returns list of Student for given ids |
| UT-S-013  | isNationalIDDuplicate    | true when duplicate (excluding excludeId); false otherwise |

### 2.2 StudentExportService

| Test ID   | Method                | Test case (unit) |
|-----------|-----------------------|-------------------|
| UT-S-014  | getAllStudentsFull    | Returns List<StudentFullExportDTO> with optional name/status filter |
| UT-S-015  | getStudentsByIds      | Returns List<StudentFullExportDTO> for given ids |

### 2.3 UserService

| Test ID   | Method                | Test case (unit) |
|-----------|-----------------------|-------------------|
| UT-S-016  | getAllUsers           | Returns list of all users |
| UT-S-017  | getUserById(id)       | Returns Optional<User> |
| UT-S-018  | getUserByEmail(email) | Returns Optional<User> |
| UT-S-019  | createUser(user)      | Encodes password; saves and returns User |
| UT-S-020  | updateUser(id, user)  | Updates and returns User |
| UT-S-021  | updateUserPassword    | Updates password (encoded) for user id |
| UT-S-022  | deleteUser(id)        | Removes user |
| UT-S-023  | existsByEmail(email) | Returns true/false |
| UT-S-024  | searchUsers(search)  | Returns list matching name or email |

### 2.4 RegisterStudentService

| Test ID   | Method                | Test case (unit) |
|-----------|-----------------------|-------------------|
| UT-S-025  | registerStudent(dto)  | Maps DTO to Student; saves; returns entity with studentId |
| UT-S-026  | generateStudentId     | Returns unique ID (e.g. STU001, STU002) |

### 2.5 N5ClassService

| Test ID   | Method                 | Test case (unit) |
|-----------|------------------------|-------------------|
| UT-S-027  | getOrCreateN5ClassDTO  | Returns N5ClassDTO; creates entity if missing for studentId |
| UT-S-028  | saveN5ClassDTO         | Saves/updates N5 class for studentId |

### 2.6 N4ClassService

| Test ID   | Method                 | Test case (unit) |
|-----------|------------------------|-------------------|
| UT-S-029  | getOrCreateN4ClassDTO  | Returns N4ClassDTO; creates entity if missing |
| UT-S-030  | saveN4ClassDTO         | Saves/updates N4 class for studentId |

### 2.7 InterviewNotesService

| Test ID   | Method                    | Test case (unit) |
|-----------|---------------------------|-------------------|
| UT-S-031  | getOrCreateInterviewNotesDTO | Returns DTO; creates entity if missing |
| UT-S-032  | saveInterviewNotesDTO     | Saves/updates interview notes for studentId |

### 2.8 StudentIdGeneratorService

| Test ID   | Method           | Test case (unit) |
|-----------|------------------|-------------------|
| UT-S-033  | generateStudentId | No students or max not STUxxx: "STU001". Else: next number STU002, STU003... |
| UT-S-034  | generateStudentId | Parse exception fallback: uses count()+1 for ID |

### 2.9 DataMigrationService

| Test ID   | Method               | Test case (unit) |
|-----------|----------------------|-------------------|
| UT-S-035  | migrateExistingData  | Fixes null createdAt/enrolledDate; saves only changed; no-op when all valid |

### 2.10 DataMigrationService

| Test ID   | Method               | Test case (unit) |
|-----------|----------------------|-------------------|
| UT-S-036  | migrateExistingData  | Fixes null createdAt/enrolledDate; saves only changed; no-op when all valid |

### 2.11 EmployeeService

| Test ID   | Method              | Test case (unit) |
|-----------|---------------------|-------------------|
| UT-S-037  | getEmployeeSnapshot | Returns EmployeeListResponse |
| UT-S-038  | getEmployeeStats    | Returns EmployeeStats |
| UT-S-039  | getEmployee(id)     | Returns EmployeeResponse; not found as designed |
| UT-S-040  | createEmployee(req) | Creates and returns EmployeeResponse |
| UT-S-041  | updateEmployee(id, req) | Updates and returns EmployeeResponse |
| UT-S-042  | deleteEmployee(id)  | Deletes employee |

### 2.12 Security / validation / enums

| Test ID   | Component                 | Test case (unit) |
|-----------|----------------------------|-------------------|
| UT-S-043  | CustomUserDetailsService  | loadUserByUsername: returns UserDetails or throws |
| UT-S-044  | CustomUserDetailsService  | loadUserByUsername not found: throws |
| UT-S-045  | JwtTokenProvider          | generateToken / validateToken |
| UT-S-046  | JwtTokenProvider          | validateToken invalid |
| UT-S-047  | FirstPageValidation       | Valid/invalid StudentRegistrationDTO first page |
| UT-S-048  | SecondPageValidation      | Valid/invalid second page |
| UT-S-049  | ThirdPageValidation       | Valid/invalid third page |
| UT-S-050  | Religion                  | getLabelFromValue for each value |
| UT-S-051  | YesNoDisplay              | from(Boolean) mapping |

---

## 3. Validation test cases (UT-V-xxx)

Server-side and constraint validation: required fields, patterns, size, duplicate checks.

### 3.1 Registration

| Test ID   | Scope | Test case |
|-----------|--------|-----------|
| UT-V-001  | Step 1 | englishName required and pattern (English only) |
| UT-V-002  | Step 1 | katakanaName required and pattern (カタカナ) |
| UT-V-003  | Step 1 | dob required and format YYYY-MM-DD |
| UT-V-004  | Step 1 | gender required and 男性/女性 only |
| UT-V-005  | Step 1 | currentAddress, hometownAddress required; max 100 |
| UT-V-006  | Step 1 | phoneNumber, guardianPhoneNumber pattern (09 or +959) |
| UT-V-007  | Step 1 | Size limits (englishName 20, katakanaName 20, address 100) |
| UT-V-008  | Step 2 | fatherName required and pattern |
| UT-V-009  | Step 2 | passportNumber format (optional; if present valid) |
| UT-V-010  | Step 2 | nationalIdNumber required and format |
| UT-V-011  | Step 2 | otherOccupation max 20 |
| UT-V-012  | Step 3 | otherReligion max 20 |

### 3.2 Student

| Test ID   | Scope | Test case |
|-----------|--------|-----------|
| UT-V-013  | Create | BasicInfoGroup required fields; return form on error |
| UT-V-014  | Update basic | nationalID duplicate for another student → rejectValue |
| UT-V-015  | Update status | StatusGroup required; return form on error |

### 3.3 User

| Test ID   | Scope | Test case |
|-----------|--------|-----------|
| UT-V-016  | Add | username required; max 25 |
| UT-V-017  | Add | email required, valid format, duplicate rejected |
| UT-V-018  | Add | password required |
| UT-V-019  | Add | role required |
| UT-V-020  | Edit | email duplicate for other user → rejectValue |

### 3.4 DTOs (N5, N4, InterviewNotes)

| Test ID   | Scope | Test case |
|-----------|--------|-----------|
| UT-V-021  | N5ClassDTO | teacher/feedback size limits |
| UT-V-022  | N4ClassDTO | teacher/feedback size limits |
| UT-V-023  | InterviewNotesDTO | interview fields max 500 |

---

## 4. UI test cases (UI-xxx)

Page structure, elements visibility, navigation, role-based UI, messages.

### 4.1 Home and Auth

| Test ID   | Page | Test case |
|-----------|------|-----------|
| UI-001    | Home | Page title and GIC logo visible |
| UI-002    | Home | Links to /register and /login present |
| UI-003    | Login | Email, password, submit button visible |
| UI-004    | Login | Error message on invalid login |

### 4.2 Registration

| Test ID   | Test case |
|-----------|-----------|
| UI-005    | Step 1 form fields visible and labeled |
| UI-006    | Step indicator and Next button |
| UI-007    | Validation errors displayed on step1 submit |
| UI-008    | Step 2 and 3 navigation and fields |
| UI-009    | Check page summary and submit |
| UI-010    | Success page shows student ID and name |

### 4.3 Student list and detail

| Test ID   | Test case |
|-----------|-----------|
| UI-011    | Student list table and columns |
| UI-012    | Search and filter controls |
| UI-013    | Create button visible for Admin only |
| UI-014    | Export button visible and works |
| UI-015    | Detail tabs and content |
| UI-016    | Edit button Admin only |
| UI-017    | Delete link Admin only |
| UI-018    | Update form tabs and save per section |
| UI-019    | Validation errors on update form |
| UI-020    | Success flash after create |
| UI-021    | Success flash after update |

### 4.4 Users and dashboards

| Test ID   | Test case |
|-----------|-----------|
| UI-022    | Users list table and search |
| UI-023    | Add user, Edit, Delete actions |
| UI-024    | Add user form fields |
| UI-025    | Validation errors on add user |
| UI-026    | Admin dashboard content |
| UI-027    | Guest dashboard content |
| UI-028    | Access denied page content |
| UI-029    | Student list responsive (narrow viewport) |
| UI-030    | Sidebar and logout navigation |

---

## 5. Summary counts

| Category        | Count |
|----------------|-------|
| Page (controller) unit tests | 42 (UT-P-001 … UT-P-042) |
| Service unit tests         | 51 (UT-S-001 … UT-S-051) |
| Validation tests            | 23 (UT-V-001 … UT-V-023) |
| UI tests                    | 30 (UI-001 … UI-030) |
| E2E tests                   | 40 (E2E-001 … E2E-040) |
| **Total**                   | **186** |

---

**CSV file:** All test cases are in **`TestList_StudentManagementSystem.csv`** with columns: Test ID, Category, Module, Test Case Title, Steps, Endpoint/Component, Expected Result, Priority, Status, Notes. Use the CSV for execution tracking in Excel.
