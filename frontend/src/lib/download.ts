import type { StructuredSummary } from '../types/meeting';
import { orNotSpecified } from './format';

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildSummaryTextFile(summary: StructuredSummary): string {
  const lines: string[] = [];

  lines.push('MEETING SUMMARY', '', summary.summary || 'No summary available.', '');
  lines.push('KEY DECISIONS', '');
  if (summary.keyDecisions.length === 0) {
    lines.push('No key decisions identified.');
  } else {
    summary.keyDecisions.forEach((d) => lines.push(`- ${d}`));
  }
  lines.push('', 'ACTION ITEMS', '');
  if (summary.actionItems.length === 0) {
    lines.push('No action items identified.');
  } else {
    summary.actionItems.forEach((item) => {
      lines.push(`- Task: ${item.task}`);
      lines.push(`  Assignee: ${orNotSpecified(item.assignee)}`);
      lines.push(`  Deadline: ${orNotSpecified(item.deadline)}`);
      lines.push(`  Priority: ${item.priority}`);
      lines.push('');
    });
  }
  lines.push('RISKS', '');
  if (summary.risks.length === 0) {
    lines.push('No risks identified.');
  } else {
    summary.risks.forEach((r) => lines.push(`- ${r}`));
  }

  return lines.join('\n');
}
