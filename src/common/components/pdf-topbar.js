import React, { Fragment, useContext } from 'react';
import { useIntl } from 'react-intl';
import cx from 'classnames';
import { Columns2, Rows2, X, PanelRightClose } from 'lucide-react';
import { ReaderContext } from '../reader';

function PDFTopbar(props) {
    const intl = useIntl();
    const { platform } = useContext(ReaderContext);

    return (
        <div className="pdf-topbar">
            <div className="start">
                {/* 可以添加左侧按钮 */}
            </div>
            <div className="center">
                {/* 可以添加中间内容 */}
            </div>
            <div className="end">
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

export default PDFTopbar; 