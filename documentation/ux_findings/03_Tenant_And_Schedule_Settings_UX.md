# Feature-Specific UX Findings: Tenant & Schedule Management

## Document Intent
This document maps out the administrative UX workflows enabling Tenant Admins to manage critical compliance infrastructure that affects how TAT Rules execute globally—specifically Work Schedules and Holiday Calendars.

## Feature Overview
The Rule Engine relies on global tenant variables (like business hours and observed holidays) to calculate accurate turnaround deadlines. The Tenant Settings Hub provides the administrative interfaces to define, update, and manage this foundation without needing direct database access.

---

### Phase 1: The Tenant Settings Hub

#### **1. Centralized Navigation**
*   **UX Pattern:** Administrative Dashboard Grid.
*   **Interaction:** A macro-level launching point presenting clear, distinct domains of ownership for a Tenant Admin.
*   **Card Components:**
    *   **Work Schedules:** "Define operational hours for Business Hours clock logic."
    *   **Holiday Calendars:** "Manage observed client and provider holiday exclusions."
    *   **User Management:** (Future Scope) "Manage Analyst & Compliance roles."
    *   **Application Registration:** (Future Scope) "Manage API access for external systems."

#### **2. Hub Layout Strategy**
*   **Information Architecture:** Each card contains top-level metrics to prevent unnecessary clicking. (e.g., The Work Schedules card displays "Active Default: Standard 8-5 M-F", and the Holiday Calendars card displays "3 Calendars Managing 45 Dates").

---

### Phase 2: Work Schedule Editor (The Business Hours Engine)

#### **1. The Core Interaction Model**
*   **Goal:** Allow an admin to visually define a 7-day recurring operational schedule.
*   **UX Pattern:** 7-Day Grid / ListView.
*   **Row Interactions:**
    *   **Day Toggle:** A prominent binary switch (Working Day vs. Non-Working Day).
    *   **Time Pickers:** When a day is toggled ON, two inputs (`Start Time` and `End Time`) become active. When OFF, they are disabled/dimmed to ensure data cleanliness.
    *   **UX Feedback:** As the user adjusts hours, a top-level badge recalculates the total weekly throughput (e.g., "Total Coverage: 40 Hours / Week").

#### **2. Guardrails & Validation**
*   **Time Logic Validation:** `End Time` must strictly be greater than `Start Time`. If an admin inputs `09:00 AM` to `08:00 AM`, an inline error disables the Save button and flags the row in red ("End time must be after start time").
*   **Overnight Logic (Edge Case):** If the business operates across midnight (e.g., 8:00 PM to 4:00 AM), the UI must explicitly message how this connects to the next calendar day to prevent ambiguity.

#### **3. Schedule Management**
*   **Pattern:** Multiple named schedules.
*   **The Default State:** The system requires exactly one schedule to be active and tagged as Default.
*   **Assignment Component:** An interactive badge/button ("Set as Default"). Setting a new Default immediately recalculates "Business Hours" logic for inflight cases globally—an action requiring a stern warning modal confirming the broad impact.

---

### Phase 3: Holiday Calendar Manager (SCR-006)

#### **1. The Split Interface Paradigm**
*   **UX Pattern:** Left Sidebar + Right Detail Workspace.
*   **Sidebar Navigation:** Lists all available calendars grouped strategically by Type (`Client`, `Provider`, `Custom`). Contains the primary "+ New Calendar" CTA.
*   **Workspace Interaction:** When a calendar is selected, the right pane populates with the visual month grid and list view of configured holidays for that specific calendar.

#### **2. Calendar Visualizer (The Grid)**
*   **View Modes:** Month Grid (visual orientation) or List View (density).
*   **Grid Rendering:** Holidays are rendered as distinct colored dots on the calendar grid.
    *   **Interaction:** Hovering over a dot surfaces a tooltip containing the `Holiday Name` and `Applicable Categories`.
*   **Navigation Controllers:** Standard Month/Year pagination arrows, plus a highly visible "Jump to Today" utility link.

#### **3. Adding and Modifying Holidays**
*   **Data Entry Action:** "Add Holiday" CTA opens an overlay modal.
*   **Form Inputs (Modal):**
    *   `Date Picker:` Can support single-day or multi-day range selection.
    *   `Name Input:` Free text (e.g., "Thanksgiving Day").
    *   `Applicable Categories:` A multi-select dropdown to map specific service categories to a holilday (critical for complex contracts where holidays only apply to specific services).

#### **4. Bulk Operations (The Import/Export Flow)**
*   **UX Finding:** Manually entering 25+ dates per year is a poor user experience. Bulk management is essential.
*   **Import Process:**
    *   **Trigger:** "Bulk Import CSV" button.
    *   **Utility:** Offers a direct download link to a "CSV Template" with predefined headers (`date`, `name`, `categories`) prior to upload.
    *   **Validation Interface (Crucial Step):** After uploading, the system *does not* blindly save. It renders a preview table analyzing the CSV.
    *   **Error Catching:** Bad dates (e.g., text instead of MM-DD-YYYY), overlapping dates, or unrecognized categories are highlighted in red row-by-row on the preview table before the user confirms the final merge.
    *   **Merge Strategy UI:** User must select a radio option: "Skip Duplicates" or "Overwrite Existing."
*   **Export Process:** "Export to CSV" utilizes a contextual filename standard (e.g., `TenantName_ProviderHolidays_2026.csv`) to enforce local file organization for the user.

---

### End-to-End Consistency
Throughout the Tenant Settings Hub, destructive actions (like deleting a calendar or altering the default schedule) follow the same safety framework utilized in the Rule Builder: explicit warning modals outlining the downstream impact on inflight compliance clocks before confirming the request.
