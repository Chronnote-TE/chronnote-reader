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

	return (
		<ViewPopup
			className="selection-popup"
			rect={props.params.rect}
			uniqueRef={{}}
			padding={20}
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
					className={cx('highlight', {
						active: props.textSelectionAnnotationMode === 'highlight' && !translationVisible
					})}
					title={intl.formatMessage({ id: 'pdfReader.highlightText' })}
					onClick={() => {
						setTranslationVisible(false);
						props.onChangeTextSelectionAnnotationMode('highlight');
					}}
				><IconHighlight /></button>
				<button
					tabIndex={-1}
					className={cx('underline', {
						active: props.textSelectionAnnotationMode === 'underline' && !translationVisible
					})}
					title={intl.formatMessage({ id: 'pdfReader.underlineText' })}
					onClick={() => {
						setTranslationVisible(false);
						props.onChangeTextSelectionAnnotationMode('underline');
					}}
				><IconUnderline /></button>
				<button
					tabIndex={-1}
					className={cx('translate', {
						active: translationVisible
					})}
					title="翻译所选文本"
					onClick={handleTranslate}
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						position: 'relative'
					}}
				>
					<span style={{
						fontSize: '12px',
						fontWeight: translationVisible ? 'bold' : 'normal'
					}}>译</span>
					{translationVisible && (
						<span style={{
							position: 'absolute',
							bottom: '-3px',
							left: '50%',
							transform: 'translateX(-50%)',
							width: '4px',
							height: '4px',
							borderRadius: '50%',
							background: '#4a86e8'
						}}></span>
					)}
				</button>

			</div>
			{props.enableAddToNote && (
				<button className="toolbar-button wide-button" data-tabstop={1} onClick={handleAddToNote}>
					<FormattedMessage id="pdfReader.addToNote" />
				</button>
			)}

			{translationVisible && (
				<div className="translation-result" data-tabstop={1} style={{
					width: '100%',
				}}>
					<div className="translation-content" style={{
						fontSize: '14px',
						lineHeight: '1.5',
						whiteSpace: 'pre-wrap',
						wordBreak: 'break-word'
					}}>
						{!translating && (translation || "")}
					</div>
				</div>
			)}

			{translating && translationVisible && (
				<div className="translation-loading" data-tabstop={1} style={{
					border: '1px solid #add8e6',
					borderRadius: '5px',
					textAlign: 'center',
					color: '#4682b4',
					fontSize: '14px',
					animation: 'pulse 1.5s infinite ease-in-out'
				}}>
					<span>正在翻译中...</span>
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
