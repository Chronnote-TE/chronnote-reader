import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ANNOTATION_COLORS } from '../../defines';
import CustomSections from '../common/custom-sections';
import ViewPopup from './common/view-popup';

import { IconColor16 } from '../common/icons';

import IconHighlight from '../../../../res/icons/16/annotate-highlight.svg';
import IconUnderline from '../../../../res/icons/16/annotate-underline.svg';

function SelectionPopup(props) {
	const intl = useIntl();
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

	return (
		<ViewPopup
			className={cx("selection-popup", { "with-translation": translationVisible })}
			rect={props.params.rect}
			uniqueRef={{}}
			padding={12}
		>
			<div className="selection-popup-main">
				{/* 工具栏 */}
				<div className="toolbar-row">
					<div className="tools-group">
						<button
							tabIndex={-1}
							className={cx('tool-btn', {
								active: props.textSelectionAnnotationMode === 'highlight' && !translationVisible
							})}
							onClick={() => {
								setTranslationVisible(false);
								props.onChangeTextSelectionAnnotationMode('highlight');
							}}
						>
							<IconHighlight />
						</button>
						<button
							tabIndex={-1}
							className={cx('tool-btn', {
								active: props.textSelectionAnnotationMode === 'underline' && !translationVisible
							})}
							onClick={() => {
								setTranslationVisible(false);
								props.onChangeTextSelectionAnnotationMode('underline');
							}}
						>
							<IconUnderline />
						</button>
						<button
							tabIndex={-1}
							className={cx('tool-btn', {
								active: translationVisible
							})}
							onClick={handleTranslate}
						>
							译
						</button>
					</div>

					<div className="colors-group">
						{ANNOTATION_COLORS.map((color, index) => (
							<button
								key={index}
								tabIndex={-1}
								className="color-btn"
								onClick={() => handleColorPick(color[1])}
							>
								<IconColor16 color={color[1]} />
							</button>
						))}
					</div>

					{props.enableAddToNote && (
						<button
							className="add-note-btn"
							data-tabstop={1}
							onClick={handleAddToNote}
						>
							<span>+</span>
						</button>
					)}
				</div>
			</div>

			{/* 翻译结果区域 */}
			{translationVisible && (
				<div className="translation-panel">
					{translating ? (
						<div className="translation-loading">
							<span>正在翻译...</span>
						</div>
					) : (
						<>
							<div className="translation-content">
								{translation || ""}
							</div>
							{translation && (
								<div className="translation-actions">
									<button
										className="copy-btn"
										onClick={handleCopyTranslation}
									>
										复制
									</button>
									<button
										className="close-btn"
										onClick={() => setTranslationVisible(false)}
									>
										关闭
									</button>
								</div>
							)}
						</>
					)}
				</div>
			)}

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
	onDeleteAnnotation: PropTypes.func
};

export default SelectionPopup;
