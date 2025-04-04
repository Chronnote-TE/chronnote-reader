import cx from 'classnames';
import { Columns2, PanelRightClose, RectangleEllipsis, Rows2, X } from 'lucide-react';
import PropTypes from 'prop-types';
import React, { Fragment, useContext } from 'react';
import { useIntl } from 'react-intl';
import { ReaderContext } from '../reader';

function PDFTopbar({ toolbarVisible = true, ...props }) {
    const intl = useIntl();
    const { platform } = useContext(ReaderContext);

    return (
        <div className="pdf-topbar">
            <div className="start">

            </div>
            <div className="center">
                {/* 可以添加中间内容 */}
            </div>
            <div className="end">
                {/* 可以添加左侧按钮 */}
                <button
                    className={cx("topbar-button toggle-toolbar", { "active-pseudo-class-fix": toolbarVisible })}
                    title={intl.formatMessage({ id: 'pdfReader.toggleToolbar' }, { defaultMessage: 'Toggle Toolbar' })}
                    tabIndex={-1}
                    onClick={() => props.onToggleToolbar(!toolbarVisible)}
                ><RectangleEllipsis size={18} strokeWidth={1.5} /></button>
                <button
                    className="topbar-button split"
                    title={intl.formatMessage({ id: 'pdfReader.split' }, { defaultMessage: 'Horizontal Split View' })}
                    tabIndex={-1}
                    onClick={props.onClickSplit}
                ><Rows2 size={18} strokeWidth={1.5} /></button>

                <button
                    className="topbar-button vertical-split"
                    title={intl.formatMessage({ id: 'pdfReader.verticalSplit' }, { defaultMessage: 'Vertical Split View' })}
                    tabIndex={-1}
                    onClick={props.onClickVerticalSplit}
                ><Columns2 size={18} strokeWidth={1.5} /></button>

                <button
                    className="topbar-button close"
                    title={intl.formatMessage({ id: 'pdfReader.close' }, { defaultMessage: 'Close' })}
                    tabIndex={-1}
                    onClick={props.onClickClose}
                ><X size={18} strokeWidth={1.5} /></button>

                {platform === 'zotero' && props.showContextPaneToggle && (
                    <Fragment>
                        <div className="divider" />
                        <button
                            className={cx('topbar-button context-pane-toggle',
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
                    </Fragment>
                )}
            </div>
        </div>
    );
}

PDFTopbar.propTypes = {
    onClickClose: PropTypes.func,
    onClickSplit: PropTypes.func,
    onClickVerticalSplit: PropTypes.func,
    showContextPaneToggle: PropTypes.bool,
    contextPaneOpen: PropTypes.bool,
    onToggleContextPane: PropTypes.func,
    contextPaneType: PropTypes.string,
    toolbarVisible: PropTypes.bool,
    onToggleToolbar: PropTypes.func
};

export default PDFTopbar; 