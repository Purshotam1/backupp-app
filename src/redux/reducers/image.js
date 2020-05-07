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
        case 'IMAGE_INDEX':
        {
            return {
                ...state,
                index: action.payload
            }
        }
        case 'IMAGE_SORT_TYPE':
        {
            return {
                ...state,
                sortType: action.payload
            }
        }
        case 'IMAGE_ORDER':
        {
            return {
                ...state,
                order: action.payload
            }
        }
        case 'IMAGE_SELECT_ALL':
        {
            return {
                ...state,
                selectAll: action.payload
            }
        }
        case 'IMAGE_PROGRESS_BAR':
        {
            return {
                ...state,
                progressBar: action.payload
            }
        }
        case 'IMAGE_DOWNLOADING':
        {
            return {
                ...state,
                downloading: action.payload
            }
        }
        case 'IMAGE_ALERT':
        {
            return {
                ...state,
                alert: action.payload
            }
        }
        case 'IMAGE_ALERT_FILE':
        {
            return {
                ...state,
                alertFile: action.payload
            }
        }
        case 'IMAGE_SELECTED':
        {
            return {
                ...state,
                selected: action.payload
            }
        }
        case 'IMAGE_ALERT_ACTION':
        {
            return {
                ...state,
                alertAction: action.payload
            }
        }
        case 'IMAGE_ALERT_ACTION_FOR_ALL':
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