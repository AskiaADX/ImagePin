(function () {
    var imagepin = new ImagePin({
        instanceId: {%= CurrentADC.InstanceId %},
		maxWidth : '{%= CurrentADC.PropValue("maxWidth") %}',
		controlWidth : '{%= CurrentADC.PropValue("controlWidth") %}',
		controlAlign : '{%= CurrentADC.PropValue("controlAlign") %}',
		imagePath : '{%:= CurrentADC.PropValue("imagePath") %}',
      	currentQuestion: '{%:= CurrentQuestion.Shortcut %}',
        feeling : '{%:= CurrentADC.PropValue("feeling") %}',
        imageWidth : '{%:= CurrentADC.PropValue("imageWidth") %}',
        imageHeight : '{%:= CurrentADC.PropValue("imageHeight") %}',		
        allowCrossOrigin : '{%:= CurrentADC.PropValue("allowCrossOrigin") %}',		
		items : [
			{%:= CurrentADC.GetContent("dynamic/standard_open.js").ToText()%}
		]
    });
} ());
      