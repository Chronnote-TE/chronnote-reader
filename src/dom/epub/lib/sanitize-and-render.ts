import parser from "postcss-selector-parser";

export const SANITIZER_REPLACE_TAGS = new Set(['html', 'head', 'body', 'base', 'meta']);

export async function sanitizeAndRender(xhtml: string, options: {
	container: Element,
	styleScoper: StyleScoper,
}): Promise<HTMLElement> {
	let { container, styleScoper } = options;

	let doc = container.ownerDocument;
	let sectionDoc = new DOMParser().parseFromString(xhtml, 'application/xhtml+xml');

	if (sectionDoc.getElementsByTagName('parsererror').length) {
		throw new Error('Invalid XHTML');
	}

	let walker = sectionDoc.createTreeWalker(sectionDoc, NodeFilter.SHOW_ELEMENT);
	let toRemove = [];

	let elem: Element | null = null;
	// eslint-disable-next-line no-unmodified-loop-condition
	while ((elem = walker.nextNode() as Element)) {
		let localName = elem.localName;
		switch (localName) {
			case 'style':
				container.classList.add(
					await styleScoper.add(elem.innerHTML || '')
				);
				toRemove.push(elem);
				break;
			case 'link': {
				let link = elem as HTMLLinkElement;
				if (link.relList.contains('stylesheet')) {
					try {
						container.classList.add(
							await styleScoper.addByURL(link.href)
						);
					}
					catch (e) {
						console.error(e);
					}
					toRemove.push(elem);
				}
				break;
			}
			case 'title':
				toRemove.push(elem);
				break;
			case 'object':
				if (elem.hasAttribute('data')
						&& elem.getAttribute("type")?.startsWith("image/")) {
					// <object data="..."> apparently can't display blob: SVGs in Firefox
					let img = doc.createElement('img');
					for (let attr of elem.getAttributeNames()) {
						if (attr === 'data' || attr === 'title') {
							continue;
						}
						img.setAttribute(attr, elem.getAttribute(attr)!);
					}
					img.src = elem.getAttribute('data')!;
					img.alt = elem.getAttribute('title') || elem.textContent || '';
					elem.replaceWith(img);
					walker.currentNode = img;
				}
				break;
			case 'img': {
				let img = elem as HTMLImageElement;
				img.loading = 'eager';
				img.decoding = 'sync';
				if (!img.closest('a')) {
					// TODO: Localize? No access to strings here
					img.setAttribute('aria-label', 'Zoom In');
					img.classList.add('clickable-image');
				}
				break;
			}
			default:
				if (SANITIZER_REPLACE_TAGS.has(localName)) {
					let newElem = doc.createElement('replaced-' + localName);
					for (let attr of elem.getAttributeNames()) {
						newElem.setAttribute(attr, elem.getAttribute(attr)!);
					}
					newElem.append(...elem.childNodes);
					elem.replaceWith(newElem);
					walker.currentNode = newElem;
				}
				break;
		}
	}

	for (let elem of toRemove) {
		elem.remove();
	}

	container.append(...sectionDoc.childNodes);

	// Add classes to elements that emulate <table>, <sup>, and <sub>
	for (let selector of styleScoper.tagEmulatingSelectors.table) {
		try {
			for (let table of Array.from(container.querySelectorAll(selector))) {
				table.classList.add('table-like');
				if (!table.role) {
					table.role = 'table';
				}
			}
		}
		catch (e) {
			// Ignore
		}
	}
	for (let selector of styleScoper.tagEmulatingSelectors.supSub) {
		try {
			for (let elem of Array.from(container.querySelectorAll(selector))) {
				elem.classList.add('sup-sub-like');
			}
		}
		catch (e) {
			// Ignore
		}
	}

	return container.querySelector('replaced-body') as HTMLElement;
}

export class StyleScoper {
	tagEmulatingSelectors = {
		table: new Set<string>(['table', 'mtable', 'pre']),
		supSub: new Set<string>(['sup', 'sub']),
	};

	private _document: Document;

	private _sheets = new Map<string, SheetMetadata>();

	private _textCache = new Map<string, string>();

	constructor(document: Document) {
		this._document = document;
	}

	/**
	 * @param css CSS stylesheet code
	 * @return A class to add to the scope element
	 */
	async add(css: string): Promise<string> {
		if (this._sheets.has(css)) {
			return this._sheets.get(css)!.scopeClass;
		}
		let scopeClass = `__scope_${this._sheets.size}`;
		this._sheets.set(css, { scopeClass });

		let cssModified = rewriteEPUBProperties(css);

		let sheet;
		let added = false;
		try {
			sheet = new this._document.defaultView!.CSSStyleSheet();
			await sheet.replace(cssModified);
		}
		catch (e) {
			// Constructor not available
			let style = this._document.createElement('style');
			style.innerHTML = cssModified;
			if (style.sheet) {
				sheet = style.sheet;
			}
			else {
				let promise = new Promise<CSSStyleSheet>(
					resolve => style.addEventListener('load', () => resolve(style.sheet!))
				);
				this._document.head.append(style);
				sheet = await promise;
				added = true;
			}
		}

		this._visitStyleSheet(sheet, scopeClass);

		if (!added) {
			this._document.adoptedStyleSheets.push(sheet);
		}

		// Overwrite previous value now that the sheet is loaded
		this._sheets.set(css, { sheet, scopeClass });
		return scopeClass;
	}

	/**
	 * @param url The URL of a CSS stylesheet
	 * @return A class to add to the scope element
	 */
	async addByURL(url: string): Promise<string> {
		let css;
		if (this._textCache.has(url)) {
			css = this._textCache.get(url)!;
		}
		else {
			css = await (await fetch(url)).text();
			this._textCache.set(url, css);
		}
		return this.add(css);
	}

	private _visitStyleSheet(sheet: CSSStyleSheet, scopeClass: string) {
		for (let rule of sheet.cssRules) {
			this._visitRule(rule, scopeClass);
		}
	}

	private _visitRule(rule: CSSRule, scopeClass: string) {
		if (rule.constructor.name === 'CSSStyleRule') {
			let styleRule = rule as CSSStyleRule;
			styleRule.selectorText = parser((selectors) => {
				selectors.each((selector) => {
					selector.replaceWith(
						parser.selector({
							value: '',
							nodes: [
								parser.className({ value: scopeClass }),
								parser.combinator({ value: ' ' }),
								parser.selector({
									...selector,
									nodes: selector.nodes.map((node) => {
										if (node.type === 'tag' && SANITIZER_REPLACE_TAGS.has(node.value.toLowerCase())) {
											return parser.tag({
												...node,
												value: 'replaced-' + node.value
											});
										}
										return node;
									})
								})
							],
							spaces: selector.spaces
						})
					);
				});
			}).processSync(styleRule.selectorText);

			// Keep track of selectors that emulate <table>, <sup>, and <sub>, because we want to add classes
			// to matching elements in sanitizeAndRender()
			if (styleRule.style.display === 'table' || styleRule.style.display === 'inline-table') {
				this.tagEmulatingSelectors.table.add(styleRule.selectorText);
			}
			if (styleRule.style.verticalAlign === 'super' || styleRule.style.verticalAlign === 'sub') {
				this.tagEmulatingSelectors.supSub.add(styleRule.selectorText);
			}

			// If this rule sets a monospace font, make it !important so that it overrides the default content font
			if (styleRule.style.fontFamily && /\bmono(space)?\b/i.test(styleRule.style.fontFamily)) {
				styleRule.style.setProperty('font-family', styleRule.style.fontFamily, 'important');
			}

			// If this rule sets a font-size, rewrite it to be relative
			if (styleRule.style.fontSize) {
				styleRule.style.fontSize = rewriteFontSize(styleRule.style.fontSize);
			}
		}
		else if (rule.constructor.name === 'CSSImportRule') {
			let importRule = rule as CSSImportRule;
			this._visitStyleSheet(importRule.styleSheet, scopeClass);
		}

		// If this rule contains child rules, visit each of them
		if ('cssRules' in rule) {
			for (let childRule of rule.cssRules as CSSRuleList) {
				this._visitRule(childRule, scopeClass);
			}
		}
	}
}

// Mappings based on https://github.com/JayPanoz/postcss-epub-interceptor/blob/1aca86e1f4f996f9ec3a8735bd70e673f3e0f504/index.js
const EPUB_CSS_REPLACEMENTS: [RegExp, string][] = Object.entries({
	'text-transform': ['text-transform', {
		'-epub-fullwidth': 'full-width'
	}],
	'-epub-hyphens': ['hyphens', {}],
	'-epub-line-break': ['line-break', {}],
	'-epub-text-align-last': ['text-align-last', {}],
	'-epub-word-break': ['word-break', {}],
	'-epub-text-emphasis': ['text-emphasis', {}],
	'-epub-text-emphasis-color': ['text-emphasis-color', {}],
	'-epub-text-emphasis-style': ['text-emphasis-style', {}],
	'-epub-text-emphasis-position': ['text-emphasis-position', {}],
	'-epub-text-underline-position': ['text-underline-position', {
		alphabetic: 'auto'
	}],
	'-epub-ruby-position': ['ruby-position', {}],
	'-epub-writing-mode': ['writing-mode', {}],
	'-epub-text-orientation': ['text-orientation', {
		'vertical-right': 'mixed',
		'sideways-right': 'sideways',
		'rotate-right': 'sideways',
		'rotate-normal': 'sideways'
	}],
	'-epub-text-combine': ['text-combine-upright', {
		horizontal: 'all'
	}],
	'-epub-text-combine-horizontal': ['text-combine-upright', {}],
	'-epub-text-combine-upright': ['text-combine-upright', {}],
}).flatMap(([rule, [newRule, valueMapping]]) => {
	// That's right: we're parsing CSS with regular expressions
	// This is unlikely to cause false positives
	let ruleRe = new RegExp(`(^|[^a-zA-Z-])${rule}(\\s*:)`, 'gi');
	let ruleReplacement = '$1' + newRule + '$2';
	let valueReplacements: [RegExp, string][] = Object.entries(valueMapping).map(([value, newValue]) => {
		let valueRe = new RegExp(`((?:^|[^a-zA-Z-])${newRule}\\s*:\\s*)${value}($|[^a-zA-Z-])`, 'gi');
		return [valueRe, '$1' + newValue + '$2'];
	});
	return [[ruleRe, ruleReplacement], ...valueReplacements];
});

function rewriteEPUBProperties(css: string): string {
	for (let [re, replacement] of EPUB_CSS_REPLACEMENTS) {
		css = css.replace(re, replacement);
	}
	return css;
}

// Mappings and routine based on
// https://github.com/kovidgoyal/calibre/blob/d1bbe63eb10cbf0abbe56a06fce92ad220de03b0/src/calibre/srv/fast_css_transform.cpp#L191-L210
// Copyright (C) 2008-2024 Kovid Goyal (GPLv3)

/* eslint-disable quote-props */
const BASE_FONT_SIZE = 13;
const DPI = 96;
const PT_TO_PX = DPI / 72;
const PT_TO_REM = PT_TO_PX / BASE_FONT_SIZE;

const FONT_SIZE_REPLACEMENTS: Record<string, string> = {
	'xx-small': '0.5rem',
	'x-small': '0.625rem',
	'small': '0.75rem',
	'medium': '1rem',
	'large': '1.125rem',
	'x-large': '1.5rem',
	'xx-large': '2rem',
	'xxx-large': '2.55rem',
};

const FONT_SIZE_UNITS: Record<string, number> = {
	'mm': 2.8346456693,
	'cm': 28.346456693,
	'in': 72,
	'pc': 12,
	'q': 0.708661417325,
	'pt': 1,
};
/* eslint-enable quote-props */

function rewriteFontSize(fontSize: string): string {
	if (fontSize.toLowerCase() in FONT_SIZE_REPLACEMENTS) {
		return FONT_SIZE_REPLACEMENTS[fontSize.toLowerCase()];
	}

	let match = fontSize.match(/^([0-9.]+)([a-zA-Z]+)$/);
	if (match) {
		let value = parseFloat(match[1]);
		let unit = match[2].toLowerCase();
		if (unit === 'px') {
			return value / BASE_FONT_SIZE + 'rem';
		}
		else if (unit in FONT_SIZE_UNITS) {
			let factor = FONT_SIZE_UNITS[unit];
			return value * factor * PT_TO_REM + 'rem';
		}
	}

	return fontSize;
}

type SheetMetadata = {
	sheet?: CSSStyleSheet;
	scopeClass: string;
};
