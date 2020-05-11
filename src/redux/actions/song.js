export function setSongIndex (index) {
    return (dispatch) => {
        dispatch({
            type: 'SONG_INDEX',
            payload: index
        })
    }
}

export function setSongSortType (arg) {
    return (dispatch) => {
        dispatch({
            type: 'SONG_SORT_TYPE',
            payload: arg
        })
    }
}

export function setSongOrder (arg) {
    return (dispatch) => {
        dispatch({
            type: 'SONG_ORDER',
            payload: arg
        })
    }
}

export function setSongSelectAll (arg) {
    return (dispatch) => {
        dispatch({
            type: 'SONG_SELECT_ALL',
            payload: arg
        })
    }
}

export function setSongProgressBar (arg) {
    return (dispatch) => {
        dispatch({
            type: 'SONG_PROGRESS_BAR',
            payload: arg
        })
    }
}

export function setSongDownloading (arg) {
    return (dispatch) => {
        dispatch({
            type: 'SONG_DOWNLOADING',
            payload: arg
        })
    }
}

export function setSongAlert (arg) {
    return (dispatch) => {
        dispatch({
            type: 'SONG_ALERT',
            payload: arg
        })
    }
}

export function setSongAlertFile (arg) {
    return (dispatch) => {
        dispatch({
            type: 'SONG_ALERT_FILE',
            payload: arg
        })
    }
}

export function setSongSelected (arg) {
    return (dispatch) => {
        dispatch({
            type: 'SONG_SELECTED',
            payload: arg
        })
    }
}

export function setSongAlertAction (arg) {
    return (dispatch) => {
        dispatch({
            type: 'SONG_ALERT_ACTION',
            payload: arg
        })
    }
}

export function setSongAlertActionForAll (arg) {
    return (dispatch) => {
        dispatch({
            type: 'SONG_ALERT_ACTION_FOR_ALL',
            payload: arg
        })
    }
}

export function setSongReset () {
    return (dispatch) => {
        dispatch({
            type: 'SONG_RESET',
        })
    }
}