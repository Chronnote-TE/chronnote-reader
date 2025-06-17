import Reader from './common/reader';
import pdf from '../demo/pdf';
import epub from '../demo/epub';
import snapshot from '../demo/snapshot';
import './fluent';

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
		readOnly: false,
		data: {
			buf: new Uint8Array(await res.arrayBuffer()),
			url: new URL('/', window.location).toString()
		},
		// rtl: true,
		annotations: demo.annotations,
		colorScheme: 'dark',
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
		onAskAI: function (text) {
			console.log('===== onAskAI 被调用！=====');
			console.log('传入的文本:', text);

			// 创建一个弹窗显示选中的文本
			const isDarkMode = document.documentElement.getAttribute('data-color-scheme') === 'dark';

			// 创建一个预览元素
			const preview = document.createElement('div');
			preview.style.position = 'fixed';
			preview.style.top = '50%';
			preview.style.left = '50%';
			preview.style.transform = 'translate(-50%, -50%) scale(0.95)';
			preview.style.padding = '20px';
			preview.style.background = isDarkMode ? '#2b2a33' : 'white';
			preview.style.color = isDarkMode ? '#eee' : '#333';
			preview.style.boxShadow = isDarkMode
				? '0 4px 24px rgba(0, 0, 0, 0.5)'
				: '0 4px 24px rgba(0, 0, 0, 0.2)';
			preview.style.borderRadius = '12px';
			preview.style.zIndex = '9999';
			preview.style.display = 'flex';
			preview.style.flexDirection = 'column';
			preview.style.alignItems = 'center';
			preview.style.gap = '16px';
			preview.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
			preview.style.border = isDarkMode ? '1px solid #444' : '1px solid rgba(0,0,0,0.1)';
			preview.style.maxWidth = '600px';
			preview.style.width = '80%';
			preview.style.opacity = '0';

			// 添加标题
			const title = document.createElement('div');
			title.textContent = 'AI 分析';
			title.style.fontWeight = 'bold';
			title.style.fontSize = '18px';
			title.style.marginBottom = '8px';
			title.style.width = '100%';
			title.style.textAlign = 'center';

			// 添加内容区域
			const content = document.createElement('div');
			content.style.width = '100%';
			content.style.padding = '16px';
			content.style.background = isDarkMode ? '#1c1b22' : '#f9f9f9';
			content.style.borderRadius = '8px';
			content.style.maxHeight = '300px';
			content.style.overflowY = 'auto';
			content.style.fontSize = '14px';
			content.style.lineHeight = '1.6';
			content.style.whiteSpace = 'pre-wrap';
			content.style.wordBreak = 'break-word';

			// 显示思考中...
			content.textContent = "AI 思考中...";

			// 模拟 AI 响应
			setTimeout(() => {
				content.textContent = `您选择的文本：\n\n"${text}"\n\n分析结果：\n这段文本包含了重要的信息，可以从以下几个方面理解：\n\n1. 主要观点：...\n2. 关键信息：...\n3. 背景知识：...\n\n这是一个模拟的 AI 分析结果，在实际应用中应替换为真实 AI API 的响应。`;
			}, 1500);

			// 添加操作按钮
			const actions = document.createElement('div');
			actions.style.display = 'flex';
			actions.style.gap = '12px';
			actions.style.marginTop = '8px';
			actions.style.width = '100%';
			actions.style.justifyContent = 'center';

			// 关闭按钮
			const closeBtn = document.createElement('button');
			closeBtn.textContent = '关闭';
			closeBtn.style.padding = '8px 24px';
			closeBtn.style.background = isDarkMode ? '#444' : '#f5f5f5';
			closeBtn.style.color = isDarkMode ? '#eee' : '#333';
			closeBtn.style.border = isDarkMode ? '1px solid #555' : '1px solid #ddd';
			closeBtn.style.borderRadius = '6px';
			closeBtn.style.cursor = 'pointer';
			closeBtn.style.transition = 'all 0.2s ease';
			closeBtn.style.fontSize = '14px';
			closeBtn.onmouseover = () => {
				closeBtn.style.background = isDarkMode ? '#555' : '#e8e8e8';
			};
			closeBtn.onmouseout = () => {
				closeBtn.style.background = isDarkMode ? '#444' : '#f5f5f5';
			};
			closeBtn.onclick = () => {
				// 添加淡出效果
				preview.style.opacity = '0';
				preview.style.transform = 'translate(-50%, -50%) scale(0.95)';

				// 等待动画完成后移除
				setTimeout(() => {
					if (document.body.contains(preview)) {
						document.body.removeChild(preview);
					}
				}, 300);
			};

			// 添加按钮到操作区
			actions.appendChild(closeBtn);

			// 添加元素到预览
			preview.appendChild(title);
			preview.appendChild(content);
			preview.appendChild(actions);

			// 添加预览到页面
			document.body.appendChild(preview);

			// 触发淡入效果
			setTimeout(() => {
				preview.style.opacity = '1';
				preview.style.transform = 'translate(-50%, -50%) scale(1)';
			}, 10);

			return "AI 分析已完成";
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
		onToggleToolbar(visible) {
			console.log('Toolbar visibility changed:', visible);
			// Here you can implement additional logic when toolbar visibility changes
			// For example, save the state to localStorage or notify other components
		},
		onPageClick(pageNumber) {
			console.log('Page clicked:', pageNumber);
			// 这里可以添加更多页面点击的处理逻辑
		},
		onScreenshot(imageData, pageIndex, rect) {
			console.log('Screenshot captured:', { pageIndex, rect });

			// 检测是否为暗色模式
			const isDarkMode = document.documentElement.getAttribute('data-color-scheme') === 'dark';

			// 创建一个临时链接来下载截图
			const link = document.createElement('a');
			link.href = imageData;
			link.download = `screenshot-page-${pageIndex + 1}.png`;

			// 创建一个预览元素
			const preview = document.createElement('div');
			preview.style.position = 'fixed';
			preview.style.top = '20px';
			preview.style.right = '20px';
			preview.style.padding = '16px';
			preview.style.background = isDarkMode ? '#2b2a33' : 'white';
			preview.style.color = isDarkMode ? '#eee' : '#333';
			preview.style.boxShadow = isDarkMode
				? '0 4px 16px rgba(0, 0, 0, 0.4)'
				: '0 4px 16px rgba(0, 0, 0, 0.15)';
			preview.style.borderRadius = '12px';
			preview.style.zIndex = '9999';
			preview.style.display = 'flex';
			preview.style.flexDirection = 'column';
			preview.style.alignItems = 'center';
			preview.style.gap = '12px';
			preview.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
			preview.style.border = isDarkMode ? '1px solid #444' : '1px solid rgba(0,0,0,0.1)';

			// 添加标题
			const title = document.createElement('div');
			title.textContent = `截图 - 第 ${pageIndex + 1} 页`;
			title.style.fontWeight = 'bold';
			title.style.fontSize = '14px';
			title.style.marginBottom = '4px';

			// 添加预览图像
			const img = document.createElement('img');
			img.src = imageData;
			img.style.maxWidth = '320px';
			img.style.maxHeight = '240px';
			img.style.objectFit = 'contain';
			img.style.border = isDarkMode ? '1px solid #444' : '1px solid #eee';
			img.style.borderRadius = '6px';
			img.style.backgroundColor = isDarkMode ? '#1c1b22' : '#f9f9f9';
			img.style.padding = '4px';

			// 添加操作按钮
			const actions = document.createElement('div');
			actions.style.display = 'flex';
			actions.style.gap = '12px';
			actions.style.marginTop = '4px';

			// 下载按钮
			const downloadBtn = document.createElement('button');
			downloadBtn.textContent = '下载';
			downloadBtn.style.padding = '8px 16px';
			downloadBtn.style.background = isDarkMode ? '#0df' : '#0a6cf5';
			downloadBtn.style.color = 'white';
			downloadBtn.style.border = 'none';
			downloadBtn.style.borderRadius = '6px';
			downloadBtn.style.cursor = 'pointer';
			downloadBtn.style.fontWeight = '500';
			downloadBtn.style.transition = 'all 0.2s ease';
			downloadBtn.onmouseover = () => {
				downloadBtn.style.transform = 'translateY(-1px)';
				downloadBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
			};
			downloadBtn.onmouseout = () => {
				downloadBtn.style.transform = 'translateY(0)';
				downloadBtn.style.boxShadow = 'none';
			};
			downloadBtn.onclick = () => {
				link.click();
				// 显示下载成功提示
				const toast = document.createElement('div');
				toast.textContent = '截图已保存';
				toast.style.position = 'fixed';
				toast.style.bottom = '20px';
				toast.style.left = '50%';
				toast.style.transform = 'translateX(-50%)';
				toast.style.padding = '8px 16px';
				toast.style.background = isDarkMode ? '#333' : '#333';
				toast.style.color = 'white';
				toast.style.borderRadius = '20px';
				toast.style.zIndex = '10000';
				toast.style.opacity = '0';
				toast.style.transition = 'opacity 0.3s ease';
				document.body.appendChild(toast);

				// 淡入
				setTimeout(() => {
					toast.style.opacity = '1';
				}, 10);

				// 2秒后淡出并移除
				setTimeout(() => {
					toast.style.opacity = '0';
					setTimeout(() => {
						if (document.body.contains(toast)) {
							document.body.removeChild(toast);
						}
					}, 300);
				}, 2000);
			};

			// 关闭按钮
			const closeBtn = document.createElement('button');
			closeBtn.textContent = '关闭';
			closeBtn.style.padding = '8px 16px';
			closeBtn.style.background = isDarkMode ? '#444' : '#f5f5f5';
			closeBtn.style.color = isDarkMode ? '#eee' : '#333';
			closeBtn.style.border = isDarkMode ? '1px solid #555' : '1px solid #ddd';
			closeBtn.style.borderRadius = '6px';
			closeBtn.style.cursor = 'pointer';
			closeBtn.style.transition = 'all 0.2s ease';
			closeBtn.onmouseover = () => {
				closeBtn.style.background = isDarkMode ? '#555' : '#e8e8e8';
			};
			closeBtn.onmouseout = () => {
				closeBtn.style.background = isDarkMode ? '#444' : '#f5f5f5';
			};
			closeBtn.onclick = () => {
				// 添加淡出效果
				preview.style.opacity = '0';
				preview.style.transform = 'scale(0.95)';

				// 等待动画完成后移除
				setTimeout(() => {
					if (document.body.contains(preview)) {
						document.body.removeChild(preview);
					}
				}, 300);
			};

			// 添加按钮到操作区
			actions.appendChild(downloadBtn);
			actions.appendChild(closeBtn);

			// 添加元素到预览
			preview.appendChild(title);
			preview.appendChild(img);
			preview.appendChild(actions);

			// 添加预览到页面，并添加淡入效果
			preview.style.opacity = '0';
			preview.style.transform = 'scale(0.95)';
			document.body.appendChild(preview);

			// 触发淡入效果
			setTimeout(() => {
				preview.style.opacity = '1';
				preview.style.transform = 'scale(1)';
			}, 10);

			// 8秒后自动关闭预览
			setTimeout(() => {
				if (document.body.contains(preview)) {
					// 添加淡出效果
					preview.style.opacity = '0';
					preview.style.transform = 'scale(0.95)';

					// 等待动画完成后移除
					setTimeout(() => {
						if (document.body.contains(preview)) {
							document.body.removeChild(preview);
						}
					}, 300);
				}
			}, 8000);
		}
	});
	reader.enableAddToNote(true);
	window._reader = reader;
	await reader.initializedPromise;

	// 示例：外部控制工具栏的显示/隐藏
	// 3秒后隐藏工具栏
	setTimeout(() => {
		console.log('Auto-hiding toolbar...');
		reader.toggleToolbar(false);
	}, 3000);

	// 6秒后重新显示工具栏
	setTimeout(() => {
		console.log('Auto-showing toolbar...');
		reader.toggleToolbar(true);
	}, 6000);

	// 暴露全局方法供开发者在控制台测试
	window.toggleToolbar = reader.toggleToolbar.bind(reader);

	window.reader = reader;
}

createReader();
