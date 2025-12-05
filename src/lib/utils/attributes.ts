/**
 * Attribute Parser Module
 * 
 * Extracts structured attributes from content markdown body.
 * Parses the header metadata (Type, Confidence) and the Attributes table.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Parsed attributes from content body
 */
export interface ParsedAttributes {
  /** Entity type (e.g., "Person", "Organization") */
  type?: string;
  /** Confidence percentage (0-100) */
  confidence?: number;
  /** Key-value pairs from the Attributes table */
  attributes: Record<string, string>;
  /** Summary text extracted from body */
  summary?: string;
}

/**
 * Display-friendly attribute with formatted label
 */
export interface DisplayAttribute {
  /** Original key from content */
  key: string;
  /** Human-readable label */
  label: string;
  /** Attribute value */
  value: string;
}

// =============================================================================
// Label Formatting
// =============================================================================

/**
 * Convert snake_case attribute key to Title Case label
 */
function formatLabel(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// =============================================================================
// Parsers
// =============================================================================

/**
 * Extract Type and Confidence from the body header
 */
function parseHeader(body: string): { type?: string; confidence?: number } {
  const result: { type?: string; confidence?: number } = {};
  
  // Match **Type:** value
  const typeMatch = body.match(/\*\*Type:\*\*\s*(.+)/);
  if (typeMatch) {
    result.type = typeMatch[1].trim();
  }
  
  // Match **Confidence:** XX%
  const confidenceMatch = body.match(/\*\*Confidence:\*\*\s*(\d+)%/);
  if (confidenceMatch) {
    result.confidence = parseInt(confidenceMatch[1], 10);
  }
  
  return result;
}

/**
 * Extract Summary section content
 */
function parseSummary(body: string): string | undefined {
  // Match ## Summary section until next ## or end
  const summaryMatch = body.match(/## Summary\s*\n+([\s\S]*?)(?=\n##|\n---|\n_Generated|$)/);
  if (summaryMatch) {
    return summaryMatch[1].trim();
  }
  return undefined;
}

/**
 * Extract attributes from the markdown table in ## Attributes section
 */
function parseAttributeTable(body: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  
  // Find the Attributes section
  const attributesSection = body.match(/## Attributes\s*\n+([\s\S]*?)(?=\n##|\n---|\n_Generated|$)/);
  if (!attributesSection) {
    return attributes;
  }
  
  const tableContent = attributesSection[1];
  
  // Match table rows: | key | value |
  // Skip header row (| Attribute | Value |) and separator row (|---|---|)
  const rows = tableContent.split('\n').filter(line => {
    const trimmed = line.trim();
    // Must start with | and not be header or separator
    return trimmed.startsWith('|') && 
           !trimmed.includes('Attribute') && 
           !trimmed.match(/^\|[-:\s|]+\|$/);
  });
  
  for (const row of rows) {
    // Parse | key | value | format
    const cells = row.split('|').map(cell => cell.trim()).filter(Boolean);
    if (cells.length >= 2) {
      const key = cells[0];
      const value = cells[1];
      if (key && value) {
        attributes[key] = value;
      }
    }
  }
  
  return attributes;
}

// =============================================================================
// Main Export
// =============================================================================

/**
 * Parse all structured attributes from content body
 */
export function parseAttributes(body: string): ParsedAttributes {
  if (!body) {
    return { attributes: {} };
  }
  
  const header = parseHeader(body);
  const summary = parseSummary(body);
  const attributes = parseAttributeTable(body);
  
  return {
    type: header.type,
    confidence: header.confidence,
    summary,
    attributes
  };
}

/**
 * Convert parsed attributes to display-friendly format
 * Filters and formats attributes for UI display
 */
export function getDisplayAttributes(parsed: ParsedAttributes): DisplayAttribute[] {
  const displayAttrs: DisplayAttribute[] = [];
  
  // Priority order for display
  const priorityKeys = ['role', 'nationality', 'time_period', 'notable_work', 'birth_date', 'death_date'];
  
  // Add priority keys first (if they exist)
  for (const key of priorityKeys) {
    if (parsed.attributes[key]) {
      displayAttrs.push({
        key,
        label: formatLabel(key),
        value: parsed.attributes[key]
      });
    }
  }
  
  // Add remaining keys
  for (const [key, value] of Object.entries(parsed.attributes)) {
    if (!priorityKeys.includes(key)) {
      displayAttrs.push({
        key,
        label: formatLabel(key),
        value
      });
    }
  }
  
  return displayAttrs;
}

/**
 * Get a confidence level description
 */
export function getConfidenceLevel(confidence: number | undefined): { level: string; color: string } {
  if (confidence === undefined) {
    return { level: 'Unknown', color: 'gray' };
  }
  if (confidence >= 90) {
    return { level: 'High', color: 'green' };
  }
  if (confidence >= 70) {
    return { level: 'Medium', color: 'yellow' };
  }
  return { level: 'Low', color: 'red' };
}
