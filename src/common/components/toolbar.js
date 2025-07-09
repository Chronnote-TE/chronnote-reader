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
import React, { useContext, useEffect, useRef, useState, Fragment } from 'react';
import { Localized, useLocalization } from "@fluent/react";
import { ReaderContext } from '../reader';
import CustomSections from './common/custom-sections';
import './toolbar.css';

// 自定义 hooks
function useResponsiveDesign() {
	const [isSmallScreen, setIsSmallScreen] = useState(false);
	const [isVerySmallScreen, setIsVerySmallScreen] = useState(false);

	useEffect(() => {
		const checkScreenWidth = () => {
			const verySmallScreenThreshold = 500;
			const smallScreenThreshold = 768;

			setIsVerySmallScreen(window.innerWidth < verySmallScreenThreshold);
			setIsSmallScreen(window.innerWidth < smallScreenThreshold);
		};

		checkScreenWidth();
		window.addEventListener('resize', checkScreenWidth);

		return () => {
			window.removeEventListener('resize', checkScreenWidth);
		};
	}, []);

	return { isSmallScreen, isVerySmallScreen };
}

function useMoreMenu() {
	const [showMoreMenu, setShowMoreMenu] = useState(false);
	const moreMenuRef = useRef();

	useEffect(() => {
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

	return { showMoreMenu, setShowMoreMenu, moreMenuRef };
}

// 子组件
function ToolbarButton({ icon: Icon, onClick, title, active, disabled, className, ...props }) {
	return (
		<button
			className={cx('toolbar-button', className, { active })}
			title={title}
			tabIndex={-1}
			disabled={disabled}
			onClick={onClick}
			{...props}
		>
			<Icon />
		</button>
	);
}

function ZoomControls({ enableZoomOut, onZoomOut, enableZoomIn, onZoomIn, enableZoomReset, onZoomReset }) {
	const { l10n } = useLocalization();

	return (
		<div className="zoom-controls">
			<ToolbarButton
				id="zoomOut"
				icon={ZoomOut}
				title={l10n.getString('pdfReader-zoomOut')}
				disabled={!enableZoomOut}
				onClick={onZoomOut}
				className="zoomOut"
			/>
			<ToolbarButton
				id="zoomIn"
				icon={ZoomIn}
				title={l10n.getString('pdfReader-zoomIn')}
				disabled={!enableZoomIn}
				onClick={onZoomIn}
				className="zoomIn"
			/>
			<ToolbarButton
				id="zoomAuto"
				icon={Maximize}
				title={l10n.getString('reader-zoom-reset')}
				disabled={!enableZoomReset}
				onClick={onZoomReset}
				className="zoomAuto"
			/>
		</div>
	);
}

function AnnotationTools({ tool, readOnly, onToolClick }) {
	const { l10n } = useLocalization();

	return (
		<div className="annotation-tools">
			<ToolbarButton
				icon={Highlighter}
				title={l10n.getString('pdfReader-highlightText')}
				active={tool.type === 'highlight'}
				disabled={readOnly}
				onClick={() => onToolClick('highlight')}
				className="highlight"
				data-l10n-id="pdfReader-toolbar-highlight"
			/>
			<ToolbarButton
				icon={Underline}
				title={l10n.getString('pdfReader-underlineText')}
				active={tool.type === 'underline'}
				disabled={readOnly}
				onClick={() => onToolClick('underline')}
				className="underline"
				data-l10n-id="pdfReader-toolbar-underline"
			/>
			<ToolbarButton
				icon={StickyNote}
				title={l10n.getString('pdfReader-addNote')}
				active={tool.type === 'note'}
				disabled={readOnly}
				onClick={() => onToolClick('note')}
				className="note"
				data-l10n-id="pdfReader-toolbar-note"
			/>
		</div>
	);
}

function PdfTools({ tool, readOnly, onToolClick }) {
	const { l10n } = useLocalization();

	return (
		<div className="pdf-tools">
			<ToolbarButton
				icon={Type}
				title={l10n.getString('pdfReader-addText')}
				active={tool.type === 'text'}
				disabled={readOnly}
				onClick={() => onToolClick('text')}
				className="text"
				data-l10n-id="pdfReader-toolbar-text"
			/>
			<ToolbarButton
				icon={ImagePlus}
				title={l10n.getString('pdfReader-selectArea')}
				active={tool.type === 'image'}
				disabled={readOnly}
				onClick={() => onToolClick('image')}
				className="area"
				data-l10n-id="pdfReader-toolbar-area"
			/>
			<ToolbarButton
				icon={Pencil}
				title={l10n.getString('pdfReader-draw')}
				active={['ink', 'eraser'].includes(tool.type)}
				disabled={readOnly}
				onClick={() => onToolClick('ink')}
				className="ink"
				data-l10n-id="pdfReader-toolbar-draw"
			/>
		</div>
	);
}

function ColorPicker({ tool, readOnly, onColorClick }) {
	const { l10n } = useLocalization();

	return (
		<button
			className="toolbar-button toolbar-dropdown-button"
			tabIndex={-1}
			disabled={readOnly || ['pointer', 'hand'].includes(tool.type)}
			title={l10n.getString('pdfReader-pickColor')}
			onClick={onColorClick}
		>
			{tool.type === 'eraser' ? (
				<Eraser />
			) : (
				<div
					className="color-picker-indicator"
					style={{
						backgroundColor: tool.color || 'transparent',
					}}
				/>
			)}
			<ChevronDown />
		</button>
	);
}

function PageControls({ type, pageInputRef, pageLabel, pageIndex, pagesCount, usePhysicalPageNumbers, onPageNumberKeydown, onPageNumberBlur }) {
	const { l10n } = useLocalization();

	if (!['pdf', 'epub'].includes(type)) return null;

	return (
		<div className="page-controls">
			<input
				ref={pageInputRef}
				type="input"
				id="pageNumber"
				className="toolbar-text-input"
				title={l10n.getString(
					type === 'pdf' || usePhysicalPageNumbers
						? 'pdfReader-page'
						: 'pdfReader-location'
				)}
				defaultValue=""
				size="4"
				min="1"
				tabIndex={-1}
				autoComplete="off"
				onKeyDown={onPageNumberKeydown}
				onBlur={onPageNumberBlur}
			/>
			{pageLabel && (
				<span id="numPages">
					&nbsp;<div>
						{!(type === 'pdf' && pageIndex + 1 == pageLabel) && (pageIndex + 1)} / {pagesCount}
					</div>
				</span>
			)}
		</div>
	);
}

function MoreMenuSection({ title, children }) {
	return (
		<div className="more-menu-section">
			<div className="more-menu-header">{title}</div>
			{children}
		</div>
	);
}

function MoreMenuButton({ icon: Icon, children, active, onClick, disabled }) {
	return (
		<button
			className={cx('more-menu-button', { active })}
			disabled={disabled}
			onClick={onClick}
		>
			<Icon size={16} />
			<span>{children}</span>
		</button>
	);
}

function MoreMenu({
	show,
	menuRef,
	tool,
	type,
	readOnly,
	onToolClick,
	onZoomOut,
	onZoomIn,
	onZoomReset,
	enableZoomOut,
	enableZoomIn,
	enableZoomReset,
	pageLabel,
	pageIndex,
	pagesCount,
	onChangePageNumber,
	shouldShowAnnotationToolsInMoreMenu,
	shouldShowPdfToolsInMoreMenu,
	shouldShowPageControlsInMoreMenu,
	shouldShowZoomInMoreMenu,
	onCloseMenu
}) {
	if (!show) return null;

	const handleMenuItemClick = (action) => {
		action();
		onCloseMenu();
	};

	return (
		<div ref={menuRef} className={cx('more-menu', { show })}>
			{shouldShowAnnotationToolsInMoreMenu && (
				<MoreMenuSection title="标注工具">
					<MoreMenuButton
						icon={Highlighter}
						active={tool.type === 'highlight'}
						disabled={readOnly}
						onClick={() => handleMenuItemClick(() => onToolClick('highlight'))}
					>
						高亮
					</MoreMenuButton>
					<MoreMenuButton
						icon={Underline}
						active={tool.type === 'underline'}
						disabled={readOnly}
						onClick={() => handleMenuItemClick(() => onToolClick('underline'))}
					>
						下划线
					</MoreMenuButton>
					<MoreMenuButton
						icon={StickyNote}
						active={tool.type === 'note'}
						disabled={readOnly}
						onClick={() => handleMenuItemClick(() => onToolClick('note'))}
					>
						便笺
					</MoreMenuButton>
				</MoreMenuSection>
			)}

			{shouldShowPdfToolsInMoreMenu && type === 'pdf' && (
				<MoreMenuSection title="PDF工具">
					<MoreMenuButton
						icon={Type}
						active={tool.type === 'text'}
						disabled={readOnly}
						onClick={() => handleMenuItemClick(() => onToolClick('text'))}
					>
						文本
					</MoreMenuButton>
					<MoreMenuButton
						icon={ImagePlus}
						active={tool.type === 'image'}
						disabled={readOnly}
						onClick={() => handleMenuItemClick(() => onToolClick('image'))}
					>
						选择区域
					</MoreMenuButton>
					<MoreMenuButton
						icon={Pencil}
						active={['ink', 'eraser'].includes(tool.type)}
						disabled={readOnly}
						onClick={() => handleMenuItemClick(() => onToolClick('ink'))}
					>
						绘图
					</MoreMenuButton>
				</MoreMenuSection>
			)}

			{shouldShowZoomInMoreMenu && (
				<MoreMenuSection title="缩放控制">
					<MoreMenuButton
						icon={ZoomOut}
						disabled={!enableZoomOut}
						onClick={() => handleMenuItemClick(onZoomOut)}
					>
						缩小
					</MoreMenuButton>
					<MoreMenuButton
						icon={ZoomIn}
						disabled={!enableZoomIn}
						onClick={() => handleMenuItemClick(onZoomIn)}
					>
						放大
					</MoreMenuButton>
					<MoreMenuButton
						icon={Maximize}
						disabled={!enableZoomReset}
						onClick={() => handleMenuItemClick(onZoomReset)}
					>
						重置
					</MoreMenuButton>
				</MoreMenuSection>
			)}

			{shouldShowPageControlsInMoreMenu && ['pdf', 'epub'].includes(type) && (
				<MoreMenuSection title="页面控制">
					<div className="page-controls-in-menu">
						<input
							type="number"
							min="1"
							max={pagesCount}
							value={pageLabel ?? (pageIndex + 1)}
							onChange={(e) => onChangePageNumber(e.target.value)}
						/>
						<span>/ {pagesCount}</span>
					</div>
				</MoreMenuSection>
			)}
		</div>
	);
}

// 主组件
function Toolbar({ visible = true, ...props }) {
	const { l10n } = useLocalization();
	const { platform } = useContext(ReaderContext);
	const toolbarRef = useRef();
	const pageInputRef = useRef();
	const { isSmallScreen, isVerySmallScreen } = useResponsiveDesign();
	const { showMoreMenu, setShowMoreMenu, moreMenuRef } = useMoreMenu();

	// 计算响应式显示逻辑
	const shouldShowPdfToolsInMoreMenu = isSmallScreen;
	const shouldShowAnnotationToolsInMoreMenu = isVerySmallScreen;
	const shouldShowPageControlsInMoreMenu = isVerySmallScreen;
	const shouldShowMoreButton = isSmallScreen;
	const shouldShowZoomInMoreMenu = isSmallScreen;

	// 页面输入框更新
	useEffect(() => {
		if (['pdf', 'epub'].includes(props.type)) {
			if (pageInputRef.current) {
				pageInputRef.current.value = props.pageLabel ?? (props.pageIndex + 1);
			}
		}
	}, [props.pageLabel, props.pageIndex]);

	// 事件处理函数
	const handleSidebarButtonClick = () => {
		props.onToggleSidebar(!props.sidebarOpen);
	};

	const handleToolColorClick = (event) => {
		const br = event.currentTarget.getBoundingClientRect();
		props.onOpenColorContextMenu({ x: br.left, y: br.bottom });
	};

	const handleFindClick = () => {
		props.onToggleFind();
	};

	const handleToolClick = (type) => {
		if (props.tool.type === type) {
			type = 'pointer';
		}
		if (type === 'ink' && ['ink', 'eraser'].includes(props.tool.type)) {
			type = 'pointer';
		}
		props.onChangeTool({ type });
	};

	const handlePageNumberKeydown = (event) => {
		if (event.key === 'Enter') {
			props.onChangePageNumber(event.target.value);
		}
	};

	const handlePageNumberBlur = (event) => {
		if (event.target.value != (props.pageLabel ?? (props.pageIndex + 1))) {
			props.onChangePageNumber(event.target.value);
		}
	};

	const handleMoreButtonClick = () => {
		setShowMoreMenu(!showMoreMenu);
	};

	return (
		<div
			ref={toolbarRef}
			className={cx('toolbar', {
				'small-screen': isSmallScreen,
				'very-small-screen': isVerySmallScreen
			})}
			data-tabstop={1}
			role="application"
			style={{ display: visible ? 'flex' : 'none' }}
		>
			{/* 左侧工具栏 */}
			<div className="start">
				{/* 缩放控件 - 在小屏幕上移到更多菜单中 */}
				<ZoomControls
					enableZoomOut={props.enableZoomOut}
					onZoomOut={props.onZoomOut}
					enableZoomIn={props.enableZoomIn}
					onZoomIn={props.onZoomIn}
					enableZoomReset={props.enableZoomReset}
					onZoomReset={props.onZoomReset}
				/>
				<div className="divider" />

				<ToolbarButton
					id="screenshot"
					icon={Sparkles}
					title={l10n.getString('pdfReader-screenshot')}
					active={props.tool.type === 'screenshot'}
					disabled={props.readOnly}
					onClick={() => handleToolClick('screenshot')}
				/>
				<div className="divider" />
				<ToolbarButton
					id="navigateBack"
					icon={ChevronLeft}
					title={l10n.getString('general-back')}
					disabled={!props.enableNavigateBack}
					onClick={props.onNavigateBack}
					className="navigateBack"
				/>
				<div className="divider" />

				{/* 页面控制 - 在很小屏幕上隐藏 */}
				<PageControls
					type={props.type}
					pageInputRef={pageInputRef}
					pageLabel={props.pageLabel}
					pageIndex={props.pageIndex}
					pagesCount={props.pagesCount}
					usePhysicalPageNumbers={props.usePhysicalPageNumbers}
					onPageNumberKeydown={handlePageNumberKeydown}
					onPageNumberBlur={handlePageNumberBlur}
				/>
			</div>

			{/* 中间工具栏 */}
			<div className="center tools">
				{/* 注释工具 - 在很小屏幕上隐藏 */}
				<AnnotationTools
					tool={props.tool}
					readOnly={props.readOnly}
					onToolClick={handleToolClick}
				/>

				{/* PDF工具 - 在小屏幕上隐藏 */}
				{props.type === 'pdf' && (
					<PdfTools
						tool={props.tool}
						readOnly={props.readOnly}
						onToolClick={handleToolClick}
					/>
				)}

				<div className="divider" />

				{/* 颜色选择器 */}
				<ColorPicker
					tool={props.tool}
					readOnly={props.readOnly}
					onColorClick={handleToolColorClick}
				/>
			</div>

			{/* 右侧工具栏 */}
			<div className="end">
				<CustomSections type="Toolbar" />

				{/* 更多菜单按钮 */}
				{shouldShowMoreButton && (
					<div className="more-menu-container">
						<ToolbarButton
							icon={MoreHorizontal}
							title="更多选项"
							active={showMoreMenu}
							onClick={handleMoreButtonClick}
							className="more-button"
						/>
						<MoreMenu
							show={showMoreMenu}
							menuRef={moreMenuRef}
							tool={props.tool}
							type={props.type}
							readOnly={props.readOnly}
							onToolClick={handleToolClick}
							onZoomOut={props.onZoomOut}
							onZoomIn={props.onZoomIn}
							onZoomReset={props.onZoomReset}
							enableZoomOut={props.enableZoomOut}
							enableZoomIn={props.enableZoomIn}
							enableZoomReset={props.enableZoomReset}
							pageLabel={props.pageLabel}
							pageIndex={props.pageIndex}
							pagesCount={props.pagesCount}
							onChangePageNumber={props.onChangePageNumber}
							shouldShowAnnotationToolsInMoreMenu={shouldShowAnnotationToolsInMoreMenu}
							shouldShowPdfToolsInMoreMenu={shouldShowPdfToolsInMoreMenu}
							shouldShowPageControlsInMoreMenu={shouldShowPageControlsInMoreMenu}
							shouldShowZoomInMoreMenu={shouldShowZoomInMoreMenu}
							onCloseMenu={() => setShowMoreMenu(false)}
						/>
					</div>
				)}

				<ToolbarButton
					icon={Search}
					title={l10n.getString('pdfReader-findInDocument')}
					active={props.findPopupOpen}
					onClick={handleFindClick}
					className="find"
				/>

				{platform === 'zotero' && props.showContextPaneToggle && (
					<Fragment>
						<div className="divider" />
						<ToolbarButton
							icon={props.stackedView ? PanelBottom : PanelLeft}
							title={l10n.getString('pdfReader-toggleContextPane')}
							onClick={props.onToggleContextPane}
							className={cx('context-pane-toggle', { 'standard-view': !props.stackedView })}
						/>
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
	askAIPopup: PropTypes.bool,
	onToggleAskAIPopup: PropTypes.func,
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
	visible: PropTypes.bool,
	stackedView: PropTypes.bool
};

export default Toolbar;
