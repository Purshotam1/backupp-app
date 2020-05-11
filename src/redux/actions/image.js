export function setImageIndex (index) {
    return (dispatch) => {
        dispatch({
            type: 'IMAGE_INDEX',
            payload: index
        })
    }
}

export function setImageSortType (arg) {
    return (dispatch) => {
        dispatch({
            type: 'IMAGE_SORT_TYPE',
            payload: arg
        })
    }
}

export function setImageOrder (arg) {
    return (dispatch) => {
        dispatch({
            type: 'IMAGE_ORDER',
            payload: arg
        })
    }
}

export function setImageSelectAll (arg) {
    return (dispatch) => {
        dispatch({
            type: 'IMAGE_SELECT_ALL',
            payload: arg
        })
    }
}

export function setImageProgressBar (arg) {
    return (dispatch) => {
        dispatch({
            type: 'IMAGE_PROGRESS_BAR',
            payload: arg
        })
    }
}

export function setImageDownloading (arg) {
    return (dispatch) => {
        dispatch({
            type: 'IMAGE_DOWNLOADING',
            payload: arg
        })
    }
}

export function setImageAlert (arg) {
    return (dispatch) => {
        dispatch({
            type: 'IMAGE_ALERT',
            payload: arg
        })
    }
}

export function setImageAlertFile (arg) {
    return (dispatch) => {
        dispatch({
            type: 'IMAGE_ALERT_FILE',
            payload: arg
        })
    }
}

export function setImageSelected (arg) {
    return (dispatch) => {
        dispatch({
            type: 'IMAGE_SELECTED',
            payload: arg
        })
    }
}

export function setImageAlertAction (arg) {
    return (dispatch) => {
        dispatch({
            type: 'IMAGE_ALERT_ACTION',
            payload: arg
        })
    }
}

export function setImageAlertActionForAll (arg) {
    return (dispatch) => {
        dispatch({
            type: 'IMAGE_ALERT_ACTION_FOR_ALL',
            payload: arg
        })
    }
}

export function setImageReset () {
    return (dispatch) => {
        dispatch({
            type: 'IMAGE_RESET'
        })
    }
}