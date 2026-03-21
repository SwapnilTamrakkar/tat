// ============================================================
// TAT Rule Engine â€” App Router
// ============================================================
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layouts/AppLayout';
import RuleLibrary from './components/features/rules/RuleLibrary';
import RuleBuilderWizard from './components/features/rules/RuleBuilderWizard';
import RuleDetail from './components/features/rules/RuleDetail';
import WorkScheduleEditor from './components/features/schedules/WorkScheduleEditor';
import HolidayCalendarManager from './components/features/holidays/HolidayCalendarManager';
import AuditLog from './components/features/audit/AuditLog';
import CaseDebugger from './components/features/rules/CaseDebugger';
import ProviderRegistry from './components/features/providers/ProviderRegistry';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RuleLibrary />} />
          <Route path="/rules/new" element={<RuleBuilderWizard />} />
          <Route path="/rules/:ruleId" element={<RuleDetail />} />
          <Route path="/rules/:ruleId/edit" element={<RuleBuilderWizard />} />
          <Route path="/settings/schedules" element={<WorkScheduleEditor />} />
          <Route path="/settings/holidays" element={<HolidayCalendarManager />} />
          <Route path="/settings/providers" element={<ProviderRegistry />} />
          <Route path="/debug" element={<CaseDebugger />} />
          <Route path="/audit" element={<AuditLog />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
