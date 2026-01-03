import cx from 'classnames';
import {
	ChevronLeft,
	ChevronRight,
	MoreHorizontal,
	Undo2
} from 'lucide-react';
import {
	PiTextUnderline,
	PiEraser,
	PiMagnifyingGlassPlus,
	PiMagnifyingGlassMinus,
	PiArrowsOutSimple, // Fit Width
	PiArrowCounterClockwise,
	PiArrowClockwise
} from 'react-icons/pi';
import { FaHighlighter } from 'react-icons/fa';
import { GoPencil } from 'react-icons/go';

import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { ReaderContext } from '../reader';
import CustomSections from './common/custom-sections';
import { IconColor20 } from './common/icons';
import './toolbar.css';

// 统一控制 toolbar 图标的视觉风格 - Design Master Tuned
const ICON_SIZE = 20; // Phosphor icons look best slightly larger (20px) 

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
				!event.target.closest('.dock-button.mobile-more')) {
				setShowMoreMenu(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	function handleSidebarButtonClick(_event) {
		props.onToggleSidebar(!props.sidebarOpen);
	}

	function handleToolColorClick(event) {
		// 如果当前工具不支持颜色，给出提示
		if (!props.tool.color) {
			const message = intl.formatMessage({
				id: 'pdfReader.pickColorNoTool',
				defaultMessage: 'Please select a tool first.'
			});
			toast(message, { icon: 'ℹ️' });
			return;
		}

		let br = event.currentTarget.getBoundingClientRect();
		// Adjusted for Floating Dock: Pop UP instead of Drop Down
		props.onOpenColorContextMenu({ x: br.left, y: br.top - 8 });
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

	// --------------------------------------------------------------------------
	// Design Master Implementation: The Floating Dock
	// --------------------------------------------------------------------------
	return (
		<div
			className={cx("toolbar-dock-container", { "mobile-mode": isVerySmallScreen })}
			role="application"
			ref={toolbarRef}
			data-tabstop={1}
		>
			{/* --- Island 1: Navigation --- */}
			<div className="dock-island nav-island">
				{/* Sidebar Toggle - REMOVED per design request */}

				{/* Back Button (if enabled) */}
				{props.enableNavigateBack && (
					<button className="dock-button" onClick={props.onNavigateBack} title={intl.formatMessage({ id: 'pdfReader.navigateBack' })}>
						<Undo2 size={18} strokeWidth={1.7} />
					</button>
				)}

				<div className="dock-divider" />

				{['pdf', 'epub'].includes(props.type) && (
					<>
						<button
							className="dock-button"
							disabled={!props.enableNavigateToPreviousPage}
							onClick={props.onNavigateToPreviousPage}
							title={intl.formatMessage({ id: 'pdfReader.previousPage' })}
						>
							<ChevronLeft size={20} strokeWidth={1.7} />
						</button>

						<div className="page-info-pill">
							<input
								ref={pageInputRef}
								className="dock-input"
								defaultValue=""
								onKeyDown={handlePageNumberKeydown}
								onBlur={handlePageNumberBlur}
								autoComplete="off"
							/>
							<span className="page-count">/ {props.pagesCount}</span>
						</div>

						<button
							className="dock-button"
							disabled={!props.enableNavigateToNextPage}
							onClick={props.onNavigateToNextPage}
							title={intl.formatMessage({ id: 'pdfReader.nextPage' })}
						>
							<ChevronRight size={20} strokeWidth={1.7} />
						</button>
					</>
				)}
			</div>

			{/* --- Island 2: Tools (Hidden on very small screens) --- */}
			{!isVerySmallScreen && (
				<div className="dock-island tools-island">
					<button
						className={cx('dock-button', { active: props.tool.type === 'highlight' })}
						onClick={() => handleToolClick('highlight')}
						title={intl.formatMessage({ id: 'pdfReader.highlightText' })}
					>
						<FaHighlighter size={18} />
					</button>
					<button
						className={cx('dock-button', { active: props.tool.type === 'underline' })}
						onClick={() => handleToolClick('underline')}
						title={intl.formatMessage({ id: 'pdfReader.underlineText' })}
					>
						<PiTextUnderline size={ICON_SIZE} />
					</button>

					{/* Color Picker triggers context menu */}
					<button
						className="dock-button color-trigger"
						onClick={handleToolColorClick}
						title={intl.formatMessage({ id: 'pdfReader.pickColor' })}
					>
						<IconColor20 color={props.tool.color || '#ffeb3b'} />
					</button>

					{props.type === 'pdf' && (
						<>
							<div className="dock-divider" />
							<button
								className={cx('dock-button', { active: props.tool.type === 'ink' })}
								onClick={() => handleToolClick('ink')}
								title={intl.formatMessage({ id: 'pdfReader.draw' })}
							>
								<GoPencil size={ICON_SIZE} />
							</button>
							<button
								className={cx('dock-button', { active: props.tool.type === 'eraser' })}
								onClick={() => handleToolClick('eraser')}
								title={intl.formatMessage({ id: 'pdfReader.eraser' })}
							>
								<PiEraser size={ICON_SIZE} />
							</button>
						</>
					)}
				</div>
			)}

			{/* --- Island 3: View Controls (Hidden on small screens) --- */}
			{!isSmallScreen && (
				<div className="dock-island view-island">
					<button className="dock-button" disabled={!props.enableZoomOut} onClick={props.onZoomOut} title={intl.formatMessage({ id: 'pdfReader.zoomOut' })}>
						<PiMagnifyingGlassMinus size={ICON_SIZE} />
					</button>
					<button className="dock-button" disabled={!props.enableZoomIn} onClick={props.onZoomIn} title={intl.formatMessage({ id: 'pdfReader.zoomIn' })}>
						<PiMagnifyingGlassPlus size={ICON_SIZE} />
					</button>
					<button className="dock-button" onClick={props.onFitToWidth} title={intl.formatMessage({ id: 'pdfReader.fitToWidth' })}>
						<PiArrowsOutSimple size={ICON_SIZE} />
					</button>

					{props.type === 'pdf' && (
						<>
							<div className="dock-divider" />
							<button className="dock-button" onClick={props.onRotatePageLeft} title={intl.formatMessage({ id: 'pdfReader.rotateLeft' })}>
								<PiArrowCounterClockwise size={ICON_SIZE} />
							</button>
							<button className="dock-button" onClick={props.onRotatePageRight} title={intl.formatMessage({ id: 'pdfReader.rotateRight' })}>
								<PiArrowClockwise size={ICON_SIZE} />
							</button>
						</>
					)}
				</div>
			)}

			<CustomSections type="Toolbar" />

			{/* Mobile / More Menu Button */}
			{(isSmallScreen || isVerySmallScreen) && (
				<div className="dock-island mobile-island">
					<button className="dock-button mobile-more" onClick={toggleMoreMenu}>
						<MoreHorizontal size={20} strokeWidth={1.7} />
					</button>
					{showMoreMenu && (
						<div className="dock-popup-menu" ref={moreMenuRef}>
							{/* Simplified Menu for Mobile */}
							<div className="menu-header">View</div>
							<div className="menu-row">
								<button className="menu-item" onClick={props.onZoomIn}>
									<PiMagnifyingGlassPlus size={16} /> <span>Zoom In</span>
								</button>
								<button className="menu-item" onClick={props.onZoomOut}>
									<PiMagnifyingGlassMinus size={16} /> <span>Zoom Out</span>
								</button>
							</div>
							<div className="menu-row">
								<button className="menu-item" onClick={props.onFitToWidth}>
									<PiArrowsOutSimple size={16} /> <span>Fit Width</span>
								</button>
							</div>

							{props.type === 'pdf' && (
								<>
									<div className="menu-divider" />
									<div className="menu-header">Actions</div>
									<div className="menu-row">
										<button className="menu-item" onClick={props.onRotatePageRight}>
											<PiArrowClockwise size={16} /> <span>Rotate</span>
										</button>
										<button className="menu-item" onClick={() => handleToolClick('ink')}>
											<GoPencil size={16} /> <span>Draw</span>
										</button>
									</div>
								</>
							)}
						</div>
					)}
				</div>
			)}
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
	onSendToAI: PropTypes.func,
	visible: PropTypes.bool,
	onRotatePageLeft: PropTypes.func,
	onRotatePageRight: PropTypes.func
};

export default Toolbar;
