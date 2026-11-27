/**
 * Host-theme CSS for the settings page, injected as one <style> node.
 *
 * One flat surface, one border language (1px solid), one control geometry.
 * Every value comes from a host --dsw-alias-* token mapped to a local --cfg-*
 * name; no component rule hard-codes a colour. See docs/UI-KIT.md.
 */
export const STYLE = `

/* ── page root and tokens ─────────────────────────────────────────────── */
.dsh-bc-page{--cfg-text:var(--dsw-alias-label-primary);--cfg-muted:var(--dsw-alias-label-secondary);--cfg-subtle:color-mix(in srgb,var(--dsw-alias-label-tertiary) 80%,var(--dsw-alias-label-primary));--cfg-canvas:var(--dsw-alias-bg-layer-1);--cfg-raised:var(--dsw-alias-bg-layer-2);--cfg-overlay:var(--dsw-alias-bg-layer-3);--cfg-sunken:color-mix(in srgb,var(--cfg-text) 4%,var(--cfg-canvas));--cfg-line:var(--dsw-alias-border-l1);--cfg-line-2:var(--dsw-alias-border-l2);--cfg-line-3:var(--dsw-alias-border-l3);--cfg-accent:var(--dsw-alias-state-business-primary,#4176e6);--cfg-accent-text:color-mix(in srgb,var(--cfg-accent) 70%,var(--cfg-text));--cfg-accent-soft:color-mix(in srgb,var(--cfg-accent) 10%,transparent);--cfg-solid:var(--dsw-alias-button-primary-fill,#0f1115);--cfg-on-accent:var(--dsw-alias-label-primary-foreground,#fff);--cfg-danger:color-mix(in srgb,var(--dsw-alias-state-error-primary) 60%,var(--cfg-text));--cfg-warn:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 60%,var(--dsw-alias-label-primary));--cfg-hover:var(--dsw-alias-interactive-bg-hover);--cfg-r-sm:6px;--cfg-r-md:8px;--cfg-r-lg:10px;--cfg-r-xl:12px;--cfg-control:32px;--cfg-dur:140ms;display:flex;flex-direction:column;gap:20px;width:100%;max-width:920px;margin:0 auto;min-width:0;padding-bottom:8px;color:var(--cfg-text);font-size:13px;line-height:20px;font-variant-numeric:tabular-nums;container-type:inline-size;container-name:better-compact;overflow-wrap:anywhere;color-scheme:inherit}
.dsh-bc-page *{box-sizing:border-box}
.dsh-bc-page :is(button,input){appearance:none}
.dsh-bc-page :is(button,input,summary,[role=combobox],[role=radio]):focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--cfg-accent));outline-offset:2px}
.dsh-bc-page :disabled{opacity:.4;cursor:not-allowed}
[data-ds-dark-theme] .dsh-bc-page{--cfg-accent-soft:color-mix(in srgb,var(--cfg-accent) 14%,transparent)}

/* ── page head ────────────────────────────────────────────────────────── */
.dsh-bc-page-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;min-width:0}
.dsh-bc-page-titleBlock{display:flex;flex-direction:column;gap:4px;min-width:0}
.dsh-bc-title{margin:0;font-size:20px;line-height:28px;font-weight:500;letter-spacing:-.01em}
.dsh-bc-page-sub{margin:0;color:var(--cfg-muted);font-size:13px;line-height:20px}
.dsh-bc-page-chips{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}

/* ── type ─────────────────────────────────────────────────────────────── */
.dsh-bc-caption,.dsh-bc-help,.dsh-bc-hint{margin:0;font-size:12px;line-height:18px;color:var(--cfg-subtle)}
.dsh-bc-note{margin:0;font-size:12px;line-height:18px;color:var(--cfg-muted)}
.dsh-bc-error{margin:0;font-size:12px;line-height:18px;color:var(--cfg-danger)}
.dsh-bc-warn{margin:0;font-size:12px;line-height:18px;color:var(--cfg-warn)}
.dsh-bc-mono{font-family:var(--dsw-font-family-mono,ui-monospace,SFMono-Regular,Menlo,monospace);font-variant-numeric:tabular-nums}
.dsh-bc-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}

/* ── section ──────────────────────────────────────────────────────────── */
.dsh-bc-editor{display:flex;flex-direction:column;gap:20px;min-width:0}
.dsh-bc-section{display:flex;flex-direction:column;gap:8px;min-width:0;padding-top:16px;border-top:1px solid var(--cfg-line)}
.dsh-bc-editor>.dsh-bc-section:first-child{padding-top:0;border-top:0}
.dsh-bc-section-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex-wrap:wrap;min-width:0}
.dsh-bc-h3{margin:0;font-size:12px;line-height:18px;font-weight:500;color:var(--cfg-subtle);letter-spacing:.02em}
.dsh-bc-h4{margin:0;font-size:13px;line-height:20px;font-weight:500;color:var(--cfg-text)}
.dsh-bc-subhead{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;min-width:0}

/* ── setting rows: label left, control right, no dividers ─────────────── */
.dsh-bc-setting-row{display:flex;align-items:center;justify-content:space-between;gap:24px;min-width:0;padding:8px;margin:0 -8px;border-radius:var(--cfg-r-md)}
.dsh-bc-setting-row:hover{background:var(--cfg-hover)}
.dsh-bc-setting-main{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.dsh-bc-setting-label{font-size:13px;line-height:20px;font-weight:500;color:var(--cfg-text)}
.dsh-bc-setting-desc{max-width:560px;font-size:12px;line-height:18px;color:var(--cfg-subtle)}
.dsh-bc-setting-control{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex:none;min-width:0}
.dsh-bc-setting-control .dsh-bc-field{width:100%;min-width:0}
.dsh-bc-rows{display:flex;flex-direction:column;gap:0;min-width:0;margin-top:4px;padding-top:4px;border-top:1px solid var(--cfg-line)}

/* ── inputs ───────────────────────────────────────────────────────────── */
.dsh-bc-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-label{font-size:12px;font-weight:500;line-height:18px;color:var(--cfg-muted)}
.dsh-bc-input{width:100%;height:var(--cfg-control);min-width:0;padding:0 9px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-md);background:var(--cfg-canvas);color:var(--cfg-text);font:inherit;line-height:20px;transition:border-color var(--cfg-dur) ease}
.dsh-bc-input:hover:not(:disabled){border-color:var(--cfg-line-3)}
.dsh-bc-input:focus-visible{border-color:var(--cfg-accent)}
.dsh-bc-input[aria-invalid=true]{border-color:var(--cfg-danger)}
.dsh-bc-number{position:relative;min-width:0}
.dsh-bc-number .dsh-bc-input{padding-right:26px;text-align:right;appearance:textfield}
.dsh-bc-number input::-webkit-inner-spin-button,.dsh-bc-number input::-webkit-outer-spin-button{appearance:none;margin:0}
.dsh-bc-number-inline{display:flex;align-items:center;gap:6px;flex:none;width:auto}
.dsh-bc-unit{position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--cfg-subtle);font-size:11px;line-height:18px}
.dsh-bc-number-inline .dsh-bc-input{width:96px;padding-right:9px}
.dsh-bc-number-inline .dsh-bc-unit{position:static;transform:none;flex:none}
.dsh-bc-textarea{display:block;width:100%;min-height:180px;padding:10px 12px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-md);background:var(--cfg-canvas);color:var(--cfg-text);font:inherit;font-size:13px;line-height:1.6;resize:vertical;transition:border-color var(--cfg-dur) ease}
.dsh-bc-textarea:hover:not(:disabled){border-color:var(--cfg-line-3)}
.dsh-bc-textarea[aria-invalid=true]{border-color:var(--cfg-danger)}

/* ── buttons and switch ───────────────────────────────────────────────── */
.dsh-bc-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:var(--cfg-control);min-width:0;padding:0 12px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-md);background:var(--cfg-canvas);color:var(--cfg-text);font:inherit;font-weight:500;line-height:20px;white-space:nowrap;cursor:pointer;transition:background-color var(--cfg-dur) ease,border-color var(--cfg-dur) ease}
.dsh-bc-btn:hover:not(:disabled){background:var(--cfg-hover);border-color:var(--cfg-line-3)}
.dsh-bc-btn-primary{border-color:transparent;background:var(--cfg-solid);color:var(--cfg-on-accent)}
.dsh-bc-btn-primary:hover:not(:disabled){background:color-mix(in srgb,var(--cfg-solid) 88%,var(--cfg-text))}
.dsh-bc-btn-remove:hover:not(:disabled){color:var(--cfg-danger)}
.dsh-bc-switch{position:relative;flex:none;width:34px;height:20px;margin:0;padding:2px;border:1px solid var(--cfg-line-3);border-radius:999px;background:var(--cfg-sunken);cursor:pointer;transition:background-color var(--cfg-dur) ease,border-color var(--cfg-dur) ease}
.dsh-bc-switch:before{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--cfg-muted);transition:transform var(--cfg-dur) ease,background-color var(--cfg-dur) ease}
.dsh-bc-switch:checked{border-color:var(--cfg-solid);background:var(--cfg-solid)}
.dsh-bc-switch:checked:before{background:var(--cfg-on-accent);transform:translateX(14px)}

/* ── chip, segmented, segmented choice ────────────────────────────────── */
.dsh-bc-chip{display:inline-flex;align-items:center;min-height:20px;padding:0 8px;border:1px solid var(--cfg-line-2);border-radius:999px;background:var(--cfg-canvas);color:var(--cfg-muted);font-size:11px;line-height:18px;white-space:nowrap}
.dsh-bc-chip[data-tone=accent]{border-color:color-mix(in srgb,var(--cfg-accent) 35%,var(--cfg-line-2));background:var(--cfg-accent-soft);color:var(--cfg-accent-text)}
.dsh-bc-segmented{display:flex;flex:none;gap:2px;height:var(--cfg-control);padding:2px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-md);background:var(--cfg-sunken)}
.dsh-bc-segment{position:relative;display:flex;align-items:center;justify-content:center;min-width:0;padding:0 10px;border:1px solid transparent;border-radius:var(--cfg-r-sm);color:var(--cfg-muted);font-size:12px;line-height:20px;white-space:nowrap;cursor:pointer}
.dsh-bc-segment input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:inherit}
.dsh-bc-segment:hover{background:var(--cfg-hover)}
.dsh-bc-segment[data-checked=true]{border-color:var(--cfg-line-2);background:var(--cfg-raised);color:var(--cfg-accent-text);font-weight:500}
.dsh-bc-segment:has(input:focus-visible){outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--cfg-accent));outline-offset:1px}
.dsh-bc-retain-control{display:flex;align-items:center;gap:8px;min-width:0;flex:none}
.dsh-bc-retain-choice{display:flex;align-items:center;min-width:0;margin:0;padding:0;border:0;flex:none}
.dsh-bc-retain-choice legend{margin:0;padding:0}

/* ── select (combobox) ────────────────────────────────────────────────── */
.dsh-bc-select{position:relative;width:100%;min-width:0;font:inherit}
.dsh-bc-select-trigger{display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left;cursor:pointer}
.dsh-bc-select-trigger[aria-expanded=true]{border-color:var(--cfg-accent)}
.dsh-bc-select-value{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-bc-chevron{flex:none;width:6px;height:6px;margin-right:2px;border-right:1px solid currentColor;border-bottom:1px solid currentColor;color:var(--cfg-muted);transform:translateY(-2px) rotate(45deg);transition:transform var(--cfg-dur) ease}
.dsh-bc-select-trigger[aria-expanded=true] .dsh-bc-chevron{transform:translateY(2px) rotate(225deg)}
.dsh-bc-select-menu{position:absolute;z-index:40;top:calc(100% + 4px);left:0;right:0;min-width:0;overflow:auto;overscroll-behavior:contain;padding:4px;border:1px solid var(--cfg-line-3);border-radius:var(--cfg-r-lg);background:var(--cfg-overlay);font:inherit;box-shadow:0 18px 44px -18px rgb(0 0 0 / .32)}
.dsh-bc-select-menu[data-side=above]{top:auto;bottom:calc(100% + 4px)}
.dsh-bc-select-option{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:30px;padding:4px 8px;border-radius:var(--cfg-r-sm);cursor:pointer;overflow-wrap:anywhere}
.dsh-bc-select-option[data-active=true]{background:var(--cfg-hover)}
.dsh-bc-select-option[aria-selected=true]{background:var(--cfg-accent-soft);color:var(--cfg-accent-text)}
.dsh-bc-option-check{flex:none;width:12px;color:var(--cfg-accent-text)}

/* ── capacity: one bar, one sentence, one row per number ──────────────── */
.dsh-bc-effect{margin:0;font-size:13px;line-height:20px;color:var(--cfg-text)}
.dsh-bc-capacity{display:flex;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-bar{position:relative;min-width:0;background:var(--cfg-sunken)}
.dsh-bc-capacity-bar{height:40px;margin-top:22px;margin-bottom:22px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-sm);overflow:visible}
.dsh-bc-bar-track{display:flex;width:100%;height:100%;overflow:hidden;border-radius:5px}
.dsh-bc-bar-seg{display:flex;align-items:center;justify-content:center;flex:none;min-width:0;height:100%}
.dsh-bc-bar-seg:not(:last-child){border-right:1px solid color-mix(in srgb,var(--cfg-text) 10%,transparent)}
.dsh-bc-bar-label{min-width:0;padding:0 6px;overflow:hidden;color:var(--cfg-text);font-size:11px;line-height:16px;white-space:nowrap;text-overflow:ellipsis}
.dsh-bc-seg-fixed{background:color-mix(in srgb,var(--cfg-subtle) 34%,var(--cfg-raised));color:var(--cfg-muted)}
.dsh-bc-seg-compressible{background:color-mix(in srgb,var(--cfg-accent) 20%,var(--cfg-raised))}
.dsh-bc-seg-retained{background:color-mix(in srgb,var(--cfg-accent) 52%,var(--cfg-raised))}
.dsh-bc-seg-headroom{background:color-mix(in srgb,var(--cfg-subtle) 14%,var(--cfg-raised))}
.dsh-bc-seg-reserved{background:color-mix(in srgb,var(--cfg-line-3) 26%,var(--cfg-raised))}
.dsh-bc-current-line{position:absolute;top:0;bottom:0;z-index:2;border-left:1px solid var(--cfg-text);opacity:.55;pointer-events:none}
.dsh-bc-handle{position:absolute;top:-6px;bottom:-6px;z-index:5;width:20px;padding:0;border:0;background:transparent;cursor:ew-resize;transform:translateX(-50%);touch-action:none}
.dsh-bc-handle-line{position:absolute;top:6px;bottom:6px;left:50%;width:2px;border-radius:1px;background:var(--cfg-accent);transform:translateX(-50%)}
.dsh-bc-handle-chip{position:absolute;bottom:calc(100% + 4px);left:50%;display:inline-flex;align-items:center;min-height:20px;padding:0 7px;border:1px solid var(--cfg-accent);border-radius:999px;background:var(--cfg-overlay);color:var(--cfg-accent-text);font-size:10px;line-height:16px;white-space:nowrap;transform:translateX(-50%);pointer-events:none;opacity:0;transition:opacity var(--cfg-dur) ease}
.dsh-bc-handle[data-handle=retain] .dsh-bc-handle-chip{top:calc(100% + 4px);bottom:auto}
.dsh-bc-handle[data-handle=trigger] .dsh-bc-handle-chip{top:calc(100% + 6px);bottom:auto;opacity:1;border-color:var(--cfg-line-2);color:var(--cfg-muted);background:var(--cfg-canvas)}
.dsh-bc-handle:hover .dsh-bc-handle-chip,.dsh-bc-handle:focus-visible .dsh-bc-handle-chip{opacity:1}
.dsh-bc-retain-pin{position:absolute;top:calc(100% + 4px);z-index:4;display:inline-flex;align-items:center;min-height:18px;padding:0 6px;border:1px solid var(--cfg-line-2);border-radius:999px;background:var(--cfg-canvas);color:var(--cfg-muted);font-size:10px;line-height:16px;white-space:nowrap;transform:translateX(-50%);pointer-events:none}
.dsh-bc-capacity-foot{display:flex;flex-wrap:wrap;gap:2px 12px;min-width:0}
.dsh-bc-capacity-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px 16px;min-width:0;padding-top:2px}
.dsh-bc-cut{position:absolute;top:0;bottom:0;z-index:3;border-left:1px solid var(--cfg-text);opacity:.5;pointer-events:none}
.dsh-bc-cut-chip{position:absolute;bottom:calc(100% + 6px);left:0;transform:translateX(-50%);white-space:nowrap;color:var(--cfg-muted);font-size:10px;line-height:16px}
.dsh-bc-capacity-metrics .dsh-bc-metric{display:flex;flex-direction:row;align-items:baseline;justify-content:space-between;gap:6px;min-width:0}
.dsh-bc-capacity-metrics .dsh-bc-caption{font-size:11px;line-height:18px}
.dsh-bc-capacity-metrics .dsh-bc-metric-value{font-size:11px;line-height:18px}

/* ── strategy ─────────────────────────────────────────────────────────── */
.dsh-bc-strategy-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,400px);gap:24px;align-items:start;min-width:0}
.dsh-bc-strategy-choice,.dsh-bc-strategy-figure{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-strategy-figure{justify-content:center}
.dsh-bc-modes,.dsh-bc-modes-4{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;min-width:0}
.dsh-bc-mode{display:flex;flex-direction:column;gap:4px;min-width:0;padding:10px 12px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-md);background:var(--cfg-canvas);cursor:pointer;transition:background-color var(--cfg-dur) ease,border-color var(--cfg-dur) ease}
.dsh-bc-mode:hover:not([aria-disabled=true]){background:var(--cfg-hover)}
.dsh-bc-mode[aria-checked=true]{border-color:var(--cfg-accent);background:var(--cfg-accent-soft)}
.dsh-bc-mode[aria-disabled=true]{opacity:.4;cursor:not-allowed}
.dsh-bc-mode-head{display:flex;align-items:center;gap:8px;min-width:0}
.dsh-bc-mode-title{min-width:0;font-size:13px;line-height:20px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-bc-mode-tag{flex:none;margin-left:auto;color:var(--cfg-subtle);font-size:11px;line-height:16px;white-space:nowrap}
.dsh-bc-mode[aria-checked=true] .dsh-bc-mode-tag{color:var(--cfg-accent-text)}
.dsh-bc-mode-description{margin:0;color:var(--cfg-muted);font-size:12px;line-height:18px}
.dsh-bc-radio-dot{position:relative;flex:none;width:14px;height:14px;border:1px solid var(--cfg-line-3);border-radius:50%}
.dsh-bc-mode[aria-checked=true] .dsh-bc-radio-dot{border-color:var(--cfg-accent)}
.dsh-bc-mode[aria-checked=true] .dsh-bc-radio-dot:after{content:"";position:absolute;inset:3px;border-radius:50%;background:var(--cfg-accent)}
.dsh-bc-strategy-extra{display:flex;flex-direction:column;gap:0;min-width:0;margin-top:4px;padding-top:4px;border-top:1px solid var(--cfg-line)}

/* one shared process drawing */
.dsh-bc-strategy-svg{display:block;width:100%;max-width:400px;height:auto;margin:0 auto;color:var(--cfg-muted);overflow:visible}
.dsh-bc-strategy-svg text{fill:currentColor;font-family:inherit}
.dsh-bc-svg-node-title{font-size:15px;font-weight:500;fill:var(--cfg-text)}
.dsh-bc-svg-node-sub{font-size:12px;fill:var(--cfg-subtle)}
.dsh-bc-svg-note{font-size:12px;fill:var(--cfg-subtle)}
.dsh-bc-strategy-svg .dsh-bc-node{fill:var(--cfg-sunken);stroke:var(--cfg-line-2);stroke-width:1}
.dsh-bc-strategy-svg .dsh-bc-node-strong{fill:var(--cfg-raised);stroke:var(--cfg-line-3)}
.dsh-bc-strategy-svg .dsh-bc-node-accent{fill:var(--cfg-accent-soft);stroke:var(--cfg-accent)}
.dsh-bc-strategy-svg .dsh-bc-node-dashed{stroke:var(--cfg-line-3)}
.dsh-bc-strategy-svg .dsh-bc-edge{stroke:var(--cfg-subtle);stroke-width:1;fill:none}
.dsh-bc-svg-tag{fill:var(--cfg-sunken);stroke:var(--cfg-line-2);stroke-width:1}
.dsh-bc-svg-tag-accent{fill:var(--cfg-accent-soft);stroke:var(--cfg-accent)}
.dsh-bc-svg-tag-text{font-size:10px;fill:var(--cfg-muted)}
.dsh-bc-svg-tag-text-accent{fill:var(--cfg-accent-text)}

/* ── generation, custom model ─────────────────────────────────────────── */
.dsh-bc-process-model{display:flex;flex-direction:column;gap:0;min-width:0}
.dsh-bc-setting-control .dsh-bc-select{width:280px;max-width:100%}
.dsh-bc-custom-model{min-width:0;margin:0 0 4px;padding:12px;border:1px solid var(--cfg-line);border-radius:var(--cfg-r-md);background:var(--cfg-sunken)}
.dsh-bc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px;min-width:0}

/* ── custom prompt ────────────────────────────────────────────────────── */
.dsh-bc-prompt-toolbar{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-width:0;padding:8px 10px;border:1px solid var(--cfg-line);border-radius:var(--cfg-r-md);background:var(--cfg-sunken)}
.dsh-bc-variable{height:26px;padding:0 8px;border-color:var(--cfg-line-2);background:var(--cfg-canvas);color:var(--cfg-text);font-size:11px;cursor:pointer}
.dsh-bc-variable:hover:not(:disabled){border-color:var(--cfg-accent);background:var(--cfg-accent-soft);color:var(--cfg-accent-text)}
.dsh-bc-prompt-foot{display:flex;align-items:baseline;gap:4px 12px;flex-wrap:wrap;min-width:0}

/* ── details (advanced rules, diagnostics) ────────────────────────────── */
.dsh-bc-details{min-width:0;padding-top:8px;border-top:1px solid var(--cfg-line-2)}
.dsh-bc-details>summary{display:flex;align-items:center;gap:8px;min-height:28px;width:fit-content;padding:0;font-size:12px;line-height:18px;font-weight:500;color:var(--cfg-subtle);cursor:pointer;list-style:none}
.dsh-bc-details>summary::-webkit-details-marker{display:none}
.dsh-bc-details>summary:before{content:"";flex:none;width:5px;height:5px;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(-45deg)}
.dsh-bc-details[open]>summary:before{transform:translateY(-2px) rotate(45deg)}
.dsh-bc-details-body{display:flex;flex-direction:column;gap:16px;min-width:0;padding-top:12px}
.dsh-bc-explanation{min-width:0;font-size:12px;line-height:18px}
.dsh-bc-explanation>summary{display:flex;align-items:center;gap:8px;min-height:28px;width:fit-content;padding:0;color:var(--cfg-muted);cursor:pointer;list-style:none}
.dsh-bc-explanation>summary::-webkit-details-marker{display:none}
.dsh-bc-explanation>summary:before{content:"";flex:none;width:5px;height:5px;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(-45deg)}
.dsh-bc-explanation[open]>summary:before{transform:translateY(-2px) rotate(45deg)}
.dsh-bc-explanation-body{display:flex;flex-direction:column;gap:8px;padding-top:8px;min-width:0}

/* ── read-only facts (runtime budget, last compaction, policies) ──────── */
.dsh-bc-runtime{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-budget-view{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;min-width:0;padding:4px 0}
.dsh-bc-row-label{min-width:0;color:var(--cfg-muted);font-size:12px}
.dsh-bc-row-value{min-width:0;text-align:right;font-size:12px;overflow-wrap:anywhere}
.dsh-bc-status-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 16px}
.dsh-bc-status-record{display:flex;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-status-line{margin:0;font-size:12px;font-weight:500;line-height:18px}
.dsh-bc-status-failed,.dsh-bc-status-persistence-error{color:var(--cfg-danger)}
.dsh-bc-continuation{display:flex;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-reasons,.dsh-bc-bullets{display:flex;flex-direction:column;gap:4px;margin:0;padding-left:18px;color:var(--cfg-muted);font-size:12px;line-height:18px}
.dsh-bc-reasons li{min-width:0;overflow-wrap:anywhere}
.dsh-bc-policy-card{min-width:0;margin-top:8px;padding:10px 12px;border:1px solid var(--cfg-line);border-radius:var(--cfg-r-md);background:var(--cfg-canvas)}
.dsh-bc-policy-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;min-width:0}
.dsh-bc-policy-head>span{min-width:0;overflow-wrap:anywhere;font-size:12px;line-height:18px}
.dsh-bc-policy-body{display:flex;flex-direction:column;gap:16px;min-width:0}

/* ── session row, banner, footer ──────────────────────────────────────── */
.dsh-bc-session{display:flex;align-items:center;gap:8px;min-width:0;flex:1}
.dsh-bc-session .dsh-bc-label{flex:none}
.dsh-bc-session .dsh-bc-select{flex:1;min-width:0}
.dsh-bc-session-row{display:flex;align-items:center;gap:8px 12px;flex-wrap:wrap;min-width:0}
.dsh-bc-session-row .dsh-bc-session{flex:1;min-width:240px}
.dsh-bc-session-help{flex-basis:100%}
.dsh-bc-banner{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;min-width:0;padding:8px 0;border-top:1px solid var(--cfg-line)}
.dsh-bc-banner .dsh-bc-chip{white-space:normal;max-width:100%;height:auto;min-height:20px;padding:2px 8px;border-radius:var(--cfg-r-sm);line-height:16px}
.dsh-bc-footer{position:sticky;bottom:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:auto;padding:12px 0;border-top:1px solid var(--cfg-line-2);background:var(--cfg-canvas)}
.dsh-bc-footer-copy{display:flex;flex:1;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-footer-errors{display:flex;flex-direction:column;gap:4px;min-width:0}
.dsh-bc-actions{display:flex;gap:8px;margin-left:auto}
.dsh-bc-save-feedback{position:sticky;bottom:8px;align-self:flex-end;margin:0;padding:6px 10px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-sm);background:var(--cfg-raised);color:var(--cfg-muted);font-size:12px;line-height:18px}

/* ── narrow panes ─────────────────────────────────────────────────────── */
@container better-compact (max-width:760px){
  .dsh-bc-strategy-layout{grid-template-columns:minmax(0,1fr)}
  .dsh-bc-strategy-figure{max-width:480px;margin:0 auto}
  .dsh-bc-setting-control .dsh-bc-select{width:100%}
}
@container better-compact (max-width:640px){
  .dsh-bc-setting-row{align-items:stretch;flex-direction:column;gap:8px}
  .dsh-bc-setting-control{width:100%}
  .dsh-bc-number-inline{width:100%}
  .dsh-bc-number-inline .dsh-bc-input{text-align:right}
  .dsh-bc-strategy-layout{grid-template-columns:minmax(0,1fr)}
  .dsh-bc-grid,.dsh-bc-status-grid{grid-template-columns:1fr}
  .dsh-bc-page :is(button,summary,.dsh-bc-input,.dsh-bc-select-option){min-height:44px}
  .dsh-bc-switch{width:38px;height:22px}
  .dsh-bc-switch:before{width:16px;height:16px}
  .dsh-bc-switch:checked:before{transform:translateX(16px)}
  .dsh-bc-segmented{height:38px}
  .dsh-bc-session-row .dsh-bc-session{flex-basis:100%}
  .dsh-bc-capacity-bar{height:36px}
  .dsh-bc-capacity-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}
  .dsh-bc-number-inline .dsh-bc-input{width:100%}
  .dsh-bc-session-help{flex-basis:auto}
}
@container better-compact (max-width:560px){
  .dsh-bc-title{font-size:18px;line-height:26px}
  .dsh-bc-modes,.dsh-bc-modes-4{grid-template-columns:1fr}
  .dsh-bc-capacity-metrics{grid-template-columns:1fr}
  .dsh-bc-bar-label{font-size:10px;padding:0 4px}
  .dsh-bc-retain-control{flex-wrap:wrap}
  .dsh-bc-textarea{min-height:220px}
  .dsh-bc-svg-node-title{font-size:16px}
  .dsh-bc-svg-node-sub,.dsh-bc-svg-note{font-size:13px}
}
@media (prefers-reduced-motion:reduce){.dsh-bc-page *{transition:none!important;animation:none!important}}

`
