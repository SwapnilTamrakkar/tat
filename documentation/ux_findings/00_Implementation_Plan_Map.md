# TAT Rule Engine — UX Implementation & Feature Map

## Intent & Overview
This document serves as the master blueprint mapping the entire TAT Rule Engine web application from a UX Research and Implementation perspective. It highlights how core features connect across different screens, establishing the skeleton for all subsequent in-depth UX Finding documents.

## Core Objective
To enable business users to autonomously configure, manage, and test Turnaround Time rules without developer intervention, while ensuring accuracy and compliance through proactive UX guardrails, real-time feedback, and validation.

---

## Master Feature to Screen Mapping

### Feature 1: End-to-End Rule Creation (The Core Workflow)
This feature spans multiple interactive touchpoints, guiding a non-technical user through complex compliance logic.

*   **Trigger Screen:** `SCR-001` (Rule Library) -> Clicking "+ New Rule".
*   **Step 1 Screen:** `SCR-002` (Matching Criteria) -> Defining **when** the rule applies. Connects to the global state to run real-time overlap checks.
*   **Step 2 Screen:** `SCR-003` (Primary Clock) -> Defining the **main SLA duration**. Instantiates the live SVG timeline preview. Modifies state to lock/unlock exclusions on Step 3 based on pattern selection.
*   **Step 3 Screen:** `SCR-004` (Secondary Clock & Exclusions) -> Chaining logic. Connects back to `SCR-003`'s pause event to auto-fill the start event. Applies global tenant holiday data.
*   **Step 4 Screen:** `SCR-005` (Review & Simulate) -> Simulation Engine. Connects data from Steps 1-3. Output determines whether the "Activate Rule" action is unlocked.
*   **Post-Activation Screen:** `SCR-006` or Rule Detail Page -> Displays the committed rule history and active status.

### Feature 2: Rule Management & Auditing
Providing tools for compliance officers to track changes and find specific rules.

*   **Dashboard Listing:** `SCR-001` (Rule Library) -> Filtering, searching, sorting rules.
*   **Versioning & Diffing:** Rule Detail Page -> Displays visual field-level diffs between versions. 
*   **Cloning:** Rule Detail Page / `SCR-001` -> Duplicates the state of an existing rule and pushes the user into `SCR-002` with a modified "(Copy)" name.

### Feature 3: Tenant Environment & Schedules
Administrative configurations that affect how rules calculate time.

*   **Hub:** Tenant Settings Hub -> Navigation to specific configuration managers.
*   **Work Schedules:** Work Schedule Editor -> 7-day visual grids. Connected to the Engine; affects "Business Hours" rule patterns.
*   **Calendars:** Holiday Calendar Manager -> Connecting tenant-specific holidays (Client/Provider/Custom). Affects "Calendar Days" calculation when exclusions are active.

---

## Global UX Principles Applied Across All Screens

1.  **Immediate Feedback Loops:** Using real-time validations (e.g., alert threshold order validation, timeline preview updates) to prevent user errors before form submission.
2.  **Smart Defaults & Auto-propagation:** Pre-filling predictable values (e.g., auto-suggesting Rule Name based on selected criteria, chaining secondary start triggers).
3.  **Aesthetic Conflict Warnings:** Utilizing standard warning colors (Yellow/Orange) and clear, human-readable helper text for edge-cases (e.g., overlapping rules, manual timeline desyncs).
4.  **Non-Destructive Actions:** Enforcing "Draft" states prior to activation. Editing an active rule creates a draft without mutating the active production rule.

*(See subsequent documents `01_Rule_Creation_Workflow_UX.md`, `02_Rule_Library_And_Management_UX.md`, etc., for exhaustive feature-level UX findings).*
