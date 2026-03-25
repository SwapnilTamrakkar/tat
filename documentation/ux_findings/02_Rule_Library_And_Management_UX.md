# Feature-Specific UX Findings: Rule Library & Management

## Document Intent
This document details the user experience paradigm for the **Rule Library** (the main dashboard) and the post-activation **Rule Detail Page**. It covers how users discover, audit, modify, and track the lifecycle of existing TAT rules.

## Feature Overview
The Rule Library provides a macro-level view of all active, drafted, and archived compliance logic. It allows Configuration Analysts to search for specific rules, clone templates, and access the Rule Detail view, where Compliance Officers can audit full version histories and side-by-side diffs.

---

### Phase 1: The Rule Library Dashboard (SCR-001)

#### **1. High-Level Orientation (Summary Bar)**
*   **UX Pattern:** Persistent stat chips above the main data table.
*   **Interaction:** User sees a quick pulse of system state: "X Active · Y Draft · Z Archived".
*   **Goal:** Cognitive orientation before interacting with tabular data. Reduces overwhelming visual noise.

#### **2. Filtering and Discovery Layer**
*   **Location:** Anchored directly above the rule table.
*   **Core Components:**
    *   **Status Pills:** Toggleable visual filters (All / Active / Draft / Archived / Scheduled).
    *   **Case Type Dropdown:** (Inpatient / Outpatient / Both).
    *   **Request Type Multi-select:** To narrow down broad service types.
    *   **Global Search Input:** Free-text search matching against `Rule Name` or authoring user.
*   **UX Behavior:** 
    *   Filters apply asynchronously as the user interacts with them, live-updating the table without page reloads. 
    *   A prominent "Reset Filters" text link appears once any filter deviates from the default state ("All Active").

#### **3. The Main Data Table**
*   **Layout:** Full-width. Optimized for density but retaining readability.
*   **Column Headers:** 
    *   `Rule Name` (Clickable hyperlink navigating to the Rule Detail Page)
    *   `Case Type`
    *   `Request Types` (Rendered as truncated comma-separated lists if > 2 items, expanding via a tooltip on hover)
    *   `Primary TAT` (e.g., "7 Days (Calendar)")
    *   `Status` (Icon + Label: Green dot for Active, Gray for Draft, Blue dot with date tooltip for Scheduled, muted strikethrough for Archived)
    *   `Last Modified` (Timestamp + relative format like "2 hours ago")
    *   `Actions` (An ellipsis `⋯` menu containing contextual actions based on the rule's current state)
*   **Empty States (Crucial Guardrails):**
    *   *System Empty:* If no rules exist on the tenant yet, an illustration appears with a primary CTA button: "+ Create your first rule".
    *   *Filter Empty:* If filters eliminate all rules, a lightweight message appears: "No rules match these criteria. Clear filters to see all." The 'Clear filters' text is an active clickable hyperlink.

#### **4. Quick Action Menu (⋯)**
*   **UX Pattern:** Contextual dropdown per row.
*   **Draft Rules:** [ Edit, Clone, Delete Draft ]
*   **Active Rules:** [ Edit (Creates Draft), Clone, Deactivate ]
*   **Archived Rules:** [ Restore to Draft, Clone ]
*   *Note on "Edit" for Active Rules:* Editing an active rule does NOT physically alter the live rule running in production. It safely forks a new `Draft` instance that inherits all data.

---

### Phase 2: The Rule Detail Page (Post-Activation)

#### **1. Page Layout and Information Architecture**
*   **Design Paradigm:** A clean, read-only representation of the complex objects generated in the Rule Wizard.
*   **Header Section:** Prominent Rule Name, Status Badge, Version Number marker (e.g., `v3.1`), and top-level action buttons (Edit, Clone, Deactivate).
*   **Navigation:** Tabbed interface grouping distinct concern areas:
    *   [ Overview ] 
    *   [ History ]
    *   [ Test Scenarios ]
    *   [ Audit Log ]

#### **2. The Overview Tab (Config Readout)**
*   **Structure:** Mirrors the `Review Cards` UX from Step 4 of the Wizard (SCR-005). 
*   **Data Density:** Uncollapses all matched criteria, event schemas, and exclusions into visual block cards. Includes the static logic diagram mapping the Primary and Secondary clock interaction.

#### **3. The History & Diffing Tab (Compliance Auditing)**
*   **Goal:** Enable a non-technical Compliance Officer to understand exactly what changed between two versions of a complex rule logic structure.
*   **UX Pattern:** Two-pane comparative view.
*   **Interaction Flow:**
    1. User selects `Version 1.0` from a left-hand dropdown.
    2. User selects `Version 2.0` from a right-hand dropdown.
    3. The workspace below dynamically renders the data schema of both versions side-by-side. 
    4. **Diff Highlighting:** Any field that was modified is explicitly highlighted. (e.g., if Duration changed from 7 Days to 10 Days, the "7" is highlighted in soft red with a strike-through, and the "10" is highlighted in soft green). Additions (e.g., adding a new alert threshold) are fully highlighted in green. Deletions are shown in red.
*   **Restore Action:** A "Restore this version" button exists on historical snapshots. It does not overwrite the current active version; it forks the old state into a brand new `Draft v(current+1)` object.

#### **4. Test Scenarios Tab (Regression Protection)**
*   **Purpose:** Lists all saved simulation inputs (mock cases) associated with this specific rule.
*   **UX Component:** A sub-table listing scenarios by `Name`, `Expected Output`, and `Last Run Status`.
*   **Utility Action:** A "Run All Scenarios" bulk action button. If an Analyst modifies the rule in a new draft, they can click this button to simultaneously validate the new changes against historical expected outcomes to prevent regression errors.

#### **5. Deactivation Flow (Safety Nets)**
*   **Trigger:** User clicks "Deactivate" from the header actions.
*   **UX Behavior:** A destructive-intent modal appears.
*   **Content:** "You are about to deactivate this rule. It will no longer process new healthcare cases as of [Date/Time], but will finish running on inflight cases that began under this version. Are you sure?"
*   **Confirmation Action:** The final action button requires typing "DEACTIVATE" explicitly to confirm intent, preventing accidental compliance outages.
