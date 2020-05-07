let initialState = {
    index: 1,
    sortType: 0,
    order: true,
    selectAll: false,
    progressBar: 0,
    downloading: false,
    alert: false,
    alertFile: '',
    selected: [],
    alertAction: null,
    alertActionForAll: false
};

export default (state=initialState, action) => {
    switch(action.type) {
        case 'DOCUMENT_INDEX':
        {
            return {
                ...state,
                index: action.payload
            }
        }
        case 'DOCUMENT_SORT_TYPE':
        {
            return {
                ...state,
                sortType: action.payload
            }
        }
        case 'DOCUMENT_ORDER':
        {
            return {
                ...state,
                order: action.payload
            }
        }
        case 'DOCUMENT_SELECT_ALL':
        {
            return {
                ...state,
                selectAll: action.payload
            }
        }
        case 'DOCUMENT_PROGRESS_BAR':
        {
            return {
                ...state,
                progressBar: action.payload
            }
        }
        case 'DOCUMENT_DOWNLOADING':
        {
            return {
                ...state,
                downloading: action.payload
            }
        }
        case 'DOCUMENT_ALERT':
        {
            return {
                ...state,
                alert: action.payload
            }
        }
        case 'DOCUMENT_ALERT_FILE':
        {
            return {
                ...state,
                alertFile: action.payload
            }
        }
        case 'DOCUMENT_SELECTED':
        {
            return {
                ...state,
                selected: action.payload
            }
        }
        case 'DOCUMENT_ALERT_ACTION':
        {
            return {
                ...state,
                alertAction: action.payload
            }
        }
        case 'DOCUMENT_ALERT_ACTION_FOR_ALL':
        {
            return {
                ...state,
                alertActionForAll: action.payload
            }
        }
        default:
            return state
    }
}