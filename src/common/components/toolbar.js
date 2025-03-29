import cx from 'classnames';
import {
	ChevronDown,
	ChevronLeft,
	ChevronUp,
	FileText,
	Highlighter,
	ImagePlus,
	Maximize,
	PanelLeft,
	PanelRightClose,
	Pencil,
	StickyNote,
	Type,
	Underline,
	ZoomIn,
	ZoomOut,
	Eraser,
	Search,
	ChevronDown as ChevronDownSmall,
	X,
	Columns2
} from 'lucide-react';
import React, { Fragment, useContext, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { ReaderContext } from '../reader';
import CustomSections from './common/custom-sections';
import { IconColor20 } from './common/icons';

function Toolbar(props) {
	const intl = useIntl();
	const pageInputRef = useRef();
	const { platform } = useContext(ReaderContext);

	useEffect(() => {
		if (['pdf', 'epub'].includes(props.type)) {
			pageInputRef.current.value = props.pageLabel ?? (props.pageIndex + 1);
		}
	}, [props.pageLabel, props.pageIndex]);

	function handleSidebarButtonClick(_event) {
		props.onToggleSidebar(!props.sidebarOpen);
	}

	function handleToolColorClick(event) {
		let br = event.currentTarget.getBoundingClientRect();
		props.onOpenColorContextMenu({ x: br.left, y: br.bottom });
	}

	function handleFindClick(_event) {
		props.onToggleFind();
	}

	function handleToolClick(type) {
		if (props.tool.type === type) {
			type = 'pointer';
		}
		if (type === 'ink' && ['ink', 'eraser'].includes(props.tool.type)) {
			type = 'pointer';
		}
		props.onChangeTool({ type });
	}

	function handlePageNumberKeydown(event) {
		if (event.key === 'Enter') {
			props.onChangePageNumber(event.target.value);
		}
	}

	function handlePageNumberBlur(event) {
		if (event.target.value != (props.pageLabel ?? (props.pageIndex + 1))) {
			props.onChangePageNumber(event.target.value);
		}
	}

	function handleMenuButtonClick(event) {
		if (props.onMenuButtonClick) {
			props.onMenuButtonClick(event);
		}
	}

	function handleCloseClick(_event) {
		if (props.onClickClose) {
			props.onClickClose();
		}
	}

	function handleSplitClick(_event) {
		if (props.onClickSplit) {
			props.onClickSplit();
		}
	}

	return (
		<div className="toolbar" data-tabstop={1} role="application">
			<div className="start">
				<button
					id="menuButton"
					className="toolbar-button menu-button"
					title={intl.formatMessage({ id: 'pdfReader.menuButton' }, { defaultMessage: 'Toggle Panel' })}
					tabIndex={-1}
					onClick={handleMenuButtonClick}
				><PanelLeft size={18} strokeWidth={1.5} /></button>
				<div className="divider" />
				<button
					id="sidebarToggle"
					className="toolbar-button sidebar-toggle"
					title={intl.formatMessage({ id: 'pdfReader.toggleSidebar' })}
					tabIndex={-1}
					onClick={handleSidebarButtonClick}
				><PanelRightClose size={18} strokeWidth={1.5} /></button>
				<div className="divider" />
				<button
					id="zoomOut"
					className="toolbar-button zoomOut"
					title={intl.formatMessage({ id: 'pdfReader.zoomOut' })}
					tabIndex={-1}
					disabled={!props.enableZoomOut}
					onClick={props.onZoomOut}
				><ZoomOut size={18} strokeWidth={1.5} /></button>
				<button
					id="zoomIn"
					className="toolbar-button zoomIn"
					title={intl.formatMessage({ id: 'pdfReader.zoomIn' })}
					tabIndex={-1}
					disabled={!props.enableZoomIn}
					onClick={props.onZoomIn}
				><ZoomIn size={18} strokeWidth={1.5} /></button>
				<button
					id="zoomAuto"
					className="toolbar-button zoomAuto"
					title={intl.formatMessage({ id: 'pdfReader.zoomReset' })}
					tabIndex={-1}
					disabled={!props.enableZoomReset}
					onClick={props.onZoomReset}
				><Maximize size={18} strokeWidth={1.5} /></button>
				<button
					id="appearance"
					className={cx('toolbar-button', { active: props.appearancePopup })}
					title={intl.formatMessage({ id: 'pdfReader.appearance' })}
					tabIndex={-1}
					onClick={props.onToggleAppearancePopup}
				><Type size={18} strokeWidth={1.5} /></button>
				<div className="divider" />
				<button
					id="navigateBack"
					className="toolbar-button navigateBack"
					title={intl.formatMessage({ id: 'general.back' })}
					tabIndex={-1}
					disabled={!props.enableNavigateBack}
					onClick={props.onNavigateBack}
				><ChevronLeft size={18} strokeWidth={1.5} /></button>
				<div className="divider" />
				{['pdf', 'epub'].includes(props.type) && (
					<React.Fragment>
						<button
							className="toolbar-button pageUp"
							title={intl.formatMessage({ id: 'pdfReader.previousPage' })}
							id="previous"
							tabIndex={-1}
							disabled={!props.enableNavigateToPreviousPage}
							onClick={props.onNavigateToPreviousPage}
							aria-describedby="numPages"
						><ChevronUp size={18} strokeWidth={1.5} /></button>
						<button
							className="toolbar-button pageDown"
							title={intl.formatMessage({ id: 'pdfReader.nextPage' })}
							id="next"
							tabIndex={-1}
							disabled={!props.enableNavigateToNextPage}
							onClick={props.onNavigateToNextPage}
							aria-describedby="numPages"
						><ChevronDown size={18} strokeWidth={1.5} /></button>
					</React.Fragment>
				)}
				{['pdf', 'epub'].includes(props.type) && (
					<input
						ref={pageInputRef}
						type="input"
						id="pageNumber"
						className="toolbar-text-input"
						title={intl.formatMessage({
							id: props.type === 'pdf' || props.usePhysicalPageNumbers
								? 'pdfReader.page'
								: 'pdfReader.location'
						})}
						defaultValue=""
						size="4"
						min="1"
						tabIndex={-1}
						autoComplete="off"
						onKeyDown={handlePageNumberKeydown}
						onBlur={handlePageNumberBlur}
					/>)}
				{props.pageLabel && (
					<span id="numPages">&nbsp;<div>{!(props.type === 'pdf' && props.pageIndex + 1 == props.pageLabel)
						&& (props.pageIndex + 1)} / {props.pagesCount}</div></span>
				)}
			</div>
			<div className="center tools">
				<button
					tabIndex={-1}
					className={cx('toolbar-button highlight', { active: props.tool.type === 'highlight' })}
					title={intl.formatMessage({ id: 'pdfReader.highlightText' })}
					disabled={props.readOnly}
					onClick={() => handleToolClick('highlight')}
					data-l10n-id="pdfReader-toolbar-highlight"
				><Highlighter size={18} strokeWidth={1.5} /></button>
				<button
					tabIndex={-1}
					className={cx('toolbar-button underline', { active: props.tool.type === 'underline' })}
					title={intl.formatMessage({ id: 'pdfReader.underlineText' })}
					disabled={props.readOnly}
					onClick={() => handleToolClick('underline')}
					data-l10n-id="pdfReader-toolbar-underline"
				><Underline size={18} strokeWidth={1.5} /></button>
				<button
					tabIndex={-1}
					className={cx('toolbar-button note', {
						active: props.tool.type === 'note'
					})}
					title={intl.formatMessage({ id: 'pdfReader.addNote' })}
					disabled={props.readOnly}
					onClick={() => handleToolClick('note')}
					data-l10n-id="pdfReader-toolbar-note"
				><StickyNote size={18} strokeWidth={1.5} /></button>
				{props.type === 'pdf' && (
					<button
						tabIndex={-1}
						className={cx('toolbar-button text', { active: props.tool.type === 'text' })}
						title={intl.formatMessage({ id: 'pdfReader.addText' })}
						disabled={props.readOnly}
						onClick={() => handleToolClick('text')}
						data-l10n-id="pdfReader-toolbar-text"
					><FileText size={18} strokeWidth={1.5} /></button>
				)}
				{props.type === 'pdf' && (
					<button
						tabIndex={-1}
						className={cx('toolbar-button area', { active: props.tool.type === 'image' })}
						title={intl.formatMessage({ id: 'pdfReader.selectArea' })}
						disabled={props.readOnly}
						onClick={() => handleToolClick('image')}
						data-l10n-id="pdfReader-toolbar-area"
					><ImagePlus size={18} strokeWidth={1.5} /></button>
				)}
				{props.type === 'pdf' && (
					<button
						tabIndex={-1}
						className={cx('toolbar-button ink', { active: ['ink', 'eraser'].includes(props.tool.type) })}
						title={intl.formatMessage({ id: 'pdfReader.draw' })}
						disabled={props.readOnly}
						onClick={() => handleToolClick('ink')}
						data-l10n-id="pdfReader-toolbar-draw"
					><Pencil size={18} strokeWidth={1.5} /></button>
				)}
				<div className="divider" />
				<button
					tabIndex={-1}
					className="toolbar-button toolbar-dropdown-button"
					disabled={props.readOnly || ['pointer', 'hand'].includes(props.tool.type)}
					title={intl.formatMessage({ id: 'pdfReader.pickColor' })}
					onClick={handleToolColorClick}
				>
					{
						props.tool.type === 'eraser'
							? <Eraser size={18} strokeWidth={1.5} />
							: <IconColor20 color={props.tool.color || ['pointer', 'hand'].includes(props.tool.type) && 'transparent'} />
					}
					<ChevronDownSmall size={12} strokeWidth={1.5} />
				</button>
				<div className="divider" />
				<button
					tabIndex={-1}
					className={cx('toolbar-button find', { active: props.findPopupOpen })}
					title={intl.formatMessage({ id: 'pdfReader.findInDocument' })}
					onClick={handleFindClick}
				><Search size={18} strokeWidth={1.5} /></button>
				{props.type === 'pdf' && props.tool.type === 'ink' && (
					<button
						tabIndex={-1}
						className={cx('toolbar-button eraser', { active: props.tool.type === 'eraser' })}
						title={intl.formatMessage({ id: 'pdfReader.eraser' })}
						disabled={props.readOnly}
						onClick={() => handleToolClick('eraser')}
						data-l10n-id="pdfReader-toolbar-eraser"
					><Eraser size={18} strokeWidth={1.5} /></button>
				)}
			</div>
			<div className="end">
				<CustomSections type="Toolbar" />

				<div className="divider" />
				<button
					className="toolbar-button split"
					title={intl.formatMessage({ id: 'pdfReader.split' }, { defaultMessage: 'Split View' })}
					tabIndex={-1}
					onClick={handleSplitClick}
				><Columns2 size={18} strokeWidth={1.5} /></button>

				<button
					className="toolbar-button close"
					title={intl.formatMessage({ id: 'pdfReader.close' }, { defaultMessage: 'Close' })}
					tabIndex={-1}
					onClick={handleCloseClick}
				><X size={18} strokeWidth={1.5} /></button>

				{platform === 'zotero' && props.showContextPaneToggle && (
					<Fragment>
						<div className="divider" />
						<button
							className={cx('toolbar-button context-pane-toggle',
								{ 'active-pseudo-class-fix': props.contextPaneOpen })}
							title={intl.formatMessage({ id: 'pdfReader.toggleSecondaryView' })}
							tabIndex={-1}
							onClick={_event => props.onToggleContextPane(!props.contextPaneOpen)}
						>
							<div className={cx(
								{ 'standard-view': props.contextPaneType === 'note-editor' },
								{ 'standard-view-active': props.contextPaneType === 'note-editor' && props.contextPaneOpen }
							)}>
								<PanelRightClose size={18} strokeWidth={1.5} />
							</div>
						</button>
					</Fragment>
				)}
			</div>
		</div>
	);
}

Toolbar.propTypes = {
	type: PropTypes.string,
	pageLabel: PropTypes.string,
	pageIndex: PropTypes.number,
	sidebarOpen: PropTypes.bool,
	onToggleSidebar: PropTypes.func,
	onOpenColorContextMenu: PropTypes.func,
	onToggleFind: PropTypes.func,
	tool: PropTypes.shape({
		type: PropTypes.string,
		color: PropTypes.string
	}),
	onChangeTool: PropTypes.func,
	onChangePageNumber: PropTypes.func,
	onMenuButtonClick: PropTypes.func,
	enableZoomOut: PropTypes.bool,
	onZoomOut: PropTypes.func,
	enableZoomIn: PropTypes.bool,
	onZoomIn: PropTypes.func,
	enableZoomReset: PropTypes.bool,
	onZoomReset: PropTypes.func,
	appearancePopup: PropTypes.bool,
	onToggleAppearancePopup: PropTypes.func,
	enableNavigateBack: PropTypes.bool,
	onNavigateBack: PropTypes.func,
	enableNavigateToPreviousPage: PropTypes.bool,
	onNavigateToPreviousPage: PropTypes.func,
	enableNavigateToNextPage: PropTypes.bool,
	onNavigateToNextPage: PropTypes.func,
	usePhysicalPageNumbers: PropTypes.bool,
	pagesCount: PropTypes.number,
	readOnly: PropTypes.bool,
	findPopupOpen: PropTypes.bool,
	showContextPaneToggle: PropTypes.bool,
	contextPaneOpen: PropTypes.bool,
	onToggleContextPane: PropTypes.func,
	contextPaneType: PropTypes.string,
	onClickClose: PropTypes.func,
	onClickSplit: PropTypes.func
};

export default Toolbar;
