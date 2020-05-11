export function setDocumentIndex (index) {
    return (dispatch) => {
        dispatch({
            type: 'DOCUMENT_INDEX',
            payload: index
        })
    }
}

export function setDocumentSortType (arg) {
    return (dispatch) => {
        dispatch({
            type: 'DOCUMENT_SORT_TYPE',
            payload: arg
        })
    }
}

export function setDocumentOrder (arg) {
    return (dispatch) => {
        dispatch({
            type: 'DOCUMENT_ORDER',
            payload: arg
        })
    }
}

export function setDocumentSelectAll (arg) {
    return (dispatch) => {
        dispatch({
            type: 'DOCUMENT_SELECT_ALL',
            payload: arg
        })
    }
}

export function setDocumentProgressBar (arg) {
    return (dispatch) => {
        dispatch({
            type: 'DOCUMENT_PROGRESS_BAR',
            payload: arg
        })
    }
}

export function setDocumentDownloading (arg) {
    return (dispatch) => {
        dispatch({
            type: 'DOCUMENT_DOWNLOADING',
            payload: arg
        })
    }
}

export function setDocumentAlert (arg) {
    return (dispatch) => {
        dispatch({
            type: 'DOCUMENT_ALERT',
            payload: arg
        })
    }
}

export function setDocumentAlertFile (arg) {
    return (dispatch) => {
        dispatch({
            type: 'DOCUMENT_ALERT_FILE',
            payload: arg
        })
    }
}

export function setDocumentSelected (arg) {
    return (dispatch) => {
        dispatch({
            type: 'DOCUMENT_SELECTED',
            payload: arg
        })
    }
}

export function setDocumentAlertAction (arg) {
    return (dispatch) => {
        dispatch({
            type: 'DOCUMENT_ALERT_ACTION',
            payload: arg
        })
    }
}

export function setDocumentAlertActionForAll (arg) {
    return (dispatch) => {
        dispatch({
            type: 'DOCUMENT_ALERT_ACTION_FOR_ALL',
            payload: arg
        })
    }
}

export function setDocumentReset () {
    return (dispatch) => {
        dispatch({
            type: 'DOCUMENT_RESET',
        })
    }
}