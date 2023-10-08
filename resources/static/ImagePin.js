(function () {
    var msEdgeMatch = /Edge\/([0-9]+)/i.exec(navigator.userAgent);
    if (msEdgeMatch) document.documentMode = parseInt(msEdgeMatch[1]);
})();
(function () {

    /**
  * function that emulate the jQuery matches function
  *
  * @param {HTMLElement} obj HTMLElement which should be listen
  * @param {String} selector The start element to returns his matches 
  */
    function matches(el, selector) {
        return (
            el.matches ||
            el.matchesSelector ||
            el.msMatchesSelector ||
            el.mozMatchesSelector ||
            el.webkitMatchesSelector ||
            el.oMatchesSelector
        ).call(el, selector);
    }

    /**
   * function that emulate the jQuery parents function
   *
   * @param {HTMLElement} obj HTMLElement which should be listen
   * @param {String} selector The start element to returns his parents 
   */
    function parents(el, selector) {
        var parents = [];
        while ((el = el.parentNode) && el !== document) {
            // See "Matches Selector" above
            if (!selector || matches(el, selector)) parents.push(el);
        }
        return parents;
    }

    /**
  * function that emulate the jQuery offset function
  *
  * @param {HTMLElement} obj HTMLElement which should be listen
  */
    function offset(el) {
        box = el.getBoundingClientRect();
        docElem = document.documentElement;
        return {
            top: box.top + window.pageYOffset - docElem.clientTop,
            left: box.left + window.pageXOffset - docElem.clientLeft
        };
    }

    /**
  * IE8 and below fix
  */
    if (!Array.prototype.indexOf) {

        Array.prototype.indexOf = function (elt) {
            var len = this.length >>> 0;

            var from = Number(arguments[1]) || 0;
            from = (from < 0)
                ? Math.ceil(from)
                : Math.floor(from);
            if (from < 0)
                from += len;

            for (; from < len; from++) {
                if (from in this && this[from] === elt)
                    return from;
            }
            return -1;
        };
    }

    /**
   * Creates a new instance of the Pinboard
   *
   * @param {Object} options Options of the Pinboard
   */
    function ImagePin(options) {

        this.options = options;
        this.maxWidth = options.maxWidth || 400;
        this.controlWidth = options.controlWidth || "100%";
        this.controlAlign = options.controlAlign || 'center';
        this.currentQuestion = options.currentQuestion;

        var instanceId = options.instanceId || 1;
        imagePath = options.imagePath || '',
            adcControl = document.getElementById('adc_' + instanceId),
            smartBoard = adcControl.querySelectorAll('.smartBoard')[0],
            areaWidth = 0,
            areaHeight = 0,
            resizedWidth = 0,
            resizedHeight = 0,
            ratio = 1,
            feeling = options.feeling,
            items = options.items,
            data = { url: imagePath, data: [] };

        adcControl.style.maxWidth = options.maxWidth;
        adcControl.style.width = options.controlWidth;
        parents(adcControl, '.controlContainer')[0].style.width = '100%';

        if (this.controlAlign === "center") {
            parents(adcControl, '.controlContainer')[0].style.textAlign = 'center';
            adcControl.style.margin = '0px auto';
        } else if (this.controlAlign === "right") {
            adcControl.style.margin = '0 0 0 auto';
        }

        var imgLoad = adcControl.querySelector('img');
        imgLoad.setAttribute('src', imagePath);
        imgLoad.removeEventListener('load', function () { });
        var img = new Image();
        img.src = imgLoad.src;

        function isTransparent(e) {
            var offsetLeft = (this.offsetLeft) ? this.offsetLeft : 0;
            var offsetTop = (this.offsetTop) ? this.offsetTop : 0;
            var x = e.offsetX - offsetLeft,
                y = e.offsetY - offsetTop;

            var canvas = document.getElementById('imgcheck_' + instanceId + '-canvas') ||
                (function (_this) {
                    var e = document.createElement('canvas');
                    e.setAttribute('width', _this.width);
                    e.setAttribute('height', _this.height);
                    e.setAttribute('id', _this.id + '-canvas');
                    e.setAttribute('style', 'display:none;');
                    document.querySelector('.smartBoard').appendChild(e);
                    var cx = e.getContext('2d', { willReadFrequently: true });
                    cx.drawImage(_this, 0, 0, _this.width, _this.height);
                    return e;
                })(imgLoad);

            if (canvas.getContext === undefined) { return false; }
            var ctx = canvas.getContext('2d');

            if (ctx.getImageData(x, y, 1, 1).data[3] == 0) {
                document.querySelector('html').style.cursor = 'default';
                return true;
            } else {
                document.querySelector('html').style.cursor = 'crosshair';
                return false;
            }
        }

        imgLoad.addEventListener('load', function () {
            // Get image sizes - this is the img
            areaWidth = this.width;
            areaHeight = this.height;

            smartBoard.style.width = '';
            smartBoard.style.height = '';
            // hide the img
            this.style.display = 'none';

            ratio = areaHeight / areaWidth,
                resizedWidth = adcControl.offsetWidth > areaWidth ? areaWidth : adcControl.offsetWidth,
                resizedHeight = (resizedWidth * ratio);

            this.style.display = 'block';
            this.style.width = resizedWidth + 'px';
            this.style.height = resizedHeight + 'px';
            smartBoard.style.display = 'block';
            smartBoard.style.width = resizedWidth + 'px';
            smartBoard.style.height = resizedHeight + 'px';

            init();

            var smartArea = adcControl.querySelectorAll('.smartArea')[0];
            smartArea.addEventListener('mousemove', isTransparent, true);
        });

        function init() {

            var pinWidth = 28,
                pinHeight = 33,
                pinID = adcControl.querySelectorAll('.pin').length - 1,
                pinMoodArray = ['gPin', 'nPin', 'bPin'];

            //prepend
            document.querySelector('.tempArea').innerHTML = '<div class="smartArea" data-id="0" style="position:absolute;top:0px; left:0px;width:100%; height:100%;"></div>';
            smartBoard.insertAdjacentElement('afterbegin', document.querySelector('.smartArea'));

            var smartArea = adcControl.querySelectorAll('.smartArea')[0];

            smartArea.addEventListener('click', function (e) {

                if (isTransparent(event) === false) {

                    var offsetSmartArea = offset(this),
                        xCoord = (e.pageX - offsetSmartArea.left),
                        yCoord = (e.pageY - offsetSmartArea.top),
                        offsetParent = offset(smartBoard),
                        xCoordParent = (e.pageX - offsetParent.left),
                        yCoordParent = (e.pageY - offsetParent.top),
                        ratioX = areaWidth / resizedWidth,
                        ratioY = areaHeight / resizedHeight;


                    //add new pin
                    pinID = this.querySelectorAll('.pin').length;
                    document.querySelector('.tempArea').innerHTML = '<div class="pin active" style="top:' + ((yCoord) - pinHeight + 8) + 'px; left:' + ((xCoord) - (pinWidth * 0.5) + 3) + 'px;" data-pinid="' + pinID + '" ></div>';
                    this.appendChild(document.querySelector('.tempArea .pin.active'));
                    var dataPinId = adcControl.querySelector('[data-pinid="' + pinID + '"]');
                    dataPinId.dataset.target = e.target;
                    dataPinId.dataset.x = xCoord * ratioX;
                    dataPinId.dataset.y = yCoord * ratioY;
                    dataPinId.dataset.x0 = xCoordParent;
                    dataPinId.dataset.y0 = yCoordParent;
                    dataPinId.classList.add(pinMoodArray[feeling - 1]);

                    if ((document.body.clientWidth / window.innerWidth) > 1) {
                        var zoom = document.body.clientWidth / window.innerWidth;
                        dataPinId.dataset.x = xCoord * zoom;
                        dataPinId.dataset.y = yCoord * zoom;
                        dataPinId.dataset.x0 = xCoordParent * zoom;
                        dataPinId.dataset.y0 = yCoordParent * zoom;
                    }

                    // write data in the textarea
                    var newValue = { id: dataPinId.dataset.pinid, x: dataPinId.dataset.x, y: dataPinId.dataset.y }
                    var parseJsonValue;
                    if (document.getElementById(items[0].element).value === '') {
                        parseJsonValue = data;
                    } else {
                        parseJsonValue = JSON.parse(document.getElementById(items[0].element).value);
                    }
                    parseJsonValue.data.push(newValue);
                    document.getElementById(items[0].element).value = JSON.stringify(parseJsonValue);

                    // enable pin deletion
                    var pins = adcControl.querySelectorAll('.pin');
                    for (var i = 0; i < pins.length; i++) {
                        pins[i].removeEventListener('click', function () { });
                        pins[i].addEventListener('click', function (e) {
                            e.stopImmediatePropagation();

                            var currentPinID = this.dataset.pinid;
                            var dataPinId2 = adcControl.querySelector('[data-pinid="' + currentPinID + '"]');
                            
                            var parseJsonValue;
                            parseJsonValue = JSON.parse(document.getElementById(items[0].element).value);
                            // reorder the id
                            for (var i2 = currentPinID; i2 < parseJsonValue.data.length; i2++) {
                                parseJsonValue.data[i2].id = i2 - 1;
                                adcControl.querySelector('[data-pinid="' + i2 + '"]').dataset.pinid = i2 - 1;
                            }

                            // remove pin
                            if (dataPinId2.parentNode !== null) {
                                dataPinId2.parentNode.removeChild(dataPinId2);
                            }

                            //remove data of the pin deleted
                            parseJsonValue.data.splice(currentPinID, 1);
                            
                            // write back the new data
                            var finalValue = (parseJsonValue.data.length === 0) ? "" : JSON.stringify(parseJsonValue);
                            document.getElementById(items[0].element).value = finalValue;
                        });
                    }
                    // live routing
                    if (window.askia
                        && window.arrLiveRoutingShortcut
                        && window.arrLiveRoutingShortcut.length > 0
                        && window.arrLiveRoutingShortcut.indexOf(options.currentQuestion) >= 0) {
                        askia.triggerAnswer();
                    }
                }
            });

            var parseJsonValue;
            if (document.getElementById(items[0].element).value === '') {
                parseJsonValue = data;
            } else {
                parseJsonValue = JSON.parse(document.getElementById(items[0].element).value);
            }
            var oldPins = parseJsonValue.data;

            // Check for old values
            for (var k = 0; k < (oldPins.length); k++) {

                var currentPinID = parseFloat(oldPins[k].id),
                    pinX = parseFloat(oldPins[k].x),
                    pinY = parseFloat(oldPins[k].y),
                    ratioX = areaWidth / resizedWidth,
                    ratioY = areaHeight / resizedHeight;


                var offsetParent = offset(adcControl.querySelector('.smartBoard')),
                    xCoordParent = ((pinX + offset(adcControl.querySelector('.smartArea')).left) - offsetParent.left),
                    yCoordParent = ((pinY + offset(adcControl.querySelector('.smartArea')).top) - offsetParent.top);


                document.querySelector('.tempArea').innerHTML = '<div class="pin" style="top:' + ((pinY / ratioY) - pinHeight + 8) + 'px; left:' + ((pinX / ratioX) - (pinWidth * 0.5) + 3) + 'px;" data-pinid="' + currentPinID + '" ></div>'
                adcControl.querySelector('.smartArea').appendChild(document.querySelector('.tempArea .pin'));
                var dataPinId = adcControl.querySelector('[data-pinid="' + currentPinID + '"]');
                if (dataPinId !== null) {
                    dataPinId.dataset.target = adcControl.querySelector('.smartArea');
                    dataPinId.dataset.x = pinX / ratioX;
                    dataPinId.dataset.y = pinY / ratioY;
                    dataPinId.dataset.x0 = xCoordParent;
                    dataPinId.dataset.y0 = yCoordParent;
                    dataPinId.classList.remove('gPin');
                    dataPinId.classList.remove('nPin');
                    dataPinId.classList.remove('bPin');
                    dataPinId.classList.add(pinMoodArray[feeling - 1]);
                }
            }

            // enable pin deletion
            var pins = adcControl.querySelectorAll('.pin');
            for (var i3 = 0; i3 < pins.length; i3++) {
                pins[i3].removeEventListener('click', function () { });
                pins[i3].addEventListener('click', function (e) {
                    e.stopImmediatePropagation();

                    var currentPinID = this.dataset.pinid;
                    var dataPinId2 = adcControl.querySelector('[data-pinid="' + currentPinID + '"]');
                    
                    var parseJsonValue;
                    parseJsonValue = JSON.parse(document.getElementById(items[0].element).value);
                    
                    // reorder the id
                    for (var i4 = currentPinID; i4 < parseJsonValue.data.length; i4++) {
                        parseJsonValue.data[i4].id = i4 - 1;
                        adcControl.querySelector('[data-pinid="' + i4 + '"]').dataset.pinid = i4 - 1;
                    }

                    // remove pin
                    if (dataPinId2.parentNode !== null) {
                        dataPinId2.parentNode.removeChild(dataPinId2);
                    }
                    
                    //remove data of the pin deleted
                    parseJsonValue.data.splice(currentPinID, 1);

                    // write back the new data
                    var finalValue = (parseJsonValue.data.length === 0) ? "" : JSON.stringify(parseJsonValue);
                    document.getElementById(items[0].element).value = finalValue;
                });
            }
        }
    }

    /**
   * Attach the Pinboard to the window object
   */
    window.ImagePin = ImagePin;

}());
