import View from './common/view';

function postMessage(event, params = {}) {
	console.log('Posting message', event, params);
}

window.createView = (options) => {
	window._view = new View({
		...options,
		container: document.getElementById('view'),
		// TODO: Implement a more efficient way to transfer large files
		data: {
			...options.data,
			buf: new Uint8Array(options.buf)
		},
		onSaveAnnotations: (annotations) => {
			postMessage('onSaveAnnotations', { annotations });
		},
		onSetOutline: (outline) => {
			postMessage('onSetOutline', { outline });
		},
		onSelectAnnotations: (ids) => {
			postMessage('onSelectAnnotations', { ids });
		},
		onSetSelectionPopup: (params) => {
			postMessage('onSetSelectionPopup', params);
		},
		onSetAnnotationPopup: (params) => {
			postMessage('onSetAnnotationPopup', params);
		},
		onOpenLink: (url) => {
			postMessage('onOpenLink', { url });
		},
		onFindResult: (result) => {
			postMessage('onFindResult', result);
		},
		onChangeViewState: (state) => {
			postMessage('onChangeViewState', { state });
		},
		onChangeViewStats: (stats) => {
			postMessage('onChangeViewStats', { stats });
		},
		onTranslate: async (text) => {
			// 发送翻译请求给Android原生应用处理
			postMessage('onTranslateRequest', { text });

			// 等待Android原生应用返回翻译结果
			// 在实际应用中，应通过JavaScript接口接收Android返回的翻译结果
			// 这里仅作为示例，返回固定结果
			await new Promise(resolve => setTimeout(resolve, 800));
			return `[Android Translation]\n${text}\n\n中文翻译示例`;
		}
	});
};

// Notify when iframe is loaded
postMessage('onInitialized');
