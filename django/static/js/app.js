function search_by_title(title, onSuccess, onError) {
    $.ajax({
        url: "pomme_d_api?title=" + title,
        success: onSuccess,
        error: onError
    })
}

function get_by_doi(doi, onSuccess, onError) {
    $.ajax({
        url: "pomme_d_api?doi=" + doi,
        success: onSuccess,
        error: onError
    })
}

function get_by_sid(sid, onSuccess, onError) {
    $.ajax({
        url: "pomme_d_api?sid=" + sid,
        success: onSuccess,
        error: onError
    })
}

function get_prev(metadata, onSuccess, onError) {
    $.ajax({
        url: "pomme_de_prev?title=" + metadata.title,
        success: (data) => onSuccess(data.prev),
        error: onError
    })
}

function get_next(metadata, onSuccess, onError) {
    $.ajax({
        url: "pomme_de_next?title=" + metadata.title,
        success: (data) => onSuccess(data.next),
        error: onError
    })
}

function get_prev_one_by_one(metadata, state, onSuccess, onError) {
    function lol(index) {
        if ((!state.can) && (index<metadata.prev.length)) {
            $.ajax({
                url: metadata.prev[index].url,
                success: (data) => {
                    onSuccess(data) 
                    lol(index + 1)
                },
                error: (error) => {
                    onError(error)
                    lol(index + 1)
                }
            })
        } else {
            state.run.prev = false;
            if (state.can && (!state.run.next)) {
                state.can = false;
                state.continue();
            }
        }
    }
    lol(0)
}

function get_next_one_by_one(metadata, state, onSuccess, onError) {
    function lol(index) {
        if ((!state.can) && (index<metadata.next.length)) {
            $.ajax({
                url: metadata.next[index].url,
                success: (data) => {
                    onSuccess(data) 
                    lol(index + 1)
                },
                error: (error) => {
                    onError(error)
                    lol(index + 1)
                }
            })
        } else {
            state.run.next = false;
            if (state.can && (!state.run.prev)) {
                state.can = false;
                state.continue();
            }
        }
    }
    lol(0)
}