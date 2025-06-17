import cx from 'classnames';
import {
	Camera,
	ChevronDown,
	ChevronLeft,
	Eraser,
	FileText,
	Highlighter,
	ImagePlus,
	Maximize,
	MoreHorizontal,
	PanelLeft,
	PanelBottom,
	PanelRightClose,
	Pencil,
	Search,
	Sparkles,
	StickyNote,
	Type,
	Underline,
	ZoomIn,
	ZoomOut
} from 'lucide-react';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Localized, useLocalization } from "@fluent/react";
import { ReaderContext } from '../reader';
import CustomSections from './common/custom-sections';
import { Button } from '@/components/ui/button';
import './toolbar.css';

function Toolbar({ visible = true, ...props }) {
	const pageInputRef = useRef();
	const toolbarRef = useRef();
	const { platform } = useContext(ReaderContext);

	const { l10n } = useLocalization();
	const [showMoreMenu, setShowMoreMenu] = useState(false);
	const [isSmallScreen, setIsSmallScreen] = useState(false);
	const [isVerySmallScreen, setIsVerySmallScreen] = useState(false);
	const moreMenuRef = useRef();

	useEffect(() => {
		if (['pdf', 'epub'].includes(props.type)) {
			if (pageInputRef.current) {
				pageInputRef.current.value = props.pageLabel ?? (props.pageIndex + 1);
			}
		}
	}, [props.pageLabel, props.pageIndex]);

	useEffect(() => {
		// Function to check screen width and update state
		const checkScreenWidth = () => {
			const verySmallScreenThreshold = 500;
			const smallScreenThreshold = 768;

			setIsVerySmallScreen(window.innerWidth < verySmallScreenThreshold);
			setIsSmallScreen(window.innerWidth < smallScreenThreshold);
		};

		// Check on initial render
		checkScreenWidth();

		// Add event listener for window resize
		window.addEventListener('resize', checkScreenWidth);

		// Clean up event listener on component unmount
		return () => {
			window.removeEventListener('resize', checkScreenWidth);
		};
	}, []);

	useEffect(() => {
		// Close more menu when clicking outside
		const handleClickOutside = (event) => {
			if (moreMenuRef.current && !moreMenuRef.current.contains(event.target) &&
				!event.target.closest('.more-button')) {
				setShowMoreMenu(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// 根据屏幕尺寸决定哪些工具应该显示在more菜单中
	const shouldShowPdfToolsInMoreMenu = isSmallScreen;
	const shouldShowAnnotationToolsInMoreMenu = isVerySmallScreen;
	const shouldShowMoreButton = isSmallScreen || isVerySmallScreen;

	function handleSidebarButtonClick(_event) {
		props.onToggleSidebar(!props.sidebarOpen);
	}

	function handleToolColorClick(event) {
		let br = event.currentTarget.getBoundingClientRect();
		props.onOpenColorContextMenu({ x: br.left, y: br.bottom });
		console.log(br.left, br.bottom);
		console.log(props.onOpenColorContextMenu);
		console.log('handleToolColorClick', event.currentTarget);
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

	return (
		<div className="toolbar" data-tabstop={1} role="application">
			<div className="start">
				<Button variant="ghost" size="icon" onClick={handleSidebarButtonClick}>
					<PanelLeft />
					你好
				</Button>

				<div className="divider" />
				<button
					id="zoomOut"
					className="toolbar-button zoomOut"
					title={l10n.getString('pdfReader-zoomOut')}
					tabIndex={-1}
					disabled={!props.enableZoomOut}
					onClick={props.onZoomOut}
				><ZoomOut /></button>
				<button
					id="zoomIn"
					className="toolbar-button zoomIn"
					title={l10n.getString('pdfReader-zoomIn')}
					tabIndex={-1}
					disabled={!props.enableZoomIn}
					onClick={props.onZoomIn}
				><ZoomIn /></button>
				<button
					id="zoomAuto"
					className="toolbar-button zoomAuto"
					title={l10n.getString('reader-zoom-reset')}
					tabIndex={-1}
					disabled={!props.enableZoomReset}
					onClick={props.onZoomReset}
				><Maximize /></button>
				<button
					id="appearance"
					className={cx('toolbar-button', { active: props.appearancePopup })}
					title={l10n.getString('pdfReader-appearance')}
					tabIndex={-1}
					onClick={props.onToggleAppearancePopup}
				><Sparkles /></button>
				<div className="divider" />
				<button
					id="navigateBack"
					className="toolbar-button navigateBack"
					title={l10n.getString('general-back')}
					tabIndex={-1}
					disabled={!props.enableNavigateBack}
					onClick={props.onNavigateBack}
				><ChevronLeft /></button>
				<div className="divider" />
				{['pdf', 'epub'].includes(props.type) && (
					<React.Fragment>
						<button
							className={cx('toolbar-button underline', { active: props.tool.type === 'underline' })}
							title={l10n.getString('pdfReader-underlineText')}
							id="previous"
							tabIndex={-1}
							disabled={props.readOnly}
							onClick={() => handleToolClick('underline')}
							data-l10n-id="pdfReader-toolbar-underline"
						><Underline size={18} strokeWidth={1.5} /></button>
						<button
							className={cx('toolbar-button note', {
								active: props.tool.type === 'note'
							})}
							title={l10n.getString('pdfReader-addNote')}
							id="next"
							tabIndex={-1}
							disabled={props.readOnly}
							onClick={() => handleToolClick('note')}
							data-l10n-id="pdfReader-toolbar-note"
						><StickyNote size={18} strokeWidth={1.5} /></button>
					</React.Fragment>
				)}
				{['pdf', 'epub'].includes(props.type) && (
					<input
						ref={pageInputRef}
						type="input"
						id="pageNumber"
						className="toolbar-text-input"
						title={l10n.getString(
							props.type === 'pdf' || props.usePhysicalPageNumbers
								? 'pdfReader-page'
								: 'pdfReader-location'
						)}
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
					title={l10n.getString('pdfReader-highlightText')}
					disabled={props.readOnly}
					onClick={() => handleToolClick('highlight')}
					data-l10n-id="pdfReader-toolbar-highlight"
				><Highlighter /></button>
				<button
					tabIndex={-1}
					className={cx('toolbar-button underline', { active: props.tool.type === 'underline' })}
					title={l10n.getString('pdfReader-underlineText')}
					disabled={props.readOnly}
					onClick={() => handleToolClick('underline')}
					data-l10n-id="pdfReader-toolbar-underline"
				><Underline /></button>
				<button
					tabIndex={-1}
					className={cx('toolbar-button note', {
						active: props.tool.type === 'note'
					})}
					title={l10n.getString('pdfReader-addNote')}
					disabled={props.readOnly}
					onClick={() => handleToolClick('note')}
					data-l10n-id="pdfReader-toolbar-note"
				><StickyNote /></button>
				{props.type === 'pdf' && (
					<button
						tabIndex={-1}
						className={cx('toolbar-button text', { active: props.tool.type === 'text' })}
						title={l10n.getString('pdfReader-addText')}
						disabled={props.readOnly}
						onClick={() => handleToolClick('text')}
						data-l10n-id="pdfReader-toolbar-text"
					><Type /></button>
				)}
				{props.type === 'pdf' && (
					<button
						tabIndex={-1}
						className={cx('toolbar-button area', { active: props.tool.type === 'image' })}
						title={l10n.getString('pdfReader-selectArea')}
						disabled={props.readOnly}
						onClick={() => handleToolClick('image')}
						data-l10n-id="pdfReader-toolbar-area"
					><ImagePlus /></button>
				)}
				{props.type === 'pdf' && (
					<button
						tabIndex={-1}
						className={cx('toolbar-button ink', { active: ['ink', 'eraser'].includes(props.tool.type) })}
						title={l10n.getString('pdfReader-draw')}
						disabled={props.readOnly}
						onClick={() => handleToolClick('ink')}
						data-l10n-id="pdfReader-toolbar-draw"
					><Pencil /></button>
				)}
				<div className="divider" />
				<button
					tabIndex={-1}
					className="toolbar-button toolbar-dropdown-button"
					disabled={props.readOnly || ['pointer', 'hand'].includes(props.tool.type)}
					title={l10n.getString('pdfReader-pickColor')}
					onClick={handleToolColorClick}
				>
					{
						props.tool.type === 'eraser'
							? <Eraser />
							: <div style={{ width: 16, height: 16, backgroundColor: props.tool.color || 'transparent', borderRadius: '50%', border: '1px solid #ccc' }} />
					}
					<ChevronDown />
				</button>
			</div>
			<div className="end">
				<CustomSections type="Toolbar" />
				<button
					className={cx('toolbar-button find', { active: props.findPopupOpen })}
					title={l10n.getString('pdfReader-findInDocument')}
					tabIndex={-1}
					onClick={handleFindClick}
				><Search /></button>
				{platform === 'zotero' && props.showContextPaneToggle && (
					<Fragment>
						<div className="divider" />
						<button
							className="toolbar-button context-pane-toggle"
							title={l10n.getString('pdfReader-toggleContextPane')}
							tabIndex={-1}
							onClick={props.onToggleContextPane}
						>{props.stackedView ? <PanelBottom /> : <PanelLeft className="standard-view" />}</button>
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
	onFitToWidth: PropTypes.func,
	onScreenshot: PropTypes.func,
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
	onClickSplit: PropTypes.func,
	onClickVerticalSplit: PropTypes.func,
	visible: PropTypes.bool
};

export default Toolbar;
