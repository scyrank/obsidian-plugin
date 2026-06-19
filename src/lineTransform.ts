const TASK_LINE_RE = /^(\s*)- \[([ xX])\]\s+(.*)$/;
const PLAIN_LINE_RE = /^(\s*)(.*)$/;
const IMPORTANT_MARKER = "%%kt-important%%";
const IMPORTANT_MARKER_RE = /\s*%%kt-important%%\s*$/;
const STAR_RE = /^⭐\s+/;

type ParsedTaskLine = {
  indent: string;
  state: " " | "x" | "X";
  body: string;
};

type ImportantSplit = {
  content: string;
  importantSuffix: string;
};

function parseTaskLine(line: string): ParsedTaskLine | null {
  const match = line.match(TASK_LINE_RE);
  if (!match) {
    return null;
  }

  return {
    indent: match[1],
    state: match[2] as ParsedTaskLine["state"],
    body: match[3],
  };
}

function parsePlainLine(line: string): { indent: string; body: string } {
  const match = line.match(PLAIN_LINE_RE);
  return {
    indent: match?.[1] ?? "",
    body: match?.[2] ?? line,
  };
}

function splitImportant(body: string): ImportantSplit {
  const match = body.match(IMPORTANT_MARKER_RE);
  if (!match || match.index === undefined) {
    return { content: body, importantSuffix: "" };
  }

  return {
    content: body.slice(0, match.index).trimEnd(),
    importantSuffix: ` ${IMPORTANT_MARKER}`,
  };
}

function toggleStarInBody(body: string): string {
  const { content, importantSuffix } = splitImportant(body);

  if (STAR_RE.test(content)) {
    return `${content.replace(STAR_RE, "")}${importantSuffix}`;
  }

  return `⭐ ${content}${importantSuffix}`;
}

export function cycleTaskState(line: string): string {
  const task = parseTaskLine(line);

  if (task) {
    if (task.state === " ") {
      return `${task.indent}- [x] ${task.body}`;
    }

    return `${task.indent}${task.body}`;
  }

  const { indent, body } = parsePlainLine(line);
  return `${indent}- [ ] ${body}`;
}

export function toggleImportant(line: string): string {
  if (IMPORTANT_MARKER_RE.test(line)) {
    return line.replace(IMPORTANT_MARKER_RE, "");
  }

  return `${line.trimEnd()} ${IMPORTANT_MARKER}`;
}

export function toggleStar(line: string): string {
  const task = parseTaskLine(line);

  if (task) {
    return `${task.indent}- [${task.state}] ${toggleStarInBody(task.body)}`;
  }

  const { indent, body } = parsePlainLine(line);
  return `${indent}${toggleStarInBody(body)}`;
}
