exports.getDate = function() {
    const today = new Date();

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    return today.toLocaleDateString("sk-SK", options)
}

exports.getDay = function() {
    const today = new Date();

    const options = {
        weekday: "long",
    };

    return today.toLocaleDateString("sk-SK", options)
}