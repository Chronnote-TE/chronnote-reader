import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '@fluent/react';
import { ANNOTATION_COLORS } from '../../defines';
import CustomSections from '../common/custom-sections';
import ViewPopup from './common/view-popup';

import { IconColor16 } from '../common/icons';

import IconHighlight from '../../../../res/icons/16/annotate-highlight.svg';
import IconUnderline from '../../../../res/icons/16/annotate-underline.svg';
import { Copy, Sparkles } from 'lucide-react';

function SelectionPopup(props) {
	const { l10n } = useLocalization();
	const [translationVisible, setTranslationVisible] = useState(false);
	const [translation, setTranslation] = useState('');
	const [translating, setTranslating] = useState(false);

	function handleColorPick(color) {
		let type = props.textSelectionAnnotationMode;
		props.onAddAnnotation({ ...props.params.annotation, type, color });
	}

	function handleAddToNote() {
		props.onAddToNote([props.params.annotation]);
	}

	function handleDelete() {
		// Get the annotation ID and call the delete function
		if (props.params.annotation && props.params.annotation.id) {
			props.onDeleteAnnotation([props.params.annotation.id]);
		}
	}

	function handleAskAI() {
		// 直接调用AI回调函数，不显示面板
		console.log('SelectionPopup中的handleAskAI被调用');
		console.log('props:', props);
		console.log('props.onAskAI:', props.onAskAI);
		console.log('props.params:', props.params);

		if (props.onAskAI && props.params.annotation) {
			const selectedText = props.params.annotation.text || '';
			if (selectedText.trim()) {
				console.log('SelectionPopup中的handleAskAI被调用，text:', selectedText);
				props.onAskAI(selectedText);
			} else {
				console.log('SelectionPopup中的handleAskAI被调用，但没有选中文本');
			}
		} else {
			console.log('SelectionPopup中的handleAskAI被调用，但onAskAI回调不存在或params.annotation不存在');
			console.log('props.onAskAI:', props.onAskAI);
			console.log('props.params.annotation:', props.params?.annotation);
		}
	}

	async function handleTranslate() {
		// 切换翻译状态
		const newState = !translationVisible;
		setTranslationVisible(newState);

		// 如果关闭翻译面板，则直接返回
		if (!newState) {
			return;
		}

		// 显示翻译加载状态
		setTranslating(true);
		// 确保至少显示一些内容
		setTranslation("");

		try {
			const selectedText = props.params.annotation.text || '';
			if (!selectedText.trim()) {
				setTranslation("没有选中要翻译的文本，请选择文本后再试");
				setTranslating(false);
				return;
			}

			const translatedText = await props.onTranslate(selectedText);
			setTranslation(translatedText || "无翻译结果");
		} catch (error) {
			console.error('翻译出错:', error);
			setTranslation(`翻译失败: ${error.message || '未知错误'}. 请重试.`);
		} finally {
			setTranslating(false);
		}
	}

	async function handleCopyTranslation() {
		try {
			await navigator.clipboard.writeText(translation);
		} catch (error) {
			console.error('复制失败:', error);
		}
	}

	async function handleCopy() {
		try {
			const selectedText = props.params.annotation.text || '';
			if (selectedText.trim()) {
				await navigator.clipboard.writeText(selectedText);
				// Optional: provide visual feedback that text was copied
			} else {
				console.log('No text selected to copy');
			}
		} catch (error) {
			console.error('Copy failed:', error);
		}
	}

	// Prevent events from bubbling up to parent elements
	function handleTranslationContentClick(e) {
		e.stopPropagation();
	}

	// Allow text selection in the translation content
	function handleTranslationContentMouseDown(e) {
		e.stopPropagation();
	}

	// Auto-adjust textarea height based on content
	const textareaRef = useRef(null);

	useEffect(() => {
		if (textareaRef.current && translation) {
			// Reset height to auto to get the correct scrollHeight
			textareaRef.current.style.height = 'auto';
			// Set the height to scrollHeight to fit all content
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [translation]);

	return (
		<ViewPopup
			className={cx("selection-popup", {
				"with-translation": translationVisible
			})}
			rect={props.params.rect}
			uniqueRef={{}}
			padding={12}
		>
			<div className="colors" data-tabstop={1}>
				{ANNOTATION_COLORS.map((color, index) => (<button
					key={index}
					tabIndex={-1}
					className="toolbar-button color-button"
					title={intl.formatMessage({ id: color[0] })}
					onClick={() => handleColorPick(color[1])}
				><IconColor16 color={color[1]} /></button>))}
			</div>
			<div className="tool-toggle" data-tabstop={1}>
				<button
					tabIndex={-1}
					className={cx('highlight', { active: props.textSelectionAnnotationMode === 'highlight' })}
					title={intl.formatMessage({ id: 'pdfReader.highlightText' })}
					onClick={() => props.onChangeTextSelectionAnnotationMode('highlight')}
				><IconHighlight /></button>
				<button
					tabIndex={-1}
					className={cx('underline', { active: props.textSelectionAnnotationMode === 'underline' })}
					title={intl.formatMessage({ id: 'pdfReader.underlineText' })}
					onClick={() => props.onChangeTextSelectionAnnotationMode('underline')}
				><IconUnderline /></button>
			</div>
			{props.enableAddToNote &&
				<button className="toolbar-button wide-button" data-tabstop={1} onClick={handleAddToNote}>
					<FormattedMessage id="pdfReader.addToNote" />
				</button>}
			<CustomSections type="TextSelectionPopup" annotation={props.params.annotation} />
		</ViewPopup>
	);
}

// 添加PropTypes验证
SelectionPopup.propTypes = {
	params: PropTypes.shape({
		annotation: PropTypes.shape({
			text: PropTypes.string,
			id: PropTypes.string
		}),
		rect: PropTypes.array
	}),
	textSelectionAnnotationMode: PropTypes.string,
	enableAddToNote: PropTypes.bool,
	onAddAnnotation: PropTypes.func,
	onAddToNote: PropTypes.func,
	onChangeTextSelectionAnnotationMode: PropTypes.func,
	onTranslate: PropTypes.func,
	onAskAI: PropTypes.func,
	onDeleteAnnotation: PropTypes.func
};

export default SelectionPopup;
