import cx from 'classnames';
import {
	ChevronDown,
	ChevronLeft,
	ChevronUp,
	FileText,
	Highlighter,
	ImagePlus,
	Maximize,
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
	Columns2,
	Rows2,
	MoreHorizontal
} from 'lucide-react';
import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { ReaderContext } from '../reader';
import CustomSections from './common/custom-sections';
import { IconColor20 } from './common/icons';
import './toolbar.css';

function Toolbar({ visible = true, ...props }) {
	const intl = useIntl();
	const pageInputRef = useRef();
	const toolbarRef = useRef();
	const { platform } = useContext(ReaderContext);
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

	function toggleMoreMenu() {
		setShowMoreMenu(!showMoreMenu);
	}

	// If toolbar is not visible, don't render it
	if (visible === false) {
		return null;
	}

	// Define tools that will be moved to "more" menu on small screens
	const pdfTools = (
		<div className="pdf-tools">
			<button
				tabIndex={-1}
				className={cx('toolbar-button text', { active: props.tool.type === 'text' })}
				title={intl.formatMessage({ id: 'pdfReader.addText' })}
				disabled={props.readOnly}
				onClick={() => handleToolClick('text')}
				data-l10n-id="pdfReader-toolbar-text"
			><FileText size={18} strokeWidth={1.5} /></button>
			<button
				tabIndex={-1}
				className={cx('toolbar-button area', { active: props.tool.type === 'image' })}
				title={intl.formatMessage({ id: 'pdfReader.selectArea' })}
				disabled={props.readOnly}
				onClick={() => handleToolClick('image')}
				data-l10n-id="pdfReader-toolbar-area"
			><ImagePlus size={18} strokeWidth={1.5} /></button>
			<button
				tabIndex={-1}
				className={cx('toolbar-button ink', { active: ['ink', 'eraser'].includes(props.tool.type) })}
				title={intl.formatMessage({ id: 'pdfReader.draw' })}
				disabled={props.readOnly}
				onClick={() => handleToolClick('ink')}
				data-l10n-id="pdfReader-toolbar-draw"
			><Pencil size={18} strokeWidth={1.5} /></button>
		</div>
	);

	const eraserTool = props.type === 'pdf' && props.tool.type === 'ink' && (
		<button
			tabIndex={-1}
			className={cx('toolbar-button eraser', { active: props.tool.type === 'eraser' })}
			title={intl.formatMessage({ id: 'pdfReader.eraser' })}
			disabled={props.readOnly}
			onClick={() => handleToolClick('eraser')}
			data-l10n-id="pdfReader-toolbar-eraser"
		><Eraser size={18} strokeWidth={1.5} /></button>
	);

	// 决定是否需要显示更多菜单按钮 - 大屏幕时不显示
	const shouldShowMoreMenuButton = isSmallScreen || isVerySmallScreen;

	return (
		<div
			className={cx(
				"toolbar",
				{ "very-small-screen": isVerySmallScreen },
				{ "small-screen": isSmallScreen && !isVerySmallScreen }
			)}
			data-tabstop={1}
			role="application"
			ref={toolbarRef}
		>
			{/* 工具栏主容器 */}
			<div className="end toolbar-group">
				{/* 高亮、下划线和笔记工具 - 仅在较大屏幕和中等屏幕显示 */}
				{!shouldShowAnnotationToolsInMoreMenu && (
					<div className="annotation-tools">
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
					</div>
				)}

				{/* 中间区域 - 页码 - 隐藏在很小的屏幕上 */}
				{!isVerySmallScreen && ['pdf', 'epub'].includes(props.type) && (
					<div className="center toolbar-group">
						<div className="page-controls">
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
							/>
							{props.pageLabel && (
								<span id="numPages">&nbsp;<div>{!(props.type === 'pdf' && props.pageIndex + 1 == props.pageLabel)
									&& (props.pageIndex + 1)} / {props.pagesCount}</div></span>
							)}
						</div>
					</div>
				)}

				{/* PDF工具区域 - 仅在大屏幕上显示 */}
				{props.type === 'pdf' && !shouldShowPdfToolsInMoreMenu && (
					<>
						<div className="divider" />
						{pdfTools}
					</>
				)}

				{/* 分隔符和实用工具 */}
				<div className="divider" />

				{/* Utility tools with zoom controls - only show on larger screens */}
				{!shouldShowPdfToolsInMoreMenu && !isVerySmallScreen && (
					<div className="utility-tools">
						<button
							tabIndex={-1}
							className="toolbar-button zoom-out"
							title={intl.formatMessage({ id: 'pdfReader.zoomOut' })}
							disabled={!props.enableZoomOut}
							onClick={props.onZoomOut}
							data-l10n-id="pdfReader-toolbar-zoom-out"
						><ZoomOut size={18} strokeWidth={1.5} /></button>
						<button
							tabIndex={-1}
							className="toolbar-button zoom-in"
							title={intl.formatMessage({ id: 'pdfReader.zoomIn' })}
							disabled={!props.enableZoomIn}
							onClick={props.onZoomIn}
							data-l10n-id="pdfReader-toolbar-zoom-in"
						><ZoomIn size={18} strokeWidth={1.5} /></button>
						<button
							tabIndex={-1}
							className="toolbar-button fit-to-width"
							title={intl.formatMessage({ id: 'pdfReader.fitToWidth' })}
							onClick={props.onFitToWidth}
							data-l10n-id="pdfReader-toolbar-fit-to-width"
						><Maximize size={18} strokeWidth={1.5} /></button>
					</div>
				)}

				<CustomSections type="Toolbar" />

				{/* Zotero上下文面板切换按钮 - 隐藏在很小的屏幕上 */}
				{platform === 'zotero' && props.showContextPaneToggle && !isVerySmallScreen && (
					<>
						<div className="divider" />
						<button
							className={cx('toolbar-button context-pane-toggle',
								{ 'active-pseudo-class-fix': props.contextPaneOpen })}
							title={intl.formatMessage({ id: 'pdfReader.toggleSecondaryView' })}
							tabIndex={-1}
							onClick={() => props.onToggleContextPane(!props.contextPaneOpen)}
						>
							<div className={cx(
								{ 'standard-view': props.contextPaneType === 'note-editor' },
								{ 'standard-view-active': props.contextPaneType === 'note-editor' && props.contextPaneOpen }
							)}>
								<PanelRightClose size={18} strokeWidth={1.5} />
							</div>
						</button>
					</>
				)}

				{/* More button and menu */}
				{shouldShowMoreButton && (
					<div className="more-menu-container">
						<button
							tabIndex={-1}
							className="toolbar-button more-button"
							title={intl.formatMessage({ id: 'pdfReader.moreTools' })}
							onClick={toggleMoreMenu}
						>
							<MoreHorizontal size={isVerySmallScreen ? 20 : 18} strokeWidth={1.5} />
						</button>

						{showMoreMenu && (
							<div className="more-menu" ref={moreMenuRef}>
								{/* Add zoom controls at the beginning of the more menu when on very small screen */}
								{isVerySmallScreen && (
									<div className="more-menu-section">
										<div className="more-menu-header">
											{intl.formatMessage({ id: 'pdfReader.zoomControls' })}
										</div>
										<button
											tabIndex={-1}
											className="more-menu-button"
											disabled={!props.enableZoomOut}
											onClick={() => {
												props.onZoomOut();
												setShowMoreMenu(false);
											}}
										>
											<ZoomOut size={16} strokeWidth={1.5} />
											<span>{intl.formatMessage({ id: 'pdfReader.zoomOut' })}</span>
										</button>
										<button
											tabIndex={-1}
											className="more-menu-button"
											disabled={!props.enableZoomIn}
											onClick={() => {
												props.onZoomIn();
												setShowMoreMenu(false);
											}}
										>
											<ZoomIn size={16} strokeWidth={1.5} />
											<span>{intl.formatMessage({ id: 'pdfReader.zoomIn' })}</span>
										</button>
										<button
											tabIndex={-1}
											className="more-menu-button"
											onClick={() => {
												props.onFitToWidth();
												setShowMoreMenu(false);
											}}
										>
											<Maximize size={16} strokeWidth={1.5} />
											<span>{intl.formatMessage({ id: 'pdfReader.fitToWidth' })}</span>
										</button>
									</div>
								)}
								{/* Rest of the more menu content */}
								{isVerySmallScreen && ['pdf', 'epub'].includes(props.type) && (
									<div className="more-menu-section">
										<div className="more-menu-header">Page Navigation</div>
										<div className="page-controls-in-menu">
											<input
												type="input"
												className="toolbar-text-input"
												defaultValue={props.pageLabel ?? (props.pageIndex + 1)}
												size="3"
												min="1"
												onKeyDown={(e) => {
													if (e.key === 'Enter') {
														props.onChangePageNumber(e.target.value);
														setShowMoreMenu(false);
													}
												}}
												onBlur={(e) => {
													if (e.target.value != (props.pageLabel ?? (props.pageIndex + 1))) {
														props.onChangePageNumber(e.target.value);
													}
												}}
											/>
											<span>/ {props.pagesCount}</span>
										</div>
									</div>
								)}
								{shouldShowAnnotationToolsInMoreMenu && (
									<div className="more-menu-section">
										<div className="more-menu-header">Annotation Tools</div>
										<button
											tabIndex={-1}
											className={cx('more-menu-button', { active: props.tool.type === 'highlight' })}
											onClick={() => {
												handleToolClick('highlight');
												setShowMoreMenu(false);
											}}
										>
											<Highlighter size={16} strokeWidth={1.5} />
											<span>{intl.formatMessage({ id: 'pdfReader.highlightText' })}</span>
										</button>
										<button
											tabIndex={-1}
											className={cx('more-menu-button', { active: props.tool.type === 'underline' })}
											onClick={() => {
												handleToolClick('underline');
												setShowMoreMenu(false);
											}}
										>
											<Underline size={16} strokeWidth={1.5} />
											<span>{intl.formatMessage({ id: 'pdfReader.underlineText' })}</span>
										</button>
										<button
											tabIndex={-1}
											className={cx('more-menu-button', { active: props.tool.type === 'note' })}
											onClick={() => {
												handleToolClick('note');
												setShowMoreMenu(false);
											}}
										>
											<StickyNote size={16} strokeWidth={1.5} />
											<span>{intl.formatMessage({ id: 'pdfReader.addNote' })}</span>
										</button>
									</div>
								)}

								{props.type === 'pdf' && shouldShowPdfToolsInMoreMenu && (
									<div className="more-menu-section">
										<div className="more-menu-header">PDF Tools</div>
										<button
											tabIndex={-1}
											className={cx('more-menu-button', { active: props.tool.type === 'text' })}
											onClick={() => {
												handleToolClick('text');
												setShowMoreMenu(false);
											}}
										>
											<FileText size={16} strokeWidth={1.5} />
											<span>{intl.formatMessage({ id: 'pdfReader.addText' })}</span>
										</button>
										<button
											tabIndex={-1}
											className={cx('more-menu-button', { active: props.tool.type === 'image' })}
											onClick={() => {
												handleToolClick('image');
												setShowMoreMenu(false);
											}}
										>
											<ImagePlus size={16} strokeWidth={1.5} />
											<span>{intl.formatMessage({ id: 'pdfReader.selectArea' })}</span>
										</button>
										<button
											tabIndex={-1}
											className={cx('more-menu-button', { active: ['ink', 'eraser'].includes(props.tool.type) })}
											onClick={() => {
												handleToolClick('ink');
												setShowMoreMenu(false);
											}}
										>
											<Pencil size={16} strokeWidth={1.5} />
											<span>{intl.formatMessage({ id: 'pdfReader.draw' })}</span>
										</button>
										{props.type === 'pdf' && props.tool.type === 'ink' && (
											<button
												tabIndex={-1}
												className={cx('more-menu-button', { active: props.tool.type === 'eraser' })}
												onClick={() => {
													handleToolClick('eraser');
													setShowMoreMenu(false);
												}}
											>
												<Eraser size={16} strokeWidth={1.5} />
												<span>{intl.formatMessage({ id: 'pdfReader.eraser' })}</span>
											</button>
										)}
									</div>
								)}

								{platform === 'zotero' && props.showContextPaneToggle && isVerySmallScreen && (
									<div className="more-menu-section">
										<div className="more-menu-header">View</div>
										<button
											tabIndex={-1}
											className={cx('more-menu-button', { active: props.contextPaneOpen })}
											onClick={() => {
												props.onToggleContextPane(!props.contextPaneOpen);
												setShowMoreMenu(false);
											}}
										>
											<PanelRightClose size={16} strokeWidth={1.5} />
											<span>{intl.formatMessage({ id: 'pdfReader.toggleSecondaryView' })}</span>
										</button>
									</div>
								)}

								{/* Zoom controls in more menu */}
								{!isVerySmallScreen && (
									<div className="more-menu-section">
										<div className="more-menu-header">Zoom Controls</div>
										<button
											tabIndex={-1}
											className="more-menu-button"
											disabled={!props.enableZoomOut}
											onClick={() => {
												props.onZoomOut();
												setShowMoreMenu(false);
											}}
										>
											<ZoomOut size={16} strokeWidth={1.5} />
											<span>{intl.formatMessage({ id: 'pdfReader.zoomOut' })}</span>
										</button>
										<button
											tabIndex={-1}
											className="more-menu-button"
											disabled={!props.enableZoomIn}
											onClick={() => {
												props.onZoomIn();
												setShowMoreMenu(false);
											}}
										>
											<ZoomIn size={16} strokeWidth={1.5} />
											<span>{intl.formatMessage({ id: 'pdfReader.zoomIn' })}</span>
										</button>
										<button
											tabIndex={-1}
											className="more-menu-button"
											onClick={() => {
												props.onFitToWidth();
												setShowMoreMenu(false);
											}}
										>
											<Maximize size={16} strokeWidth={1.5} />
											<span>{intl.formatMessage({ id: 'pdfReader.fitToWidth' })}</span>
										</button>
									</div>
								)}
							</div>
						)}
					</div>
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
