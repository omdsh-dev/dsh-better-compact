/**
 * dsh-better-compact — schematic process diagrams.
 *
 * Pure presentation: token values are labelled estimates, never measured usage.
 * Every element, coordinate, className and aria attribute is copied verbatim
 * from the pre-TypeScript src/client.js.
 */
import React from 'react'
import type { InspectPreview } from '../shared/contract.ts'
import { DEFAULT_RETAIN_RATIO, type ConfigDraft } from './draft.ts'
import { t } from './locales/index.ts'
import { processText, ratioText, tokensText, type ProjectedBudget } from './controls.tsx'

export interface ModeDiagramProps {
  mode: string
  projected?: ProjectedBudget | null
  cachePriority?: boolean
  fixedTokens?: number | null
}

/** Schematic per-mode flow. Token values are labelled estimates, never usage. */
export function ModeDiagram(props: ModeDiagramProps): React.ReactElement {
  const { mode, projected, cachePriority, fixedTokens } = props
  const retain = projected ? projected.retain : null
  const fixed = typeof fixedTokens === 'number' && Number.isFinite(fixedTokens) ? fixedTokens : 0
  const earlier = projected ? Math.max(0, projected.threshold - projected.retain - fixed) : null
  const result = mode === 'native' ? processText('summary')
    : mode === 'goal' ? processText('goalSummary')
      : mode === 'handoff' ? processText('handoffBody')
        : processText('customSummary')
  const resultNote = mode === 'handoff' ? t('handoffNote')
    : mode === 'custom' ? t('customNote')
      : mode === 'native' ? t('nativeNote')
        : t('goalNote')
  return (
    <div className="dsh-bc-flow" data-bc="mode-diagram" data-mode-diagram={mode} aria-hidden={true}>
      <div className="dsh-bc-flow-prefix">
        <span>{processText('fixedPrefix')}</span>
        {cachePriority && mode !== 'native' ? <span className="dsh-bc-flow-chip">{t('cacheChip')}</span> : null}
      </div>
      <div className="dsh-bc-flow-row">
        <div className="dsh-bc-flow-node">
          <strong>{processText('earlier')}</strong>
          <span>{earlier === null ? '\u2014' : '\u2248 ' + tokensText(earlier)}</span>
        </div>
        {(mode === 'goal' || mode === 'handoff') ? (
          <div className="dsh-bc-flow-node dsh-bc-flow-state">
            <strong>{t('goalState')}</strong><span>{t('modeGoalTag')}</span>
          </div>
        ) : null}
        {mode === 'custom' ? (
          <div className="dsh-bc-flow-node dsh-bc-flow-state">
            <strong>{t('customState')}</strong><span>{t('modeCustomTag')}</span>
          </div>
        ) : null}
        <div className="dsh-bc-flow-node dsh-bc-flow-tail">
          <strong>{processText('recent')}</strong>
          <span>{retain === null ? '\u2014' : '\u2248 ' + tokensText(retain)}</span>
        </div>
      </div>
      <div className="dsh-bc-flow-arrow">{'\u2193'}</div>
      <div className="dsh-bc-flow-result">
        <strong>{result}</strong><span>{resultNote}</span>
      </div>
    </div>
  )
}

export interface CompactionFlowProps {
  mode: string
  draft: ConfigDraft
  projected?: ProjectedBudget | null
  preview?: InspectPreview | null
  fixedTokens?: number | null
}

interface FlowCopy {
  readonly title: string
  readonly body: string
  readonly sideTitle: string
  readonly sideBody: string
  readonly sideTag: string
  readonly result: string
  readonly resultBody: string
  readonly final: string
  readonly aria: string
}

/** One bold SVG process drawing for the selected strategy. */
export function CompactionFlow(props: CompactionFlowProps): React.ReactElement {
  const { mode, draft, projected, preview } = props
  const ratio = Number(draft.thresholdRatio === '' ? 0.8 : draft.thresholdRatio)
  const retainRatio = Number(draft.retainRatio === '' ? DEFAULT_RETAIN_RATIO : draft.retainRatio)
  const fixed = typeof props.fixedTokens === 'number' && Number.isFinite(props.fixedTokens) ? props.fixedTokens : null
  const earlier = projected && fixed !== null ? Math.max(0, projected.threshold - projected.retain - fixed) : null
  const retain = projected ? projected.retain : null
  const marker = 'bc-flow-' + React.useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const copy: FlowCopy = mode === 'native'
    ? { title: t('svgNativeTitle'), body: t('svgNativeBody'), sideTitle: t('svgNativeSide'), sideBody: t('svgNativeSideBody'), sideTag: t('svgNativeSideTag'), result: t('svgNativeResult'), resultBody: t('svgNativeResultBody'), final: t('svgNativeFinal'), aria: t('svgNativeAria') }
    : mode === 'goal'
      ? { title: t('svgGoalTitle'), body: t('svgGoalBody'), sideTitle: t('svgGoalSide'), sideBody: t('svgGoalSideBody'), sideTag: t('svgGoalSideTag'), result: t('svgGoalResult'), resultBody: t('svgGoalResultBody'), final: t('svgGoalFinal'), aria: t('svgGoalAria') }
      : mode === 'handoff'
        ? { title: t('svgHandoffTitle'), body: t('svgHandoffBody'), sideTitle: t('svgHandoffSide'), sideBody: t('svgHandoffSideBody'), sideTag: t('svgHandoffSideTag'), result: t('svgHandoffResult'), resultBody: t('svgHandoffResultBody'), final: t('svgHandoffFinal'), aria: t('svgHandoffAria') }
        : { title: t('svgCustomTitle'), body: t('svgCustomBody'), sideTitle: t('svgCustomSide'), sideBody: t('svgCustomSideBody'), sideTag: t('svgCustomSideTag'), result: t('svgCustomResult'), resultBody: t('svgCustomResultBody'), final: t('svgCustomFinal'), aria: t('svgCustomAria') }
  const node = (id: string, x: number, y: number, width: number, height: number, title: string, sub: string | null, tone?: string, tag?: string, tagTone?: string): React.ReactElement => (
    <g data-node={id}>
      <rect className={'dsh-bc-node ' + (tone ?? '')} x={x} y={y} width={width} height={height} rx={6} />
      {tag ? (
        <g aria-hidden={true}>
          <rect className={'dsh-bc-svg-tag ' + (tagTone === 'accent' ? 'dsh-bc-svg-tag-accent' : '')}
            x={x + width - Math.max(30, tag.length * 10 + 12) - 8} y={y + 8}
            width={Math.max(30, tag.length * 10 + 12)} height={16} rx={8} />
          <text x={x + width - Math.max(30, tag.length * 10 + 12) / 2 - 8} y={y + 19} textAnchor="middle"
            className={'dsh-bc-svg-tag-text ' + (tagTone === 'accent' ? 'dsh-bc-svg-tag-text-accent' : '')}>{tag}</text>
        </g>
      ) : null}
      <text x={x + width / 2} y={sub ? y + height / 2 - 2 : y + height / 2 + 5} textAnchor="middle"
        className="dsh-bc-svg-node-title">{title}</text>
      {sub ? <text x={x + width / 2} y={y + height / 2 + 16} textAnchor="middle" className="dsh-bc-svg-node-sub">{sub}</text> : null}
    </g>
  )
  const edge = (d: string, from: string, to: string): React.ReactElement => (
    <path className="dsh-bc-edge" data-from={from} data-to={to} d={d} markerEnd={'url(#' + marker + ')'} />
  )
  const fixedText = processText('fixedPrefix') + (draft.cachePriority && mode !== 'native' ? ' \u00b7 ' + t('cacheChip') : '')
  const previewText = preview && Number.isFinite(preview.beforeTokens) && Number.isFinite(preview.afterUpperBoundTokens)
    ? t('svgPreview', { before: tokensText(preview.beforeTokens), after: tokensText(preview.afterUpperBoundTokens) })
    : projected ? t('svgProjected', { summary: tokensText(projected.summary) }) : null
  return (
    <svg className="dsh-bc-strategy-svg" viewBox="0 0 440 500" role="img" aria-label={copy.aria}
      data-bc="compaction-flow" data-mode-flow={mode}>
      <title>{copy.aria}</title>
      <desc>{copy.aria}</desc>
      <defs>
        <marker id={marker} viewBox="0 0 6 6" refX={6} refY={3} markerWidth={6} markerHeight={6}
          orient="auto" markerUnits="userSpaceOnUse">
          <path d="M0 0 L6 3 L0 6 Z" fill="currentColor" />
        </marker>
      </defs>
      {node('fixed', 16, 12, 408, 36, fixedText, null, 'dsh-bc-node-dashed')}
      {node('earlier', 16, 64, 198, 64, processText('earlier'), earlier === null ? '\u2014' : '\u2248 ' + tokensText(earlier), '', t('svgPendingTag'), 'accent')}
      {node('recent', 226, 64, 198, 64, processText('recent'), retain === null ? '\u2014' : '\u2248 ' + tokensText(retain), 'dsh-bc-node-accent', t('svgKeepTag'), 'accent')}
      {edge('M115 128 L115 172', 'earlier', 'compress')}
      {edge('M325 128 L325 146 L432 146 L432 332 L424 332', 'recent', 'retained')}
      {node('compress', 16, 172, 198, 88, copy.title, copy.body, 'dsh-bc-node-accent')}
      {node('side', 226, 172, 198, 88, copy.sideTitle, copy.sideBody, 'dsh-bc-node-dashed', copy.sideTag, 'muted')}
      {edge('M226 216 L214 216', 'side', 'compress')}
      <text x={226} y={282} className="dsh-bc-svg-note">{draft.auto ? t('svgAuto', { ratio: ratioText(ratio), retain: ratioText(retainRatio) }) : t('svgManual')}</text>
      {node('summary', 16, 300, 198, 64, copy.result, copy.resultBody, 'dsh-bc-node-accent', t('svgWriteTag'), 'accent')}
      {node('retained', 226, 300, 198, 64, t('svgRetained'), retain === null ? '\u2014' : '\u2248 ' + tokensText(retain), 'dsh-bc-node-strong', t('svgOriginalTag'), 'muted')}
      {edge('M115 260 L115 300', 'compress', 'summary')}
      {edge('M115 364 L115 410', 'summary', 'continue')}
      {edge('M325 364 L325 410', 'retained', 'continue')}
      <g data-node="continue">
        <rect className="dsh-bc-node dsh-bc-node-strong" x={16} y={410} width={408} height={56} rx={6} />
        <text x={220} y={432} textAnchor="middle" className="dsh-bc-svg-node-title">{t('svgContinue')}</text>
        <text x={220} y={451} textAnchor="middle" className="dsh-bc-svg-node-sub"
          data-bc="process-result" data-mode-result={mode}>{copy.final}</text>
      </g>
      {previewText ? <text x={16} y={488} className="dsh-bc-svg-note">{previewText}</text> : null}
    </svg>
  )
}
