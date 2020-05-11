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
        case 'SONG_INDEX':
        {
            return {
                ...state,
                index: action.payload
            }
        }
        case 'SONG_SORT_TYPE':
        {
            return {
                ...state,
                sortType: action.payload
            }
        }
        case 'SONG_ORDER':
        {
            return {
                ...state,
                order: action.payload
            }
        }
        case 'SONG_SELECT_ALL':
        {
            return {
                ...state,
                selectAll: action.payload
            }
        }
        case 'SONG_PROGRESS_BAR':
        {
            return {
                ...state,
                progressBar: action.payload
            }
        }
        case 'SONG_DOWNLOADING':
        {
            return {
                ...state,
                downloading: action.payload
            }
        }
        case 'SONG_ALERT':
        {
            return {
                ...state,
                alert: action.payload
            }
        }
        case 'SONG_ALERT_FILE':
        {
            return {
                ...state,
                alertFile: action.payload
            }
        }
        case 'SONG_SELECTED':
        {
            return {
                ...state,
                selected: action.payload
            }
        }
        case 'SONG_ALERT_ACTION':
        {
            return {
                ...state,
                alertAction: action.payload
            }
        }
        case 'SONG_ALERT_ACTION_FOR_ALL':
        {
            return {
                ...state,
                alertActionForAll: action.payload
            }
        }
        case 'SONG_RESET':
        {
            return {
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
            }
        }
        default:
            return state
    }
}