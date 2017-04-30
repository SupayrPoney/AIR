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
    for (var i = 0; i < metadata.prev.length; i++) {
        $.ajax({
            url: metadata.prev[i].url,
            success: onSuccess,
            error: onError
        })
    }
}

function get_next(metadata, onSuccess, onError) {
    for (var i = 0; i < metadata.next.length; i++) {
        $.ajax({
            url: metadata.next[i].url,
            success: onSuccess,
            error: onError
        })
    }
}