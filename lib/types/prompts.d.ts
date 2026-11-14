/**
 * Structured prompt construction for the goal and handoff enhanced modes.
 *
 * The text here is new (informed by the design references; no source copied).
 * It is appended as the final user message after the replayed conversation
 * prefix, so the native warm prefix stays intact and every variable input
 * (authoritative goal/todo/job state) sits at the end.
 *
 * Structure checks are deliberately shallow: required sections and non-empty
 * text catch truncation, filtering, and degenerate output, but they are not a
 * proof that no fact was lost. Fidelity is exercised by fixed-scenario tests,
 * not by this function.
 */
import type { AuthoritativeState, CompactionMode, EnhancedMode, PromptVariableValues, StateBlock } from './shared/contract.ts';
export { PROMPT_VARIABLES } from './shared/contract.ts';
/** Required H2 sections for the goal checkpoint. */
export declare const GOAL_SECTIONS: readonly ["## Current Goal and Unresolved Requests", "## Constraints, Preferences, and Approved Boundaries", "## Decisions and Reasons", "## Completed Work", "## In Progress", "## Blocked, Pending, and Unverified", "## Key References", "## Next Actions"];
/** One required goal-checkpoint heading. */
export type GoalSection = (typeof GOAL_SECTIONS)[number];
/** Required H2 sections for the file-handoff document. */
export declare const HANDOFF_SECTIONS: readonly ["## Objective and Unresolved Requests", "## Current State", "## Constraints and Approved Boundaries", "## Decisions and Reasons", "## Completed Work", "## In Progress", "## Blocked, Pending, and Unverified", "## Key References", "## Next Actions", "## Suggested Skills"];
/** One required handoff-document heading. */
export type HandoffSection = (typeof HANDOFF_SECTIONS)[number];
/** Marker that identifies a handoff document in a native checkpoint. */
export declare const HANDOFF_TITLE = "# Session Handoff";
/**
 * Authoritative state as the renderers accept it: the collected projection
 * when available, a partial one, or nothing at all. Every collection is
 * optional because callers may hand in a state value built before a service
 * was readable.
 */
export type StateInput = Partial<AuthoritativeState> | null | undefined;
/** Build the fixed goal-checkpoint directive. */
export declare function goalInstruction(): string;
/** Build the fixed handoff-document directive. */
export declare function handoffInstruction(): string;
/** A plugin error carrying a machine-readable `code`. */
export interface CodedError extends Error {
    readonly code: string;
}
/**
 * Render the authoritative state block injected at the end of the instruction.
 * Sections are capped so a pathological todo/job list cannot dominate the
 * summary request; the caps are reported in the note when they bite.
 *
 * @param state - collected live authoritative state.
 * @param mode - which document is being produced.
 * @returns state block.
 */
export declare function renderStateBlock(state: StateInput, mode: EnhancedMode): StateBlock;
/**
 * Names of the optional authoritative-state sections present in a state value.
 * @param state - collected state.
 * @returns human-readable section names.
 */
export declare function omittedStateNames(state: StateInput): string[];
/** Resolved summary target facts exposed as prompt variables. */
export interface PromptTargetView {
    readonly provider: string;
    readonly model: string;
}
/** Resolved effective policy facts exposed as prompt variables. */
export interface PromptPolicyView {
    readonly thresholdRatio?: number;
    readonly retainRatio?: number;
    readonly retainTokens?: number | null;
}
/** Effective route facts for {@link customPromptVariables}. */
export interface CustomPromptContext {
    /** Resolved summary target. */
    readonly target?: PromptTargetView | null;
    /** Resolved effective policy. */
    readonly policy?: PromptPolicyView | null;
    /** Current session id. */
    readonly sessionId?: string;
    /** Clock seam for tests. */
    readonly now?: Date;
}
/**
 * Build the value map for the ten custom-mode variables. This is the single
 * place where authoritative state becomes prompt text; the custom instruction
 * itself receives no automatic state block.
 *
 * @param state - collected authoritative state.
 * @param context - effective route facts.
 * @returns variable values.
 */
export declare function customPromptVariables(state: StateInput, context?: CustomPromptContext): PromptVariableValues;
/**
 * Expand one custom instruction. Known variables are replaced once; unknown
 * variables stay literal and values are never recursively expanded.
 * @param template - user-authored instruction.
 * @param variables - variable values.
 * @returns expanded text.
 */
export declare function expandCustomPrompt(template: unknown, variables?: Readonly<Record<string, string>>): string;
/**
 * Build the custom-mode instruction. Unlike goal/handoff, this is exactly the
 * expanded prompt: no built-in structure, state block, or safety rules.
 * @param template - user-authored instruction.
 * @param variables - variable values.
 * @returns final instruction text.
 * @throws {CodedError} with code `BETTER_COMPACT_PROMPT` when the result is empty.
 */
export declare function buildCustomInstruction(template: string, variables?: Readonly<Record<string, string>>): string;
/** Budget fallback disclosure for {@link buildInstruction}. */
export interface BuildInstructionOptions {
    /** Whether the whole state block was dropped. */
    readonly stateOmitted?: boolean;
    /** Optional state sections dropped to fit. */
    readonly omittedState?: readonly string[];
    /** Sections that were still included. */
    readonly keptState?: readonly string[];
}
/**
 * Assemble the final instruction used as the last user message.
 * @param mode - enhanced mode.
 * @param stateBlock - state block.
 * @param options - budget fallback disclosure.
 * @returns instruction text.
 */
export declare function buildInstruction(mode: EnhancedMode, stateBlock: StateBlock, options?: BuildInstructionOptions): string;
/**
 * Verify the model produced the required structure. This is a fail-closed
 * shape check, not a completeness proof.
 *
 * @param text - combined summary text.
 * @param mode - enhanced mode.
 * @throws {CodedError} with `code = 'BETTER_COMPACT_STRUCTURE'` when required text is missing.
 */
export declare function assertSummaryStructure(text: unknown, mode: CompactionMode): void;
/**
 * Identify which known backend wrote a persisted checkpoint, from its structure
 * alone. Unknown/foreign records return `null` instead of guessing.
 * @param text - checkpoint summary text.
 * @returns provable mode.
 */
export declare function detectSummaryMode(text: unknown): CompactionMode | null;
/**
 * Conservatively redact recognizable secrets. Documented as pattern-based, not
 * perfect detection: it cannot recognize every credential format.
 * @param text - raw text.
 * @returns redacted text.
 */
export declare function redactSecrets(text: unknown): string;
/** The text-bearing fields of one provider output block. */
export interface ContentBlockView {
    readonly type?: string;
    readonly text?: string;
    readonly arguments?: string;
}
/**
 * Redact every text-bearing content block. Used for the handoff summary body
 * and for the raw provider output persisted on `compaction/summary`, so a
 * secret cannot survive in the trajectory view after the visible summary was
 * redacted.
 *
 * @param blocks - provider output blocks.
 * @returns blocks with text/reasoning/tool-call payloads redacted.
 */
export declare function redactContentBlocks<T>(blocks: readonly T[]): T[];
/** Inputs for {@link composeHandoffDocument}. */
export interface HandoffDocumentInput {
    /** Redacted model output. */
    readonly body: string;
    /** Actual verified file path. */
    readonly path: string;
    /** ISO timestamp. */
    readonly createdAt: string;
    /** Session identity shown for correlation. */
    readonly sessionId: string;
}
/**
 * Compose the final handoff document: our own deterministic header (with the
 * actual path and a self-containedness note), followed by the model's body
 * without a duplicate title.
 *
 * @param input - document inputs.
 * @returns complete Markdown document.
 */
export declare function composeHandoffDocument(input: HandoffDocumentInput): string;
/** The committed compaction result facts the continuation message states. */
export interface ContinuationResultView {
    /** Inclusively shadowed history positions. */
    readonly shadowedSeqs: readonly number[];
}
/**
 * Build the one ordinary same-session continuation message.
 * @param result - committed compaction result.
 * @param path - verified handoff path, when written.
 * @returns continuation text.
 */
export declare function continuationText(result: ContinuationResultView, path: string | null): string;
