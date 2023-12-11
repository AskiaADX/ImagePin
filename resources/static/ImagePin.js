(function () {
    var msEdgeMatch = /Edge\/([0-9]+)/i.exec(navigator.userAgent);
    if (msEdgeMatch) {
        document.documentMode = parseInt(msEdgeMatch[1]);
    }
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
            if (!selector || matches(el, selector)) {
                parents.push(el);
            }
        }
        return parents;
    }

    /**
      * function that emulate the jQuery offset function
      *
      * @param {HTMLElement} obj HTMLElement which should be listen
      */
    function offset(el) {
        var box = el.getBoundingClientRect();
        var docElem = document.documentElement;
        return {
            top: box.top + window.pageYOffset - docElem.clientTop,
            left: box.left + window.pageXOffset - docElem.clientLeft,
        };
    }

    /**
  * IE8 and below fix
  */
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (elt) {
            var len = this.length >>> 0;
            var from = Number(arguments[1]) || 0;
            from = from < 0 ? Math.ceil(from) : Math.floor(from);
            if (from < 0) from += len;

            for (; from < len; from++) {
                if (from in this && this[from] === elt) return from;
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
        this.controlAlign = options.controlAlign || "center";
        this.currentQuestion = options.currentQuestion;

        var instanceId = options.instanceId || 1;
        var imagePath = options.imagePath || "";
        var imageWidth = options.imageWidth || 0;
        var imageHeight = options.imageHeight || 0;        
        var allowCrossOrigin = options.allowCrossOrigin || false;        
        var adcControl = document.getElementById("adc_" + instanceId);
        var smartBoard = adcControl.querySelector(".smartBoard");
        var areaWidth = 0;
        var areaHeight = 0;
        var resizedWidth = 0;
        var resizedHeight = 0;
        var ratio = 1;
        var feeling = options.feeling;
        var items = options.items;
        var data = { url: imagePath, width: imageWidth, height: imageHeight, data: [] };

        adcControl.style.maxWidth = options.maxWidth;
        adcControl.style.width = options.controlWidth;
        parents(adcControl, ".controlContainer")[0].style.width = "100%";

        if (this.controlAlign === "center") {
            parents(adcControl, ".controlContainer")[0].style.textAlign = "center";
            adcControl.style.margin = "0px auto";
        } else if (this.controlAlign === "right") {
            adcControl.style.margin = "0 0 0 auto";
        }

        var imgLoad = adcControl.querySelector("img");
        if (allowCrossOrigin === "1") {
            imgLoad.setAttribute("crossOrigin", "Anonymous");
        }
        imgLoad.setAttribute("src", imagePath);
        imgLoad.removeEventListener("load", function () { });
        var img = new Image();
        if (allowCrossOrigin === "1") {
	        img.crossOrigin = "Anonymous";
        }
        img.src = imgLoad.src;

        // Check if the pixel is transparent
        function isTransparent(e) {
            var offsetLeft = this.offsetLeft || 0;
            var offsetTop = this.offsetTop || 0;
            var x = e.offsetX - offsetLeft;
            var y = e.offsetY - offsetTop;

            var canvas =
                document.getElementById("imgcheck_" + instanceId + "-canvas") ||
                (function (_this) {
                    var e = document.createElement("canvas");
                    e.setAttribute("style", "display:none;");
                    e.setAttribute("width", _this.width);
                    e.setAttribute("height", _this.height);
                    e.setAttribute("id", _this.id + "-canvas");
                    document.querySelector(".smartBoard").appendChild(e);
                    var cx = e.getContext("2d", { willReadFrequently: true });
                    cx.drawImage(_this, 0, 0, _this.width, _this.height);
                    return e;
                })(imgLoad);

            if (canvas.getContext === undefined) {
                return false;
            }
            var ctx = canvas.getContext("2d");

            if (ctx.getImageData(x, y, 1, 1).data[3] === 0) {
                document.querySelector("html").style.cursor = "default";
                return true;
            } else {
                document.querySelector("html").style.cursor = "crosshair";
                return false;
            }
        }

        imgLoad.addEventListener("load", function () {
            areaWidth = this.width;
            areaHeight = this.height;

            this.style.display = "none";
            smartBoard.style.width = "";
            smartBoard.style.height = "";


            ratio = areaHeight / areaWidth;
            resizedWidth = adcControl.offsetWidth > areaWidth ? areaWidth : adcControl.offsetWidth;
            resizedHeight = resizedWidth * ratio;

            // resize the img and board
            this.style.width = resizedWidth + "px";
            this.style.height = resizedHeight + "px";
            this.style.display = "block";
            smartBoard.style.width = resizedWidth + "px";
            smartBoard.style.height = resizedHeight + "px";
            smartBoard.style.display = "block";

            init();

            var smartArea = adcControl.querySelector(".smartArea");
            smartArea.addEventListener("mousemove", isTransparent, true);
        });

        function init() {
            var pinWidth = 28;
            var pinHeight = 33;
            var pinID = adcControl.querySelectorAll(".pin").length - 1;
            var pinMoodArray = ["gPin", "nPin", "bPin"];

            document.querySelector(".tempArea").innerHTML = '<div class="smartArea" data-id="0" style="position:absolute;top:0px; left:0px;width:100%; height:100%;"></div>';
            smartBoard.insertAdjacentElement("afterbegin", document.querySelector(".smartArea"));

            var smartArea = adcControl.querySelector(".smartArea");

            smartArea.addEventListener("click", function (e) {
                if (isTransparent(event) === false) {
                    var offsetSmartArea = offset(this);
                    var xCoord = e.pageX - offsetSmartArea.left;
                    var yCoord = e.pageY - offsetSmartArea.top;
                    var offsetParent = offset(smartBoard);
                    var xCoordParent = e.pageX - offsetParent.left;
                    var yCoordParent = e.pageY - offsetParent.top;
                    var ratioX = areaWidth / resizedWidth;
                    var ratioY = areaHeight / resizedHeight;

                    //add new pin
                    pinID = this.querySelectorAll(".pin").length;
                    document.querySelector('.tempArea').innerHTML =
                        '<div class="pin active" style="top:' +
                        (yCoord - pinHeight + 10) +
                        'px; left:' +
                        (xCoord - pinWidth * 0.5 + 4) +
                        'px;" data-pinid="' +
                        pinID +
                        '" ></div>';
                    this.appendChild(document.querySelector('.tempArea .pin.active'));
                    var dataPinId = adcControl.querySelector('[data-pinid="' + pinID + '"]');
                    dataPinId.dataset.target = e.target;
                    dataPinId.dataset.x = xCoord * ratioX;
                    dataPinId.dataset.y = yCoord * ratioY;
                    dataPinId.dataset.x0 = xCoordParent;
                    dataPinId.dataset.y0 = yCoordParent;
                    dataPinId.classList.add(pinMoodArray[feeling - 1]);

                    // write data in the textarea
                    var newValue = { id: dataPinId.dataset.pinid, x: dataPinId.dataset.x, y: dataPinId.dataset.y };
                    var parseJsonValue;
                    if (document.getElementById(items[0].element).value === "") {
                        parseJsonValue = data;
                    } else {
                        parseJsonValue = JSON.parse(document.getElementById(items[0].element).value);
                    }
                    parseJsonValue.data.push(newValue);
                    document.getElementById(items[0].element).value = JSON.stringify(parseJsonValue);

                    // enable pin deletion
                    var pins = adcControl.querySelectorAll(".pin");
                    for (var i = 0; i < pins.length; i++) {
                        pins[i].removeEventListener("click", function () { });
                        pins[i].addEventListener("click", function (e) {
                            e.stopImmediatePropagation();

                            var currentPinID = this.dataset.pinid;
                            var dataPinId2 = adcControl.querySelector('[data-pinid="' + currentPinID + '"]');

                            // reorder the id
                            var parseJsonValue;
                            parseJsonValue = JSON.parse(document.getElementById(items[0].element).value);
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
                            var finalValue = parseJsonValue.data.length === 0 ? "" : JSON.stringify(parseJsonValue);
                            document.getElementById(items[0].element).value = finalValue;
                        });
                    }

                    // Askia live routing
                    if (
                        window.askia &&
                        window.arrLiveRoutingShortcut &&
                        window.arrLiveRoutingShortcut.length > 0 &&
                        window.arrLiveRoutingShortcut.indexOf(options.currentQuestion) >= 0
                    ) {
                        askia.triggerAnswer();
                    }
                }
            });

            var parseJsonValue;
            if (document.getElementById(items[0].element).value === "") {
                parseJsonValue = data;
            } else {
                parseJsonValue = JSON.parse(document.getElementById(items[0].element).value);
            }

            // Check for old values
            var oldPins = parseJsonValue.data;
            for (var k = 0; k < oldPins.length; k++) {
                var currentPinID = parseFloat(oldPins[k].id);
                var pinX = parseFloat(oldPins[k].x);
                var pinY = parseFloat(oldPins[k].y);
                var ratioX = areaWidth / resizedWidth;
                var ratioY = areaHeight / resizedHeight;

                var offsetParent = offset(adcControl.querySelector(".smartBoard"));
                var xCoordParent = (pinX + offset(adcControl.querySelector(".smartArea")).left - offsetParent.left);
                var yCoordParent = (pinY + offset(adcControl.querySelector(".smartArea")).top - offsetParent.top);

                document.querySelector(".tempArea").innerHTML =
                    '<div class="pin" style="top:' +
                    (pinY / ratioY - pinHeight + 10) +
                    'px; left:' +
                    (pinX / ratioX - pinWidth * 0.5 + 4) +
                    'px;" data-pinid="' +
                    currentPinID +
                    '" ></div>';
                adcControl.querySelector(".smartArea").appendChild(document.querySelector(".tempArea .pin"));
                var dataPinId = adcControl.querySelector('[data-pinid="' + currentPinID + '"]');
                if (dataPinId !== null) {
                    dataPinId.dataset.target = adcControl.querySelector(".smartArea");
                    dataPinId.dataset.x = pinX / ratioX;
                    dataPinId.dataset.y = pinY / ratioY;
                    dataPinId.dataset.x0 = xCoordParent;
                    dataPinId.dataset.y0 = yCoordParent;
                    dataPinId.classList.remove("gPin");
                    dataPinId.classList.remove("nPin");
                    dataPinId.classList.remove("bPin");
                    dataPinId.classList.add(pinMoodArray[feeling - 1]);
                }
            }

            // enable pin deletion
            var pins = adcControl.querySelectorAll(".pin");
            for (var i3 = 0; i3 < pins.length; i3++) {
                pins[i3].removeEventListener("click", function () { });
                pins[i3].addEventListener("click", function (e) {
                    e.stopImmediatePropagation();

                    var currentPinID = this.dataset.pinid;
                    var dataPinId2 = adcControl.querySelector('[data-pinid="' + currentPinID + '"]');

                    // reorder the id
                    var parseJsonValue;
                    parseJsonValue = JSON.parse(document.getElementById(items[0].element).value);
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
                    var finalValue = parseJsonValue.data.length === 0 ? "" : JSON.stringify(parseJsonValue);
                    document.getElementById(items[0].element).value = finalValue;
                });
            }
        }
    }

    /**
   * Attach the Pinboard to the window object
   */
    window.ImagePin = ImagePin;
})();
