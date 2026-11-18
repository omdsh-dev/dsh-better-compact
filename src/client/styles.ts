/**
 * Host-theme CSS for the settings page, injected as one <style> node.
 *
 * Copied verbatim from the pre-TypeScript client bundle: the injection point
 * (one <style key="dsh-bc-style">) is unchanged, so no CSS loading path
 * moves. Only host --dsw-alias-* tokens are referenced.
 */
export const STYLE = `

/* Flat settings surface; all borders are 1px solid, no gradients or shadows outside overlays. */
.dsh-bc-page{--cfg-text:var(--dsw-alias-label-primary);--cfg-muted:var(--dsw-alias-label-secondary);--cfg-subtle:color-mix(in srgb,var(--dsw-alias-label-tertiary) 80%,var(--dsw-alias-label-primary));--cfg-canvas:var(--dsw-alias-bg-layer-1);--cfg-raised:var(--dsw-alias-bg-layer-2);--cfg-overlay:var(--dsw-alias-bg-layer-3);--cfg-sunken:color-mix(in srgb,var(--cfg-text) 4%,var(--cfg-canvas));--cfg-line:var(--dsw-alias-border-l1);--cfg-line-2:var(--dsw-alias-border-l2);--cfg-control-line:var(--dsw-alias-border-l2);--cfg-line-3:var(--dsw-alias-border-l3);--cfg-accent:var(--dsw-alias-state-business-primary,#4176e6);--cfg-accent-text:color-mix(in srgb,var(--cfg-accent) 70%,var(--cfg-text));--cfg-accent-soft:color-mix(in srgb,var(--cfg-accent) 10%,transparent);--cfg-solid:var(--dsw-alias-button-primary-fill,#0f1115);--cfg-on-accent:var(--dsw-alias-label-primary-foreground,#fff);--cfg-danger:color-mix(in srgb,var(--dsw-alias-state-error-primary) 60%,var(--cfg-text));--cfg-warn:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 60%,var(--dsw-alias-label-primary));--cfg-hover:var(--dsw-alias-interactive-bg-hover);--cfg-r-sm:6px;--cfg-r-md:8px;--cfg-r-lg:10px;--cfg-r-xl:12px;--cfg-control:32px;--cfg-control-sm:28px;--cfg-dur:140ms;display:flex;flex-direction:column;gap:24px;width:100%;max-width:920px;margin:0 auto;min-width:0;color:var(--cfg-text);font-size:13px;line-height:20px;font-variant-numeric:tabular-nums;container-type:inline-size;container-name:better-compact;overflow-wrap:anywhere;color-scheme:inherit}
.dsh-bc-page *{box-sizing:border-box}
.dsh-bc-page :is(button,input){appearance:none}
[data-ds-dark-theme] .dsh-bc-page{--cfg-accent-soft:color-mix(in srgb,var(--cfg-accent) 14%,transparent)}
.dsh-bc-page-head{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0;flex-wrap:wrap}
.dsh-bc-page-chips{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}
.dsh-bc-title{margin:0;font-size:20px;line-height:28px;font-weight:500;letter-spacing:-.01em}
.dsh-bc-chip{display:inline-flex;align-items:center;min-height:20px;padding:0 8px;border:1px solid var(--cfg-line-2);border-radius:999px;background:var(--cfg-raised);color:var(--cfg-muted);font-size:11px;line-height:18px;white-space:nowrap}
.dsh-bc-chip[data-tone=accent]{border-color:color-mix(in srgb,var(--cfg-accent) 35%,var(--cfg-line-2));background:var(--cfg-accent-soft);color:var(--cfg-accent-text)}
.dsh-bc-section{display:flex;flex-direction:column;gap:4px;min-width:0;padding-top:12px;border-top:1px solid var(--cfg-line-2)}
.dsh-bc-section-head,.dsh-bc-subhead{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;min-width:0}
.dsh-bc-section-head{padding-bottom:8px;border-bottom:1px solid var(--cfg-line);margin-bottom:2px}
.dsh-bc-h3,.dsh-bc-h4{margin:0;font-size:12px;line-height:18px;font-weight:500;color:var(--cfg-subtle);letter-spacing:.02em}
.dsh-bc-h4{font-size:13px;color:var(--cfg-text)}
.dsh-bc-caption,.dsh-bc-help{margin:0;font-size:12px;line-height:18px;color:var(--cfg-subtle)}
.dsh-bc-note{margin:0;font-size:12px;line-height:18px;color:var(--cfg-muted)}
.dsh-bc-hint{margin:0;font-size:12px;line-height:18px;color:var(--cfg-subtle)}
.dsh-bc-error{margin:0;font-size:12px;line-height:18px;color:var(--cfg-danger);overflow-wrap:anywhere}
.dsh-bc-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
.dsh-bc-strong{font-weight:500}
.dsh-bc-mono{font-variant-numeric:tabular-nums;font-family:var(--dsw-font-family-mono,ui-monospace,SFMono-Regular,Menlo,monospace)}
.dsh-bc-modes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.dsh-bc-mode{display:flex;flex-direction:column;gap:8px;min-width:0;padding:12px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-lg);background:var(--cfg-raised);color:var(--cfg-text);cursor:pointer;transition:background-color var(--cfg-dur) ease,border-color var(--cfg-dur) ease}
.dsh-bc-mode:hover:not([aria-disabled=true]){background:color-mix(in srgb,var(--cfg-text) 3%,var(--cfg-raised))}
.dsh-bc-mode[aria-checked=true]{border-color:var(--cfg-accent);background:var(--cfg-accent-soft)}
.dsh-bc-mode[aria-disabled=true],.dsh-bc-page :disabled{opacity:.4;cursor:not-allowed}
.dsh-bc-mode-head{display:flex;align-items:center;gap:8px;min-width:0}
.dsh-bc-mode-title{font-size:13px;line-height:20px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-bc-radio-dot{display:block;position:relative;flex:none;width:14px;height:14px;border:1px solid var(--cfg-line-3);border-radius:50%}
.dsh-bc-mode[aria-checked=true] .dsh-bc-radio-dot{border-color:var(--cfg-accent)}
.dsh-bc-mode[aria-checked=true] .dsh-bc-radio-dot:after{content:"";position:absolute;inset:3px;border-radius:50%;background:var(--cfg-accent)}
.dsh-bc-mode-description{margin:0;color:var(--cfg-muted);font-size:12px;line-height:18px;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.dsh-bc-diagram-wrap{min-width:0;margin-top:auto}
.dsh-bc-diagram{display:block;width:100%;max-width:180px;height:auto;margin:8px auto 0;color:var(--cfg-subtle)}
.dsh-bc-diagram text{fill:currentColor;font-family:inherit;font-size:11px}
.dsh-bc-mode[aria-checked=true] .dsh-bc-diagram{color:var(--cfg-accent-text)}
.dsh-bc-node{fill:var(--cfg-sunken);stroke:var(--cfg-line-2);stroke-width:1}
.dsh-bc-node-strong{fill:var(--cfg-raised);stroke:var(--cfg-line-3)}
.dsh-bc-node-accent{fill:var(--cfg-accent-soft);stroke:var(--cfg-accent)}
.dsh-bc-node-dashed{stroke:var(--cfg-line-3)}
.dsh-bc-edge{stroke:currentColor;stroke-width:1;fill:none}
.dsh-bc-strategy-foot{margin-top:2px}
.dsh-bc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px}
.dsh-bc-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-setting-row{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:10px 0;border-bottom:1px solid var(--cfg-line)}
.dsh-bc-setting-row:last-child{border-bottom:0}
.dsh-bc-setting-main{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.dsh-bc-setting-label{font-size:13px;line-height:20px;font-weight:500;color:var(--cfg-text)}
.dsh-bc-setting-desc{font-size:12px;line-height:18px;color:var(--cfg-subtle)}
.dsh-bc-setting-control{display:flex;align-items:center;gap:8px;flex:none}
.dsh-bc-threshold{display:flex;flex-direction:column;gap:4px}
.dsh-bc-thresholdHead{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}
.dsh-bc-number{position:relative;min-width:0}
.dsh-bc-number .dsh-bc-input{padding-right:24px;appearance:textfield}
.dsh-bc-number input::-webkit-inner-spin-button,.dsh-bc-number input::-webkit-outer-spin-button{appearance:none;margin:0}
.dsh-bc-number-inline{flex:none;width:76px}
.dsh-bc-number-inline .dsh-bc-input{height:28px;text-align:right}
.dsh-bc-unit{position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--cfg-subtle);font-size:11px;line-height:18px}
.dsh-bc-switch{appearance:none;position:relative;flex:none;width:34px;height:20px;margin:0;padding:0;border:1px solid var(--cfg-line-3);border-radius:999px;background:var(--cfg-sunken);cursor:pointer;transition:background-color var(--cfg-dur) ease,border-color var(--cfg-dur) ease}
.dsh-bc-switch:before{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--cfg-muted);transition:transform var(--cfg-dur) ease,background-color var(--cfg-dur) ease}
.dsh-bc-switch:checked{border-color:var(--cfg-solid);background:var(--cfg-solid)}
.dsh-bc-switch:checked:before{background:var(--cfg-on-accent);transform:translateX(14px)}
.dsh-bc-range-wrap{position:relative;display:flex;align-items:center;height:28px;min-width:0}
.dsh-bc-range-wrap:before{content:"";position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);height:4px;border-radius:2px;background:var(--cfg-line)}
.dsh-bc-range-fill{position:absolute;left:0;top:50%;transform:translateY(-50%);height:4px;border-radius:2px;background:var(--cfg-accent)}
.dsh-bc-range{appearance:none;position:relative;z-index:1;display:block;width:100%;height:28px;margin:0;background:transparent;cursor:pointer}
.dsh-bc-range::-webkit-slider-runnable-track{height:4px;background:transparent}
.dsh-bc-range::-moz-range-track{height:4px;background:transparent}
.dsh-bc-range::-webkit-slider-thumb{appearance:none;width:14px;height:14px;margin-top:-5px;border:2px solid var(--cfg-accent);border-radius:50%;background:var(--cfg-raised)}
.dsh-bc-range::-moz-range-thumb{width:10px;height:10px;border:2px solid var(--cfg-accent);border-radius:50%;background:var(--cfg-raised)}
.dsh-bc-scale{display:flex;justify-content:space-between;font-size:11px;line-height:16px;color:var(--cfg-subtle)}
.dsh-bc-label{font-size:12px;font-weight:500;line-height:18px;color:var(--cfg-muted)}
.dsh-bc-input,.dsh-bc-btn{height:var(--cfg-control);min-width:0;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-md);background:var(--cfg-raised);color:var(--cfg-text);font:inherit;line-height:20px}
.dsh-bc-input{width:100%;padding:0 9px;transition:border-color var(--cfg-dur) ease}
.dsh-bc-input:hover:not(:disabled){border-color:var(--cfg-line-3)}
.dsh-bc-input:focus-visible{border-color:var(--cfg-accent);outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--cfg-accent));outline-offset:1px}
.dsh-bc-input[aria-invalid=true]{border-color:var(--cfg-danger)}
.dsh-bc-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px;white-space:nowrap;cursor:pointer;font-weight:500;transition:background-color var(--cfg-dur) ease,border-color var(--cfg-dur) ease}
.dsh-bc-btn:hover:not(:disabled){background:var(--cfg-hover)}
.dsh-bc-btn:active:not(:disabled){background:color-mix(in srgb,var(--cfg-text) 6%,var(--cfg-raised))}
.dsh-bc-btn-primary{border-color:transparent;background:var(--cfg-solid);color:var(--cfg-on-accent)}
.dsh-bc-btn-primary:hover:not(:disabled){background:color-mix(in srgb,var(--cfg-solid) 88%,var(--cfg-text))}
.dsh-bc-btn-remove:hover:not(:disabled){color:var(--cfg-danger)}
.dsh-bc-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;min-width:0;padding:6px 0;border-bottom:1px solid var(--cfg-line)}
.dsh-bc-row:last-child{border-bottom:0}
.dsh-bc-row-label{min-width:0;color:var(--cfg-muted);font-size:12px}
.dsh-bc-row-value{min-width:0;text-align:right;font-size:12px;overflow-wrap:anywhere}
.dsh-bc-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;min-width:0}
.dsh-bc-metric{display:flex;flex-direction:column;gap:2px;min-width:0}
.dsh-bc-metric-value{font-size:13px;line-height:20px;font-weight:500;overflow-wrap:anywhere}
.dsh-bc-budget-view{display:flex;flex-direction:column;gap:10px;min-width:0}
.dsh-bc-retention{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:12px 16px;align-items:start;min-width:0}
.dsh-bc-composition{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-bar{position:relative;min-width:0;height:20px;border:1px solid var(--cfg-line-2);border-radius:4px;overflow:hidden;background:var(--cfg-sunken)}
.dsh-bc-bar-track{display:flex;width:100%;height:100%}
.dsh-bc-bar-seg{flex:none;height:100%;border-right:1px solid var(--cfg-line)}
.dsh-bc-seg-fixed,.dsh-bc-swatch-fixed{background:var(--cfg-subtle);opacity:.45}
.dsh-bc-seg-history,.dsh-bc-swatch-history{background:var(--cfg-accent);opacity:.3}
.dsh-bc-seg-tail,.dsh-bc-swatch-tail{background:var(--cfg-accent)}
.dsh-bc-seg-summary,.dsh-bc-swatch-summary{background:var(--cfg-accent);opacity:.6}
.dsh-bc-seg-headroom,.dsh-bc-swatch-headroom{background:var(--cfg-line-3);opacity:.8}
.dsh-bc-seg-free{background:transparent}
.dsh-bc-trigger,.dsh-bc-current-line{position:absolute;top:0;bottom:0;pointer-events:none;max-width:100%;transform:translateX(-1px);border-left:1px solid var(--cfg-text)}
.dsh-bc-current-line{border-color:var(--cfg-accent)}
.dsh-bc-legend{display:flex;flex-wrap:wrap;gap:4px 12px;margin:0;padding:0;list-style:none;color:var(--cfg-subtle);font-size:11px;line-height:18px}
.dsh-bc-legend li{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-bc-swatch{display:block;flex:none;width:10px;height:10px;border:1px solid var(--cfg-line-2);border-radius:2px}
.dsh-bc-retain-choice{display:flex;flex-direction:column;gap:6px;min-width:0;margin:0;padding:0;border:0}
.dsh-bc-retain-choice legend{margin:0 0 6px;padding:0}
.dsh-bc-segmented{display:flex;gap:2px;height:32px;padding:2px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-md);background:var(--cfg-sunken)}
.dsh-bc-segment{position:relative;display:flex;align-items:center;justify-content:center;flex:1;min-width:0;padding:0 8px;border:1px solid transparent;border-radius:var(--cfg-r-sm);color:var(--cfg-muted);font-size:12px;line-height:20px;cursor:pointer;white-space:nowrap}
.dsh-bc-segment input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:inherit}
.dsh-bc-segment:hover{background:var(--cfg-hover)}
.dsh-bc-segment[data-checked=true]{background:var(--cfg-raised);border-color:var(--cfg-line-2);color:var(--cfg-accent-text);font-weight:500}
.dsh-bc-segment:has(input:focus-visible){outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--cfg-accent));outline-offset:2px}
.dsh-bc-segment:has(input:disabled){opacity:.4;cursor:not-allowed}
.dsh-bc-explanation{min-width:0;font-size:12px;line-height:18px}
.dsh-bc-explanation>summary{display:flex;align-items:center;gap:8px;min-height:28px;width:fit-content;padding:0;color:var(--cfg-muted);cursor:pointer;list-style:none}
.dsh-bc-explanation>summary::-webkit-details-marker{display:none}
.dsh-bc-explanation>summary:before{content:"";flex:none;width:5px;height:5px;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(-45deg)}
.dsh-bc-explanation[open]>summary:before{transform:translateY(-2px) rotate(45deg)}
.dsh-bc-explanation-body{display:flex;flex-direction:column;gap:8px;padding-top:8px;min-width:0}
.dsh-bc-details{min-width:0;border-top:1px solid var(--cfg-line-2);padding-top:12px}
.dsh-bc-details>summary{display:flex;align-items:center;gap:8px;min-height:28px;padding:0;font-size:12px;line-height:18px;font-weight:500;color:var(--cfg-subtle);cursor:pointer;list-style:none}
.dsh-bc-details>summary::-webkit-details-marker{display:none}
.dsh-bc-details>summary:before{content:"";flex:none;width:5px;height:5px;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(-45deg)}
.dsh-bc-details[open]>summary:before{transform:translateY(-2px) rotate(45deg)}
.dsh-bc-details-body,.dsh-bc-policy-body{display:flex;flex-direction:column;gap:16px;min-width:0;padding-top:12px}
.dsh-bc-policy{min-width:0;border-top:1px solid var(--cfg-line)}
.dsh-bc-policy>summary{padding:10px 0;font-size:12px;overflow-wrap:anywhere;cursor:pointer}
.dsh-bc-policy-body{padding-top:4px;padding-bottom:12px}
.dsh-bc-status-record{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-status-line{margin:0;font-size:12px;font-weight:500;line-height:18px}
.dsh-bc-status-failed,.dsh-bc-status-persistence-error{color:var(--cfg-danger)}
.dsh-bc-status-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 16px}
.dsh-bc-continuation{display:flex;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-reasons,.dsh-bc-bullets{display:flex;flex-direction:column;gap:4px;margin:0;padding-left:18px;color:var(--cfg-muted);font-size:12px;line-height:18px}
.dsh-bc-reasons li{min-width:0;overflow-wrap:anywhere}
.dsh-bc-session{display:flex;align-items:center;gap:8px;min-width:0;width:100%}
.dsh-bc-session .dsh-bc-label{flex:none}
.dsh-bc-session .dsh-bc-select{flex:1;min-width:0}
.dsh-bc-banner{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;min-width:0;padding:8px 0;border-top:1px solid var(--cfg-line-2)}
.dsh-bc-banner .dsh-bc-chip{white-space:normal;max-width:100%;height:auto;min-height:20px;padding:2px 8px;border-radius:var(--cfg-r-sm);line-height:16px}
.dsh-bc-banner-title{font-size:12px;line-height:18px;color:var(--cfg-muted)}
.dsh-bc-runtime{display:flex;flex-direction:column;gap:12px;min-width:0}
.dsh-bc-preview{display:flex;flex-direction:column;gap:8px;padding-top:12px;border-top:1px solid var(--cfg-line);min-width:0}
.dsh-bc-preview-arrow{height:16px;line-height:16px;text-align:center;color:var(--cfg-subtle)}
.dsh-bc-preview-line{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0;padding-top:8px;border-top:1px solid var(--cfg-line);font-size:12px;line-height:18px;color:var(--cfg-muted)}
.dsh-bc-preview-line .dsh-bc-preview-arrow{height:auto;line-height:18px;color:var(--cfg-subtle)}
.dsh-bc-workbench{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:start;min-width:0}
.dsh-bc-workbench[data-has-preview=true]{grid-template-columns:minmax(0,1fr) 280px}
.dsh-bc-main{display:flex;flex-direction:column;gap:12px;min-width:0}
.dsh-bc-rail{position:sticky;top:0;min-width:0}
.dsh-bc-rail .dsh-bc-budget-view{padding:12px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-lg);background:var(--cfg-raised)}
.dsh-bc-rail .dsh-bc-metrics{grid-template-columns:1fr;gap:6px}
.dsh-bc-rail .dsh-bc-metric{flex-direction:row;align-items:baseline;justify-content:space-between;gap:8px}
.dsh-bc-rail .dsh-bc-legend{gap:4px 12px}
.dsh-bc-footer{position:static;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 0;border-top:1px solid var(--cfg-line-2);background:var(--cfg-canvas);margin-top:auto}
.dsh-bc-footer-copy{display:flex;flex:1;flex-direction:column;gap:6px;min-width:0}
.dsh-bc-actions{display:flex;gap:8px;margin-left:auto}
.dsh-bc-save-feedback{position:sticky;bottom:8px;align-self:flex-end;margin:0;padding:6px 10px;border:1px solid var(--cfg-line-2);border-radius:var(--cfg-r-sm);background:var(--cfg-raised);color:var(--cfg-muted);font-size:12px;line-height:18px}
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
.dsh-bc-page :is(button,input,summary,[role=combobox],[role=radio]):focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--cfg-accent));outline-offset:2px}
@container better-compact (max-width:860px){.dsh-bc-workbench[data-has-preview=true]{grid-template-columns:minmax(0,1fr)}.dsh-bc-rail{position:static;max-height:none;overflow:visible}}
@container better-compact (max-width:640px){.dsh-bc-page :is(button,summary),.dsh-bc-input,.dsh-bc-range,.dsh-bc-select-option{min-height:44px}.dsh-bc-range-wrap{height:44px}.dsh-bc-segmented{height:auto;min-height:44px}.dsh-bc-segment{min-height:38px}.dsh-bc-setting-row:has(.dsh-bc-switch){flex-direction:row;align-items:center}.dsh-bc-setting-control:has(.dsh-bc-switch){width:auto;min-height:44px;min-width:44px;justify-content:center}.dsh-bc-switch:after{content:"";position:absolute;inset:-13px -6px}.dsh-bc-modes{grid-template-columns:1fr}.dsh-bc-setting-row{align-items:stretch;flex-direction:column;gap:8px}.dsh-bc-setting-control{width:100%}.dsh-bc-grid,.dsh-bc-status-grid,.dsh-bc-retention{grid-template-columns:1fr}.dsh-bc-metrics{grid-template-columns:1fr;gap:6px}.dsh-bc-metric{flex-direction:row;align-items:baseline;justify-content:space-between;gap:12px}.dsh-bc-session{flex-wrap:wrap}.dsh-bc-session .dsh-bc-label{flex-basis:100%}.dsh-bc-footer-copy{flex-basis:100%}.dsh-bc-actions{margin-left:auto}}
@container better-compact (max-width:560px){.dsh-bc-title{font-size:18px;line-height:26px}.dsh-bc-modes{grid-template-columns:1fr}.dsh-bc-mode{display:flex;flex-direction:column}.dsh-bc-grid,.dsh-bc-status-grid,.dsh-bc-retention{grid-template-columns:1fr}.dsh-bc-metrics{grid-template-columns:1fr;gap:6px}.dsh-bc-metric{flex-direction:row;align-items:baseline;justify-content:space-between;gap:12px}.dsh-bc-section{padding-top:10px}.dsh-bc-setting-row{align-items:stretch;flex-direction:column;gap:8px}.dsh-bc-setting-control{width:100%}.dsh-bc-session{flex-wrap:wrap}.dsh-bc-session .dsh-bc-label{flex-basis:100%}.dsh-bc-footer-copy{flex-basis:100%}.dsh-bc-actions{margin-left:auto}.dsh-bc-details-body,.dsh-bc-policy-body{padding-top:10px}}
@media (max-width:640px), (pointer:coarse){.dsh-bc-page :is(button,summary),.dsh-bc-input,.dsh-bc-range,.dsh-bc-select-option{min-height:44px}.dsh-bc-range-wrap{height:44px}.dsh-bc-segmented{height:auto;min-height:44px}.dsh-bc-segment{min-height:38px}.dsh-bc-setting-row:has(.dsh-bc-switch){flex-direction:row;align-items:center}.dsh-bc-setting-control:has(.dsh-bc-switch){width:auto;min-height:44px;min-width:44px;justify-content:center}.dsh-bc-switch:after{content:"";position:absolute;inset:-13px -6px}}
@media (prefers-reduced-motion:reduce){.dsh-bc-page *{transition:none!important;animation:none!important}}

/* One editable process surface; stages keep their connections on narrow panels. */
.dsh-bc-process{display:flex;flex-direction:column;gap:16px;min-width:0}
.dsh-bc-process-heading{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap}
.dsh-bc-process-heading .dsh-bc-h4{font-size:16px;line-height:24px}
.dsh-bc-process-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px 24px;min-width:0}
.dsh-bc-process-stage{position:relative;display:flex;flex-direction:column;gap:16px;min-width:0;padding:20px;border:1px solid var(--cfg-line);border-radius:12px;background:var(--cfg-raised)}
.dsh-bc-stage-head{display:flex;align-items:center;gap:10px}
.dsh-bc-stage-head .dsh-bc-h3{color:var(--cfg-text);font-size:14px;line-height:22px}
.dsh-bc-stage-number{display:grid;place-items:center;flex:none;min-width:28px;height:28px;border:1px solid var(--cfg-control-line);border-radius:6px;color:var(--cfg-muted);font-size:12px}
.dsh-bc-stage-context,.dsh-bc-stage-trigger,.dsh-bc-stage-result{grid-column:1/-1}
.dsh-bc-stage-context:after{content:'↓';position:absolute;top:100%;left:50%;height:40px;line-height:40px;text-align:center;color:var(--cfg-muted)}
.dsh-bc-stage-trigger:after{content:'';position:absolute;top:100%;left:50%;height:20px;border-left:1px solid var(--cfg-control-line)}
.dsh-bc-stage-summary:before{content:'';position:absolute;bottom:calc(100% + 19px);left:50%;width:calc(100% + 24px);border-top:1px solid var(--cfg-control-line)}
.dsh-bc-stage-summary:after,.dsh-bc-stage-retention:before{content:'↓';position:absolute;bottom:100%;left:50%;height:20px;line-height:20px;text-align:center;color:var(--cfg-muted)}
.dsh-bc-stage-result{background:var(--cfg-sunken)}
.dsh-bc-stage-result:before{content:'';position:absolute;bottom:calc(100% + 20px);left:25%;width:50%;height:20px;border-left:1px solid var(--cfg-control-line);border-right:1px solid var(--cfg-control-line);border-bottom:1px solid var(--cfg-control-line)}
.dsh-bc-stage-result:after{content:'↓';position:absolute;bottom:100%;left:50%;height:20px;line-height:20px;color:var(--cfg-muted)}
.dsh-bc-anatomy{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-anatomy-parts{display:flex;gap:8px;list-style:none;margin:0;padding:0;min-width:0}
.dsh-bc-anatomy-part{display:flex;align-items:center;justify-content:center;flex:1;min-width:0;min-height:48px;padding:10px 12px;border:1px solid var(--cfg-control-line);border-radius:6px;background:var(--cfg-raised);text-align:center;font-size:13px;line-height:20px}
.dsh-bc-anatomy-part[data-part=earlier],.dsh-bc-anatomy-part[data-part=summary],.dsh-bc-anatomy-part[data-part=goalSummary],.dsh-bc-anatomy-part[data-part=handoffBody]{background:var(--cfg-accent-soft);border-color:var(--cfg-accent)}
.dsh-bc-process-metrics{display:flex;flex-direction:column;gap:8px}
.dsh-bc-process-metrics .dsh-bc-metric{flex-direction:row;align-items:baseline;justify-content:space-between;gap:12px}
.dsh-bc-process-cache,.dsh-bc-process-model{display:flex;flex-direction:column;gap:10px;min-width:0}
.dsh-bc-process-model .dsh-bc-grid{grid-template-columns:1fr}
.dsh-bc-process-path{margin:0;padding:10px 12px;background:var(--cfg-sunken);border:1px solid var(--cfg-line);border-radius:6px;font-size:12px;line-height:20px}
.dsh-bc-process-result{margin:0;font-size:16px;line-height:26px;font-weight:500}
.dsh-bc-process .dsh-bc-modes{gap:6px}
.dsh-bc-process .dsh-bc-mode{padding:10px 8px;border-radius:6px;gap:6px}
.dsh-bc-process .dsh-bc-mode-head{gap:6px}
.dsh-bc-process .dsh-bc-mode-title{font-size:12px}
.dsh-bc-process .dsh-bc-radio-dot{width:12px;height:12px}
.dsh-bc-process .dsh-bc-mode-description{font-size:11px;line-height:17px}
.dsh-bc-process .dsh-bc-strategy-foot{margin:0}
.dsh-bc-process .dsh-bc-range-wrap,.dsh-bc-process .dsh-bc-range{height:44px}
.dsh-bc-process .dsh-bc-range::-webkit-slider-thumb{width:16px;height:24px;margin-top:-10px;border:1px solid var(--cfg-accent);border-radius:4px}
.dsh-bc-process .dsh-bc-range::-moz-range-thumb{width:16px;height:24px;border:1px solid var(--cfg-accent);border-radius:4px}
.dsh-bc-process .dsh-bc-segmented{height:auto;min-height:36px}
.dsh-bc-process .dsh-bc-segment{padding:6px 8px;line-height:18px;text-align:center}
@container better-compact (max-width:680px){.dsh-bc-process-grid{grid-template-columns:minmax(0,1fr);gap:28px}.dsh-bc-process-stage{grid-column:auto;padding:16px}.dsh-bc-process-stage:before{display:none}.dsh-bc-process-stage:after{content:'↓';position:absolute;top:100%;bottom:auto;left:50%;width:auto;height:28px;line-height:28px;border:0;background:none;transform:translateX(-50%);color:var(--cfg-muted)}.dsh-bc-stage-result:after{display:none}.dsh-bc-process .dsh-bc-mode{display:flex}.dsh-bc-process .dsh-bc-mode-head{grid-column:auto}.dsh-bc-process .dsh-bc-modes{grid-template-columns:repeat(3,minmax(0,1fr))}.dsh-bc-anatomy-part{padding:10px 6px}}
/* ── 2026 visual pass: capacity, four strategies, prompt editor ───────── */
.dsh-bc-page{max-width:1000px;gap:20px}
.dsh-bc-page-titleBlock{display:flex;flex-direction:column;gap:4px;min-width:0}
.dsh-bc-page-sub{margin:0;color:var(--cfg-muted);font-size:13px;line-height:20px}
.dsh-bc-editor{display:flex;flex-direction:column;gap:24px;min-width:0}
.dsh-bc-section{border-top:0;padding:0;gap:12px}
.dsh-bc-section-head{border-bottom:0;padding-bottom:0;align-items:baseline;margin-bottom:0}
.dsh-bc-row{border-bottom:0;padding:4px 0}
.dsh-bc-caption,.dsh-bc-help{color:var(--cfg-subtle)}
.dsh-bc-warn{margin:0;color:var(--cfg-warn);font-size:12px;line-height:18px}

.dsh-bc-modes-4{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.dsh-bc-mode{padding:12px;border-radius:var(--cfg-r-lg);gap:8px;background:var(--cfg-raised)}
.dsh-bc-mode-head{flex-wrap:wrap;row-gap:4px;align-items:center}
.dsh-bc-mode-title{font-size:13px}
.dsh-bc-mode-tag{margin-left:auto;display:inline-flex;align-items:center;min-height:20px;padding:0 7px;border:1px solid var(--cfg-control-line);border-radius:999px;color:var(--cfg-muted);font-size:10px;line-height:16px;white-space:nowrap}
.dsh-bc-mode[aria-checked=true] .dsh-bc-mode-tag{border-color:color-mix(in srgb,var(--cfg-accent) 40%,transparent);color:var(--cfg-accent-text)}
.dsh-bc-mode-description{margin:0;color:var(--cfg-muted);font-size:12px;line-height:18px;min-height:36px}
.dsh-bc-mode-caption{margin:auto 0 0;color:var(--cfg-subtle);font-size:11px;line-height:16px}
.dsh-bc-flow{display:flex;flex-direction:column;gap:4px;min-width:0;margin-top:6px}
.dsh-bc-flow-prefix{display:flex;align-items:center;justify-content:space-between;gap:6px;min-height:24px;padding:2px 7px;border:1px solid var(--cfg-line);border-radius:var(--cfg-r-sm);background:var(--cfg-sunken);color:var(--cfg-muted);font-size:10px;line-height:16px}
.dsh-bc-flow-chip{padding:0 5px;border:1px solid var(--cfg-control-line);border-radius:999px;font-size:9px;white-space:nowrap}
.dsh-bc-flow-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:4px;min-width:0}
.dsh-bc-flow-node{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:0;min-height:46px;padding:4px;border:1px solid var(--cfg-control-line);border-radius:var(--cfg-r-sm);background:var(--cfg-raised);text-align:center}
.dsh-bc-flow-node strong{font-size:10px;line-height:15px;font-weight:500;overflow-wrap:anywhere}
.dsh-bc-flow-node span{color:var(--cfg-subtle);font-size:9px;line-height:14px;overflow-wrap:anywhere}
.dsh-bc-flow-state{background:var(--cfg-accent-soft);border-color:color-mix(in srgb,var(--cfg-accent) 55%,var(--cfg-control-line))}
.dsh-bc-flow-tail{border-color:var(--cfg-accent);background:var(--cfg-accent-soft)}
.dsh-bc-flow-arrow{text-align:center;color:var(--cfg-subtle);font-size:11px;line-height:14px}
.dsh-bc-flow-result{display:flex;flex-direction:column;align-items:center;gap:1px;min-height:36px;padding:4px 6px;border:1px solid var(--cfg-accent);border-radius:var(--cfg-r-sm);background:var(--cfg-accent-soft);text-align:center}
.dsh-bc-flow-result strong{font-size:10px;line-height:15px;font-weight:500}
.dsh-bc-flow-result span{color:var(--cfg-muted);font-size:9px;line-height:14px}
.dsh-bc-strategy-note{margin-top:2px}
.dsh-bc-strategy-extra{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-cache-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.dsh-bc-cache-row .dsh-bc-setting-main{flex:1;min-width:200px}
.dsh-bc-process-path{margin:0;padding:8px 10px;border:1px solid var(--cfg-line);border-radius:var(--cfg-r-sm);background:var(--cfg-sunken);font-size:12px;line-height:20px}
.dsh-bc-process-result{margin:0;font-size:15px;line-height:24px;font-weight:500}
.dsh-bc-prompt-hint{margin:0}

.dsh-bc-capacity{display:flex;flex-direction:column;gap:12px;min-width:0;padding:14px;border:1px solid var(--cfg-line);border-radius:var(--cfg-r-lg);background:var(--cfg-raised)}
.dsh-bc-capacity-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex-wrap:wrap}
.dsh-bc-capacity-bar{height:52px;margin-top:18px;overflow:visible;border-radius:var(--cfg-r-sm);background:var(--cfg-sunken)}
.dsh-bc-capacity-bar .dsh-bc-bar-track{overflow:hidden;border-radius:var(--cfg-r-sm)}
.dsh-bc-capacity-bar .dsh-bc-bar-seg{display:flex;align-items:center;justify-content:center;min-width:0;border-right:0;color:var(--cfg-text);font-size:11px;line-height:16px;white-space:nowrap}
.dsh-bc-capacity-bar .dsh-bc-bar-seg:not(:last-child){border-right:1px solid color-mix(in srgb,var(--cfg-text) 10%,transparent)}
.dsh-bc-bar-label{min-width:0;overflow:hidden;padding:0 6px;text-overflow:ellipsis}
.dsh-bc-seg-fixed{background:color-mix(in srgb,var(--cfg-subtle) 34%,var(--cfg-raised));color:var(--cfg-muted)}
.dsh-bc-seg-compressible{background:color-mix(in srgb,var(--cfg-accent) 20%,var(--cfg-raised))}
.dsh-bc-seg-retained{background:color-mix(in srgb,var(--cfg-accent) 52%,var(--cfg-raised))}
.dsh-bc-seg-headroom{background:color-mix(in srgb,var(--cfg-subtle) 14%,var(--cfg-raised))}
.dsh-bc-seg-reserved{background:color-mix(in srgb,var(--cfg-line-3) 26%,var(--cfg-raised));color:var(--cfg-muted)}
.dsh-bc-trigger{position:absolute;top:0;bottom:0;z-index:3;border-left:2px solid var(--cfg-warn);pointer-events:none;transform:translateX(-1px)}
.dsh-bc-current-line{position:absolute;top:0;bottom:0;z-index:2;border-left:1px solid var(--cfg-text);opacity:.55;pointer-events:none}
.dsh-bc-handle{position:absolute;top:-10px;z-index:5;width:20px;height:72px;padding:0;border:0;background:transparent;cursor:ew-resize;transform:translateX(-50%);touch-action:none}
.dsh-bc-handle:disabled{opacity:.4;cursor:not-allowed}
.dsh-bc-handle-line{position:absolute;top:12px;bottom:12px;left:50%;width:2px;border-radius:1px;background:var(--cfg-accent);transform:translateX(-50%)}
.dsh-bc-handle-chip{position:absolute;bottom:calc(100% + 2px);left:50%;display:inline-flex;align-items:center;min-height:22px;padding:0 7px;border:1px solid var(--cfg-accent);border-radius:999px;background:var(--cfg-overlay);color:var(--cfg-accent-text);font-size:10px;line-height:16px;white-space:nowrap;transform:translateX(-50%);pointer-events:none}
.dsh-bc-handle[data-handle=retain] .dsh-bc-handle-chip{top:calc(100% + 2px);bottom:auto}
.dsh-bc-retain-pin{position:absolute;top:calc(100% + 2px);z-index:4;display:inline-flex;align-items:center;min-height:20px;padding:0 6px;border:1px solid var(--cfg-control-line);border-radius:999px;background:var(--cfg-overlay);color:var(--cfg-muted);font-size:10px;line-height:16px;white-space:nowrap;transform:translateX(-50%);pointer-events:none}
.dsh-bc-capacity-labels{display:flex;flex-wrap:wrap;gap:4px 16px;color:var(--cfg-subtle);font-size:11px;line-height:18px}
.dsh-bc-capacity-legend{display:flex;flex-wrap:wrap;gap:4px 14px;margin:0;padding:0;list-style:none;color:var(--cfg-subtle);font-size:11px;line-height:18px}
.dsh-bc-capacity-legend li{display:flex;align-items:center;gap:5px}
.dsh-bc-swatch-compressible{background:color-mix(in srgb,var(--cfg-accent) 20%,var(--cfg-raised))}
.dsh-bc-swatch-retained{background:color-mix(in srgb,var(--cfg-accent) 52%,var(--cfg-raised))}
.dsh-bc-swatch-headroom{background:color-mix(in srgb,var(--cfg-subtle) 14%,var(--cfg-raised))}
.dsh-bc-capacity-summary{display:flex;align-items:baseline;gap:6px 12px;flex-wrap:wrap;min-width:0;font-size:13px;line-height:20px}
.dsh-bc-capacity-summary strong{font-weight:500}
.dsh-bc-savings{display:inline-flex;align-items:center;min-height:20px;padding:0 7px;border-radius:999px;background:var(--cfg-accent-soft);color:var(--cfg-accent-text);font-size:11px;line-height:16px}
.dsh-bc-capacity-metrics{display:flex;flex-wrap:wrap;gap:2px 16px;min-width:0;padding:0;border-top:0}
.dsh-bc-capacity-metrics .dsh-bc-metric{flex-direction:row;align-items:baseline;gap:4px}
.dsh-bc-capacity-metrics .dsh-bc-metric-value{font-size:11px}
.dsh-bc-capacity-metrics .dsh-bc-caption{font-size:11px}
.dsh-bc-capacity-controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 16px;min-width:0}
.dsh-bc-capacity-controls .dsh-bc-scale{display:none}
.dsh-bc-retain-control{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-auto-row{display:flex;align-items:flex-start;gap:8px 20px;flex-wrap:wrap}
.dsh-bc-auto-row .dsh-bc-setting-main{flex:none}
.dsh-bc-auto-help{flex:1;min-width:240px;padding-top:6px}
.dsh-bc-session-row{display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap;min-width:0}
.dsh-bc-session-row .dsh-bc-session{flex:1;min-width:220px}
.dsh-bc-session-help{flex-basis:100%}

.dsh-bc-chip{display:inline-flex;align-items:center;min-height:22px;padding:0 7px;border:1px solid var(--cfg-control-line);border-radius:999px;color:var(--cfg-muted);font-size:11px;line-height:16px;white-space:nowrap}
.dsh-bc-prompt-toolbar{display:flex;flex-direction:column;gap:8px;min-width:0;padding:10px;border:1px solid var(--cfg-line);border-radius:var(--cfg-r-md);background:var(--cfg-sunken)}
.dsh-bc-prompt-group{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}
.dsh-bc-prompt-group>.dsh-bc-caption{min-width:38px}
.dsh-bc-variable{height:26px;padding:0 8px;border-color:var(--cfg-control-line);background:var(--cfg-raised);color:var(--cfg-text);font-size:11px;cursor:pointer}
.dsh-bc-variable:hover:not(:disabled){border-color:var(--cfg-accent);background:var(--cfg-accent-soft);color:var(--cfg-accent-text)}
.dsh-bc-textarea{display:block;width:100%;min-height:170px;padding:10px 12px;border:1px solid var(--cfg-control-line);border-radius:var(--cfg-r-md);background:var(--cfg-raised);color:var(--cfg-text);font:inherit;font-size:13px;line-height:1.6;resize:vertical}
.dsh-bc-textarea:hover:not(:disabled){border-color:var(--cfg-line-3)}
.dsh-bc-textarea[aria-invalid=true]{border-color:var(--cfg-danger)}
.dsh-bc-prompt-foot{display:flex;align-items:baseline;gap:4px 12px;flex-wrap:wrap;min-width:0}

@media (max-width:900px){.dsh-bc-modes-4{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container better-compact (max-width:700px){.dsh-bc-modes-4{grid-template-columns:repeat(2,minmax(0,1fr))}.dsh-bc-capacity-controls{grid-template-columns:1fr}.dsh-bc-mode{display:flex}.dsh-bc-mode-head,.dsh-bc-mode-description{grid-column:auto}}
@container better-compact (max-width:560px){.dsh-bc-modes-4{grid-template-columns:1fr}.dsh-bc-capacity{padding:12px}.dsh-bc-capacity-bar{height:46px;margin-top:30px;margin-bottom:28px}.dsh-bc-handle{width:24px}.dsh-bc-capacity-bar .dsh-bc-bar-label{display:none}.dsh-bc-handle-chip{font-size:9px;padding:0 5px}.dsh-bc-prompt-toolbar{padding:8px}.dsh-bc-textarea{min-height:200px}.dsh-bc-session-row .dsh-bc-session{min-width:0;flex-basis:100%}}

/* clearer single process, compact cards, no nested policy folds */
.dsh-bc-mode-description{min-height:0}
.dsh-bc-mode{padding:12px}
.dsh-bc-flowmap{display:flex;flex-direction:column;gap:0;min-width:0;padding:10px 14px;border:1px solid var(--cfg-line);border-radius:10px;background:var(--cfg-raised)}
.dsh-bc-step{display:grid;grid-template-columns:26px minmax(0,1fr);gap:10px;min-width:0;padding:11px 0}
.dsh-bc-step-number{display:flex;align-items:center;justify-content:center;width:24px;height:24px;border:1px solid var(--cfg-control-line);border-radius:50%;color:var(--cfg-muted);font-size:10px;line-height:16px;font-variant-numeric:tabular-nums}
.dsh-bc-step-body{min-width:0}
.dsh-bc-step-body h4{margin:0 0 4px;font-size:13px;line-height:20px;font-weight:500}
.dsh-bc-step-body p{margin:0;color:var(--cfg-muted);font-size:12px;line-height:18px}
.dsh-bc-step-body p+p{margin-top:3px}
.dsh-bc-flow-arrow{text-align:left;padding-left:10px;color:var(--cfg-subtle);font-size:12px;line-height:20px}
.dsh-bc-flowChips{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}
.dsh-bc-flowChip{display:inline-flex;align-items:baseline;gap:6px;padding:3px 8px;border:1px solid var(--cfg-control-line);border-radius:6px;background:var(--cfg-sunken);font-size:11px;line-height:18px;min-width:0}
.dsh-bc-flowChip strong{font-weight:500;color:var(--cfg-muted)}
.dsh-bc-flowChip span{color:var(--cfg-text);font-variant-numeric:tabular-nums}
.dsh-bc-flowChip[data-tone=compressible]{background:color-mix(in srgb,var(--cfg-accent) 10%,var(--cfg-raised))}
.dsh-bc-flowChip[data-tone=retained]{background:var(--cfg-accent-soft);border-color:color-mix(in srgb,var(--cfg-accent) 40%,var(--cfg-control-line))}
.dsh-bc-custom-model{margin-top:8px;padding:10px;border:1px solid var(--cfg-line);border-radius:8px;background:var(--cfg-sunken)}
.dsh-bc-policy-card{margin-top:8px;padding:10px;border:1px solid var(--cfg-line);border-radius:8px;background:var(--cfg-raised)}
.dsh-bc-policy-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;min-width:0}
.dsh-bc-policy-head>span{min-width:0;overflow-wrap:anywhere;font-size:12px;line-height:18px}
.dsh-bc-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px 16px;min-width:0;padding:8px 0}
.dsh-bc-facts .dsh-bc-metric{gap:2px}
.dsh-bc-facts .dsh-bc-metric-value{font-size:12px}
.dsh-bc-prompt-toolbar{flex-direction:row;flex-wrap:wrap;align-items:center;gap:6px;padding:8px}
.dsh-bc-prompt-toolbar .dsh-bc-caption{flex-basis:100%}
@container better-compact (max-width:700px){.dsh-bc-facts{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container better-compact (max-width:560px){.dsh-bc-facts{grid-template-columns:1fr}.dsh-bc-flowmap{padding:8px 10px}.dsh-bc-step{grid-template-columns:22px minmax(0,1fr);gap:8px;padding:9px 0}.dsh-bc-step-number{width:20px;height:20px;font-size:9px}.dsh-bc-prompt-toolbar{padding:8px}}

/* single bold SVG process */
.dsh-bc-strategy-svg{display:block;width:100%;max-width:560px;height:auto;margin:10px auto 0;color:var(--cfg-muted);overflow:visible}
.dsh-bc-strategy-svg text{fill:currentColor;font-family:inherit}
.dsh-bc-svg-node-title{font-size:15px;font-weight:500;fill:var(--cfg-text)}
.dsh-bc-svg-node-sub{font-size:12px;fill:var(--cfg-subtle)}
.dsh-bc-svg-note{font-size:12px;fill:var(--cfg-subtle)}
.dsh-bc-strategy-svg .dsh-bc-node{fill:var(--cfg-sunken);stroke:var(--cfg-control-line);stroke-width:1}
.dsh-bc-strategy-svg .dsh-bc-node-strong{fill:var(--cfg-raised);stroke:var(--cfg-line-3)}
.dsh-bc-strategy-svg .dsh-bc-node-accent{fill:var(--cfg-accent-soft);stroke:var(--cfg-accent)}.dsh-bc-svg-tag{fill:var(--cfg-sunken);stroke:var(--cfg-control-line);stroke-width:1}
.dsh-bc-svg-tag-accent{fill:var(--cfg-accent-soft);stroke:var(--cfg-accent)}
.dsh-bc-svg-tag-text{font-size:10px;fill:var(--cfg-muted)}
.dsh-bc-svg-tag-text-accent{fill:var(--cfg-accent-text)}

.dsh-bc-strategy-svg .dsh-bc-node-dashed{stroke:var(--cfg-line-3)}
.dsh-bc-strategy-svg .dsh-bc-edge{stroke:var(--cfg-subtle);stroke-width:1;fill:none}
.dsh-bc-strategy-layout{display:grid;grid-template-columns:minmax(230px,.8fr) minmax(0,1.2fr);gap:24px;align-items:start;min-width:0}
.dsh-bc-strategy-choice,.dsh-bc-strategy-figure{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-bc-strategy-layout .dsh-bc-modes{grid-template-columns:minmax(0,1fr)}
.dsh-bc-strategy-figure .dsh-bc-strategy-svg{max-width:400px;margin:0}
@container better-compact (max-width:680px){.dsh-bc-strategy-layout{grid-template-columns:1fr}.dsh-bc-strategy-layout .dsh-bc-modes{grid-template-columns:repeat(2,minmax(0,1fr))}.dsh-bc-strategy-figure .dsh-bc-strategy-svg{max-width:560px}}
@container better-compact (max-width:560px){.dsh-bc-strategy-layout .dsh-bc-modes{grid-template-columns:1fr}}


@container better-compact (max-width:560px){.dsh-bc-svg-node-title{font-size:16px}.dsh-bc-svg-node-sub{font-size:13px}.dsh-bc-svg-note{font-size:13px}}

`
