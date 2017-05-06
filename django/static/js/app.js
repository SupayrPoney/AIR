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
    function lol(res, i) {
        if (metadata.prev[i]) {
            $.ajax({
                url: metadata.prev[i].url,
                success: (data) => lol(res.concat([data]), i + 1),
                error: (error) => lol(res, i + 1)
            })
        }
        else {
            onSuccess(res)
        }
    }
    lol([], 0)
}

function get_next(metadata, onSuccess, onError) {
    function lol(res, i) {
        if (metadata.next[i]) {
            $.ajax({
                url: metadata.next[i].url,
                success: (data) => lol(res.concat([data]), i + 1),
                error: (error) => lol(res, i + 1)
            })
        }
        else {
            onSuccess(res)
        }
    }
    lol([], 0)
}
