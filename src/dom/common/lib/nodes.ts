export function getAllTextNodes(root: Node): Text[] {
	let nodeIterator = root.ownerDocument!.createNodeIterator(root, NodeFilter.SHOW_TEXT);
	let nodes = [];
	let next = null;
	while ((next = nodeIterator.nextNode())) {
		nodes.push(next as Text);
	}
	return nodes;
}

export function getVisibleTextNodes(root: Node): Text[] {
	let range = root.ownerDocument!.createRange();
	return getAllTextNodes(root).filter((node) => {
		range.selectNodeContents(node);
		let rect = range.getBoundingClientRect();
		return rect.width && rect.height;
	});
}

export function getPotentiallyVisibleTextNodes(root: Node): Text[] {
	return getAllTextNodes(root).filter((node) => {
		let elem = closestElement(node);
		if (!elem) {
			return false;
		}
		return !elem.closest('style, script');
	});
}

export function isElement(node: Node): node is Element {
	return node.nodeType === Node.ELEMENT_NODE;
}

export function closestElement(node: Node): Element | null {
	let currentNode: Node | null = node;
	while (currentNode && !isElement(currentNode)) {
		currentNode = currentNode.parentNode;
	}
	return currentNode;
}

const BLOCK_DISPLAYS = new Set(['block', 'list-item', 'table-cell', 'table', 'flex']);
const BLOCK_ELEMENTS = new Set(['DIV', 'P', 'LI', 'OL', 'UL', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH', 'DL', 'DT', 'DD', 'FORM', 'FIELDSET', 'SECTION', 'HEADER', 'FOOTER', 'ASIDE', 'NAV', 'ARTICLE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'FOOTER', 'ASIDE', 'NAV', 'ARTICLE']);

export function getContainingBlock(element: Element): Element | null {
	let el: Element | null = element;
	while (el) {
		let display = getComputedStyle(el).display;
		if (display) {
			if (BLOCK_DISPLAYS.has(display)) {
				return el;
			}
		}
		else if (BLOCK_ELEMENTS.has(el.tagName)) {
			return el;
		}
		el = el.parentElement;
	}
	return null;
}

export function iterateWalker(walker: TreeWalker | NodeIterator): Iterable<Node> {
	return {
		[Symbol.iterator]: function* () {
			let node: Node | null;
			while ((node = walker.nextNode())) {
				yield node;
			}
		}
	};
}
