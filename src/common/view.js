import EPUBView from '../dom/epub/epub-view';
import SnapshotView from '../dom/snapshot/snapshot-view';
import { debounce } from './lib/debounce';
import AnnotationManager from './annotation-manager';
import { DEBOUNCE_STATE_CHANGE, DEBOUNCE_STATS_CHANGE } from './defines';

let nop = () => undefined;

class View {
	constructor(options) {
		this._type = options.type;
		this._options = options;
		this._view = this._createView();
		this._annotationManager = new AnnotationManager({
			readOnly: options.readOnly,
			annotations: options.annotations,
			onSave: options.onSaveAnnotations,
			onDelete: nop,
			onRender: (annotations) => {
				this._view.setAnnotations(annotations);
			},
			onChangeFilter: nop
		});
	}

	_ensureType() {
		if (!Array.from(arguments).includes(this._type)) {
			throw new Error(`The operation is not supported for '${this._type}'`);
		}
	}

	_createView() {
		let onAddAnnotation = async (annotation) => {
			await this._annotationManager.addAnnotation(annotation);
		};

		let onUpdateAnnotations = (annotations) => {
			this._annotationManager.updateAnnotations(annotations);
		};

		let onSetFindState = (params) => {
			this._options.onFindResult(params.result);
		};

		// This is quite hacky, but this way we enable search functionality over the existing findState
		let findState = {
			open: !!this._options.findParams,
			query: '',
			highlightAll: true,
			caseSensitive: false,
			entireWord: false,
			resultsCount: null,
			resultIndex: 0,
			// View can be created with an active search
			...(this._options.findParams || {})
		};

		let common = {
			primary: true,
			mobile: true,
			showAnnotations: true,
			container: this._options.container,
			data: this._options.data,
			tool: this._options.tool || { type: 'pointer' },
			selectedAnnotationIDs: this._options.selectedAnnotationIDs || [],
			annotations: this._options.annotations || [],
			findState,
			viewState: this._options.viewState || null,
			location: this._options.location || null,
			onChangeViewState: debounce(this._options.onChangeViewState, DEBOUNCE_STATE_CHANGE),
			onChangeViewStats: debounce(this._options.onChangeViewStats, DEBOUNCE_STATS_CHANGE),
			onAddAnnotation,
			onUpdateAnnotations,
			onOpenLink: this._options.onOpenLink,
			onSetSelectionPopup: this._options.onSetSelectionPopup,
			onSetAnnotationPopup: this._options.onSetAnnotationPopup,
			onSetFindState,
			onSelectAnnotations: this._options.onSelectAnnotations,
			onSetDataTransferAnnotations: nop,
			onFocus: nop,
			onOpenAnnotationContextMenu: nop,
			onOpenViewContextMenu: nop,
			onSetOverlayPopup: nop,
			onTabOut: nop,
			onKeyDown: nop
		};

		if (this._type === 'epub') {
			return new EPUBView({
				...common,
				onSetOutline: this._options.onSetOutline,
			});
		} else if (this._type === 'snapshot') {
			return new SnapshotView({
				...common
			});
		}
		throw new Error('Invalid view type');
	}

	/**
	 * Add/replace annotations in the view
	 * @param annotations
	 */
	setAnnotations(annotations) {
		this._annotationManager.setAnnotations(annotations);
	}

	// Remove annotations from the view
	unsetAnnotations(ids) {
		this._annotationManager.unsetAnnotations(ids);
	}

	/**
	 * @param {String} params.query
	 * @param {String} params.highlightAll
	 * @param {String} params.caseSensitive
	 * @param {String} params.entireWord
	 * @param {String} params.index Focus specific result
	 */
	find(params) {
		this._view.setFindState({
			active: !!params,
			query: '',
			highlightAll: true,
			caseSensitive: false,
			entireWord: false,
			...(params || {})
		});
	}

	findNext() {
		this._view.findNext();
	}

	findPrevious() {
		this._view.findPrevious();
	}

	/**
	 * Set/unset annotation tool
	 *
	 * @param {Object|undefined} tool Examples: { type: 'highlight', color: '#ffd400' }, or undefined to deactivate the tool
	 */
	setTool(tool) {
		if (!tool) {
			tool = { type: 'pointer' };
		}
		this._view.setTool(tool);
	}

	/**
	 * @param {Array} ids Array of annotation ids (item keys)
	 */
	selectAnnotations(ids) {
		this._view.setSelectedAnnotationIDs(ids);
	}

	zoomIn() {
		this._view.zoomIn();
	}

	zoomOut() {
		this._view.zoomOut();
	}

	zoomReset() {
		this._view.zoomReset();
	}

	navigate(location) {
		this._view.navigate(location);
	}

	/**
	 * Navigate to the previous position in the document
	 */
	navigateBack() {
		this._view.navigateBack();
	}

	/**
	 * Navigate to the latest position in the document
	 */
	navigateForward() {
		this._view.navigateForward();
	}

	/**
	 * Change flow mode
	 * @param mode paginated|scrolled
	 */
	setFlowMode(mode) {
		this._ensureType('epub');
		this._view.setFlowMode(mode);
	}
}

export default View;
