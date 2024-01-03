var fromDevice = [];
var fromChataigne = [];

function init() {
    for (var i = 0; i < 16; i++) {
        fromDevice[i] = false;
        fromChataigne[i] = false;
        sendEncoder(i, local.values.encoders.getChild("encoder" + (i + 1)).get());
        updateColorParam(local.parameters.colors.getChild("color" + (i + 1)));
    }
}


function moduleParameterChanged(param) {
    if (param.getParent() == local.parameters.colors) {
        updateColorParam(param);
    }
}

function updateColorParam(param) {
    var color = param.get();
    var id = parseInt(param.name.substring(5, 7)) - 1;

    var val = 0;

    if (color[0] != 0 || color[1] != 0 || color[2] != 0) {
        var h = rgb2hsl(color[0], color[1], color[2]);
        var val = 1 + parseInt((1 - (h + .32) % 1) * 125);
    }

    local.sendCC(2, id, val);
}

function ccEvent(channel, number, value) {
    var id = number + 1;
    if (channel == 1) {
        var encoder = local.values.encoders.getChild("encoder" + id);
        fromDevice[id - 1] = true;
        local.values.encoders.getChild("encoder" + id).set(value / 127);
        fromDevice[id - 1] = false;
    } else if (channel == 2) {
        var bt = local.values.buttons.getChild("button" + id);
        bt.set(value > 0);
    }

}

function moduleValueChanged(value) {
    if (value.getParent() == local.values.encoders) {

        var id = parseInt(value.name.substring(7, 9));
        if (fromDevice[id - 1]) return;
        sendEncoder(id -1, value.get());
    }
}

function setEncoderValue(encoder, value) {
    local.values.encoders.getChild("encoder" + id).set(value / 127);

    var id = parseInt(encoder.name.substring(7, 9));
    var color = local.parameters.colors.getChild("color" + id).get();
    var h = rgb2hsl(color[0], color[1], color[2]);
    var hue = (value / 127) * .64 + .32;
    var rgb = hsl2rgb(hue, 1, 1);
    local.parameters.colors.getChild("color" + id).set(rgb);
    if (!fromDevice[id - 1]) sendEncoder(id - 1, value);
}

function sendEncoder(number, value) {
    local.sendCC(1, number, value * 127);
}

function rgb2hsl(r, g, b) {

    var hi = Math.max(r, Math.max(g, b));
    var lo = Math.min(r, Math.min(g, b));

    var hue = 0.0;

    if (hi > 0 && hi != lo) {
        var invDiff = 1.0 / (hi - lo);

        var red = (hi - r) * invDiff;
        var green = (hi - g) * invDiff;
        var blue = (hi - b) * invDiff;

        if (r == hi) hue = blue - green;
        else if (g == hi) hue = 2.0 + red - blue;
        else hue = 4.0 + green - red;

        hue *= 1.0 / 6.0;

        if (hue < 0.0)
            hue += 1.0;
    }

    return hue;
}