import Reader from './common/reader';
import strings from '../src/zh-cn.strings';
import pdf from '../demo/pdf';
import epub from '../demo/epub';
import snapshot from '../demo/snapshot';

window.dev = true;

async function createReader() {
	if (window._reader) {
		throw new Error('Reader is already initialized');
	}
	let queryString = window.location.search;
	let urlParams = new URLSearchParams(queryString);
	let type = urlParams.get('type') || 'pdf';
	let demo;
	if (type === 'pdf') {
		demo = pdf;
	}
	else if (type === 'epub') {
		demo = epub;
	}
	else if (type === 'snapshot') {
		demo = snapshot;
	}
	let res = await fetch(demo.fileName);
	let reader = new Reader({
		type,
		localizedStrings: strings,
		readOnly: false,
		data: {
			buf: new Uint8Array(await res.arrayBuffer()),
			url: new URL('/', window.location).toString()
		},
		// rtl: true,
		annotations: demo.annotations,
		primaryViewState: demo.state,
		sidebarWidth: 240,
		bottomPlaceholderHeight: null,
		toolbarPlaceholderWidth: 0,
		authorName: 'John',
		showAnnotations: true,
		// platform: 'web',
		// password: 'test',
		onOpenContextMenu(params) {
			console.log('onOpenContextMenu', params);
			this.openContextMenu(params);
		},
		onAddToNote() {
			alert('Add annotations to the current note');
		},
		onSaveAnnotations: async function (annotations) {
			console.log('Save annotations', annotations);
		},
		onClick() {
			console.log("click")
		},
		onDeleteAnnotations: function (ids) {
			console.log('Delete annotations', JSON.stringify(ids));
		},
		onChangeViewState: function (state, primary) {

		},
		onOpenTagsPopup(annotationID, left, top) {
			alert(`Opening Zotero tagbox popup for id: ${annotationID}, left: ${left}, top: ${top}`);
		},
		onClosePopup(data) {
			console.log('onClosePopup', data);
		},
		onOpenLink(url) {
			alert('Navigating to an external link: ' + url);
		},
		onToggleSidebar: (open) => {
			console.log('Sidebar toggled', open);
		},
		onChangeSidebarWidth(width) {
			console.log('Sidebar width changed', width);
		},
		onSetDataTransferAnnotations(dataTransfer, annotations, fromText) {
			console.log('Set formatted dataTransfer annotations', dataTransfer, annotations, fromText);
		},
		onConfirm(title, text, _confirmationButtonTitle) {
			return window.confirm(text);
		},
		onRotatePages(pageIndexes, degrees) {
			console.log('Rotating pages', pageIndexes, degrees);
		},
		onDeletePages(pageIndexes, degrees) {
			console.log('Deleting pages', pageIndexes, degrees);
		},
		onToggleContextPane() {
			console.log('Toggle context pane');
		},
		onMenuButtonClick() {
			console.log('Menu button clicked');
		},
		onTextSelectionAnnotationModeChange(mode) {
			console.log(`Change text selection annotation mode to '${mode}'`);
		},
		onSaveCustomThemes(customThemes) {
			console.log('Save custom themes', customThemes);
		},
		onTranslate: function (text) {
			// 这是一个修改过的非异步函数版本，尝试修复可能的 Promise 问题
			console.log('===== onTranslate 被调用！=====');
			console.log('传入的文本:', text);

			// 立即返回一个字符串而不是使用异步
			return `Translation:\n${text}\n\n这是选中文本的模拟翻译效果，在实际应用中应替换为真实翻译API。`;
		},
		onClickSplit() {
			console.log('Split view button clicked');
			// Here you can implement split view functionality
		},
		onClickVerticalSplit() {
			console.log('Vertical split view button clicked');
			// Here you can implement vertical split view functionality
		},
		onClickClose() {
			console.log('Close button clicked');
			// Here you can implement close functionality, e.g., close the reader
			if (window.confirm('确定要关闭阅读器吗？')) {
				console.log('Reader closing confirmed');
				// Add actual close logic here if needed
			}
		},
		onPageClick(pageNumber) {
			console.log('Page clicked:', pageNumber);
			// 这里可以添加更多页面点击的处理逻辑
		}
	});
	reader.enableAddToNote(true);
	window._reader = reader;
	await reader.initializedPromise;
}

createReader();
