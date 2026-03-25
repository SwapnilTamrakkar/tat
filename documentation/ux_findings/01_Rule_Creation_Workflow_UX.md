# Feature-Specific UX Findings: Core Workflow (Rule Creation & Configuration)

## Document Intent
This document exhaustively details the end-to-end user experience, interactive states, and underlying system connections for the primary workflow of the TAT Rule Engine: **Creating and configuring a new TAT rule**.

## Feature Overview
The goal is to enable a configuration analyst to generate, validate, and safely test a Turnaround Time rule containing multiple event schemas (Primary & Secondary clocks) without creating compliance conflicts. It spans screens SCR-001 through SCR-005.

---

### Phase 1: Initiation and Global Settings (SCR-001 -> SCR-002)

#### **1. Triggering the Path**
*   **Interaction:** User clicks "+ New Rule" on the dashboard (`SCR-001`).
*   **System Action:** Initiates a new `Draft` state object in application memory and opens the stepper wizard interface (`SCR-002`).
*   **Feedback:** URL changes to `/rules/new`. Left-hand wizard navigation indicates "Step 1 of 4: Matching Criteria". Sticky footer displays "Back", "Next →", and "Save Draft". Save Draft button is slightly disabled until minimum viable information (the rule name) is provided.

#### **2. Matching Criteria Definition (SCR-002)**
**Goal:** Define exactly when this rule applies via data structures.

*   **Rule Name Generation Component:**
    *   **UX Pattern:** Smart Default. 
    *   **Behavior:** Auto-suggests a name asynchronously based on selections below (e.g., `IP · Expedited · Inpatient Admission`). Includes a character character limit counter (e.g., "30/100").
    *   **User Action:** User can override the system-generated name. 
*   **Case Type Component:**
    *   **UX Pattern:** Radio Pill Group (e.g., [ Inpatient (IP) ] [ Outpatient (OP) ] [ Both ]).
    *   **Behavior:** Making a selection actively filters the drop-down list available in the "Service Type" component below it.
*   **Service Type Component:**
    *   **UX Pattern:** Multi-select Searchable Combobox.
    *   **Behavior:** Displays a dynamic count badge (e.g., "4 selected"). Includes "Select All" / "Clear All" utility actions. 
*   **Request Type Component:**
    *   **UX Pattern:** Toggleable Chip Group.
    *   **Behavior:** Multi-select. Visual change on selection (e.g., unselected chip: gray background, selected chip: deep gray background with white text).

#### **3. Real-Time Overlap Detection (The Most Critical Guardrail)**
*   **Trigger:** Any change strictly to Case, Service, OR Request types.
*   **UX Behavior:** A debounced background check queries active rules. If a ruleset matches the exact combination provided:
    *   A warning panel animates in directly below the matching criteria section.
    *   **Content:** "⚠️ Overlaps with active rule: [Name of Existing Rule]. Save with caution."
    *   **Actionable Element:** The existing rule name is formatted as an underlying hyperlink opening the conflicting rule in a new tab for rapid comparison.

---

### Phase 2: Building the Primary Clock (SCR-003)

#### **1. Layout Shift and Dual State Viewing**
*   **UX Pattern:** Two-column interactive builder. 
*   **Behavior:** Left side acts as the configuration form. Right side renders a sticky `<svg>` or `<canvas>` based animated **Live Timeline Preview**. 

#### **2. Timeline Preview (The visual validation engine)**
*   **Dynamic Response:** Immediately reflects left-hand side changes. 
*   **Visual Logic:** 
    *   **Bar:** Represents clock active time.
    *   **Threshold Ticks:** Renders colored vertical lines for alert thresholds (Yellow for Warning, Orange for Attention, Red for Overdue).
    *   **Segments:** Shows "Pause" and "Resume" events as physical blank space within the solid timeline bar, explicitly denoting a pause period.
    *   **Labels:** Automatically compute example timestamps (e.g., "Start: Day 1, Deadline: Day 8").

#### **3. Duration & Clock Pattern Configuration**
*   **Components:** Duration Input (Integer-only), Duration Unit Dropdown (Hours/Days), Pattern Radio Buttons (Calendar Days, Business Hours, Flat Hours), Start Mode Radio Buttons (Same Day / Next Day).
*   **Cross-Screen Dependency:** Selecting "Flat Hours" flags the system state to absolutely lock out and disable "Holiday & Weekend Exclusions" on Step 3, as flat hours mathematically cannot accommodate exclusions.

#### **4. The Event Builder (Semantic Logic Input)**
*   **UX Pattern:** Condition Builder Rows.
*   **Behavior:** Replaces arbitrary text input with strict selectors. 
    *   *Row Layout:* [ Field Selector ] + [ Operator ] + [ Value Dropdown ].
    *   *System Translation:* The system concatenates these raw selectors into a human-readable string below the builder (e.g., "Start when *Line Status* is *Submitted*").
*   **Guardrails/Edits:** Pause and Resume events are entirely optional. Toggling them off prompts a small confirmation dialog if data was already entered to prevent accidental data loss.

#### **5. Alert Threshold Validators**
*   **UX Pattern:** Three distinct input rows mapped to colors (Warning/Yellow, Attention/Orange, Overdue/Red).
*   **Guardrails:** Instant localized validation. The form cannot proceed (Next button disables) if a user creates logical flaws. 
    *   *Example Error:* User sets Warning at 1 Day, but Attention at 2 Days.
    *   *Feedback:* Inline red error text under the Warning input: "Warning threshold must be placed farther ahead of the deadline than the Attention threshold." 

---

### Phase 3: Secondary Chaining & Exclusions (SCR-004)

#### **1. The Clock Chain Concept**
*   **Trigger Element:** Prominent upper toggle: "Enable Secondary (Pend) Clock".
*   **UX Behavior:** Defaults to collapsed. When toggled on, animates open smoothly revealing the pending clock options and an animated SVG diagram clarifying the chaining relationship (Primary Start -> Pause -> Secondary Start -> Stop -> Primary Resume).

#### **2. Propagating the Handoff (Smart Defaults)**
*   **Key UX Finding:** The start event of the secondary pend clock is almost *always* the precise condition that triggered the primary clock to pause.
*   **Behavior:** When toggled on, the system reads Step 2's `Pause Event` state and forcibly pre-fills Step 3's `Secondary Start Event` input.
*   **Feedback:** An informational banner appears: "✓ Secondary clock start event auto-set from Primary pause event."
*   **Edge Case / Guardrail:** If the user clicks "Override" and changes the secondary start event to something entirely different, a yellow warning banner appears underneath: "⚠️ Secondary start event doesn't currently match the Primary pause event. A coverage gap or clock overlap is mathematically possible."

#### **3. Handling Calendar Exclusions**
*   **Dependency Locking:** If the user arrived here having selected "Flat Hours" in Step 2:
    *   The "Holiday Exclusion" dropdown and "Weekend Skip" toggle are visually dimmed/disabled.
    *   Hovering over them displays a tooltip: "Flat Hours clocks run continuously and cannot exclude holidays or weekends."

---

### Phase 4: Final Validation and Launch (SCR-005)

#### **1. Review Summary State**
*   **UX Pattern:** Read-only summary cards grouping selections from Stepper components 1, 2, and 3. Collapsible on mobile viewports.
*   **Utility:** Provides a quick-action "Edit" link on each card header, which jumps the user directly backward to the localized step in the wizard.

#### **2. The Rules Simulation Sandbox**
*   **UX Pattern:** Interactive sandbox terminal directly embedded underneath the review summary.
*   **Behavior:** It automatically inherits the `Case Type` configuration determined back in Step 1.
*   **Action Flow:** 
    1. User populates mock `Reference Date` and `Event Sequence` rows mimicking real-time API pinging.
    2. User clicks "Run Simulation".
    3. An animation visually plays out the calculated clock timeline based on the simulated events, outputting a clear Pass/Fail status or outlining exactly when deadlines trigger relative to the events entered.

#### **3. Commit Actions**
*   **UX Pattern:** Sticky action footer.
*   **Options:** 
    *   "Save as Draft": Persists state without activating.
    *   "Activate Rule": Primary CTA. 
*   **Final Guardrail:** The "Activate Rule" button should either remain disabled until a simulation sandbox test finishes successfully, OR trigger an intercepting modal that says: "Are you sure you want to activate this rule without testing it in the simulation sandbox first? Unintended production errors may occur."
