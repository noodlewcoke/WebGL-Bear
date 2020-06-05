"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var eyeDist = 250;

var fovy = 359.0* Math.PI/180;
var near = 1;
var far = 4000;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var texture1, texture2, newText;
var t1, t2;

var colorsArray = [];
var texCoordsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var monoColorR = 0.5;
var monoColorG = 0.2;
var monoColorB = 0.1;

var vertexColors = [
    vec4( monoColorR, monoColorG, monoColorB, 1.0 ),  
    vec4( monoColorR, monoColorG, monoColorB, 1.0 ),  
    vec4( monoColorR, monoColorG, monoColorB, 1.0 ),  
    vec4( monoColorR, monoColorG, monoColorB, 1.0 ),  
    vec4( monoColorR, monoColorG, monoColorB, 1.0 ),  
    vec4( monoColorR, monoColorG, monoColorB, 1.0 ),  
    vec4( monoColorR, monoColorG, monoColorB, 1.0 ),  
    vec4( monoColorR, monoColorG, monoColorB, 1.0 )   
];


var torsoBackId = 0;
var torsoFrontId = 1;

var headId = 2;
var head1Id = 2;
var head2Id = 3;
var chinId = 4;
var noseId = 5;
var earRightId = 6;
var earLeftId = 7;

var tailId = 8;

var leftUpperArmId = 9;
var leftLowerArmId = 10;
var leftFrontHandId = 11;

var rightUpperArmId = 12;
var rightLowerArmId = 13;
var rightFrontHandId = 14;

var leftUpperLegId = 15;
var leftLowerLegId = 16;
var leftBackHandId = 17;

var rightUpperLegId = 18;
var rightLowerLegId = 19;
var rightBackHandId = 20;


// TORSO
var torsoBackHeight = 2.0;
var torsoBackWidth = 2.2;
var torsoFrontHeight = 3.0;
var torsoFrontWidth = 1.8;


// ARMS AND LEGS
var upperArmHeight = 2.1;
var lowerArmHeight = 1.9;
var upperArmWidth  = 0.7;
var lowerArmWidth  = 0.7;
var upperLegWidth  = 0.9;
var lowerLegWidth  = 0.9;
var lowerLegHeight = 1.3;
var upperLegHeight = 1.9;
var handWidth = 0.4;
var handHeight = 0.90;


// HEAD AND NECK
var headHeight = 1.2;
var headWidth = 1.4;
var chinHeight = 0.6;
var chinWidth = 0.6;
var earHeight = 0.3;
var earWidth = 0.1;
var noseHeight = 0.1;
var noseWidth = 0.15;

// TAIL
var tailHeight = 0.8;
var tailWidth = 0.2;


// TREE 
var bodyId = 21;
var lowBigBranchId = 22;
var lowMediumBranchId = 23;
var lowSmallBranchId = 24;
var highBigBranchId = 25;
var highMediumBranchId = 26;

var bodyHeight = 12.0;
var bodyWidth = 1.0;
var lowBigBrachHeight = 8.0;
var lowMediumBranchHeight = 3.5;
var lowSmallBranchHeight = 3.0;
var lowBranchWidth = 7.0;
var highBigBranchHeight = 5.0;
var highBigBranchWidth = 4.0;
var highMediumBranchHeight = 3.5;
var highMediumBranchWidth = 3.0;

var numNodes = 27;
var numAngles = 11;
var angle = 0;

var theta = [0,     // torsoBack
             0,     // torsoFront
             15,     // head1
             0,     // head2
             0,     // chin
             0,     // nose
             0,     // earRight
             0,     // earLeft
             -45,     // tail
             100,     // leftUpperArm
             -10,     // leftLowerArm
             0,     // leftFrontHand
             100,     // rightUpperArm
             -10,     // rightLowerArm
             0,     // rightFrontHand
             80,     // leftUpperLeg
             20,     // leftLowerLeg
             -10,     // leftBackHand
             80,     // rightUpperLeg
             20,     // rightLowerLeg
             -10      // rightBackHand        
            ];

var bearPose = 0.0;

var numVertices = 24;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0] = a;
   result[5] = b;
   result[10] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    case torsoBackId:

        m = translate(0.0, bearPose, 0.0);
        m = mult(m, rotate(theta[torsoBackId], vec3(1, 0, 0)));
        figure[torsoBackId] = createNode( m, torsoBack, null, torsoFrontId );
    break;

    case torsoFrontId:

        m = translate(0.0, torsoBackHeight+0.0*torsoFrontHeight, 0.2);
        figure[torsoFrontId] = createNode( m, torsoFront, tailId, headId);
    break;

    case headId:
    case head1Id:
    case head2Id:

        m = translate(0.0, torsoFrontHeight+0.1*headHeight, 0.0);
        m = mult(m, rotate(theta[head1Id], vec3(1, 0, 0)))
        m = mult(m, rotate(theta[head2Id], vec3(0, 0, 1)));
        // m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
        figure[headId] = createNode( m, head, leftUpperArmId, chinId);
    break;

    case chinId:

        m = translate(0.0, headHeight+0.0*chinHeight, 0.0);
        figure[chinId] = createNode( m, chin, earRightId, noseId);
    break;

    case noseId:

        m = translate(0.0, chinHeight-0.5*noseWidth, 0.5*chinHeight-noseHeight);
        figure[noseId] = createNode( m, nose, null, null);
    break;

    case earRightId:

        m = translate(0.8, 0.0, 1.0);
        m = mult(m, rotate(90, 1, 0, 0));
        m = mult(m, rotate(-30, 0, 0, 1));
        figure[earRightId] = createNode(m, earRight, earLeftId, null);

    break;

    case earLeftId:

        m = translate(-0.8, 0.0, 1.0);
        m = mult(m, rotate(90, 1, 0, 0));
        m = mult(m, rotate(30, 0, 0, 1));
        figure[earLeftId] = createNode(m, earLeft, null, null);

    break;

    case tailId:

        m = translate(0.0, -0.1*tailHeight, 0.8);
        m = mult(m, rotate(180, 1, 0, 0))
        m = mult(m, rotate(theta[tailId], 1, 0, 0));
        figure[tailId] = createNode(m, tail, leftUpperLegId, null);
        break;


    case leftUpperArmId:

        m = translate(-(0.1*torsoBackWidth+upperArmWidth), 0.6*torsoFrontHeight, 0.4);
        m = mult(m, rotate(theta[leftUpperArmId], vec3(1, 0, 0)));
        figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:

        m = translate(0.1*torsoBackWidth+upperArmWidth, 0.6*torsoFrontHeight, 0.4);
        m = mult(m, rotate(theta[rightUpperArmId], vec3(1, 0, 0)));
        figure[rightUpperArmId] = createNode( m, rightUpperArm, null, rightLowerArmId );
    break;

    case leftUpperLegId:

        m = translate(-(0.1*torsoBackWidth+upperLegWidth), 0.3*upperLegHeight, -0.2);
        m = mult(m , rotate(theta[leftUpperLegId], vec3(1, 0, 0)));
        figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
        break;

    case rightUpperLegId:

        m = translate(0.1*torsoBackWidth+upperLegWidth, 0.3*upperLegHeight, -0.2);
        m = mult(m, rotate(theta[rightUpperLegId], vec3(1, 0, 0)));
        figure[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );
        break;

    case leftLowerArmId:

        m = translate(0.0, upperArmHeight, 0.0);
        m = mult(m, rotate(theta[leftLowerArmId], vec3(1, 0, 0)));
        figure[leftLowerArmId] = createNode( m, leftLowerArm, null, leftFrontHandId );
    break;

    case rightLowerArmId:

        m = translate(0.0, upperArmHeight, 0.0);
        m = mult(m, rotate(theta[rightLowerArmId], vec3(1, 0, 0)));
        figure[rightLowerArmId] = createNode( m, rightLowerArm, null, rightFrontHandId );
        break;

    case leftLowerLegId:

        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[leftLowerLegId],vec3(1, 0, 0)));
        figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, leftBackHandId );
        break;

    case rightLowerLegId:

        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[rightLowerLegId], vec3(1, 0, 0)));
        figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, rightBackHandId );
        break;

    case leftFrontHandId:
        
        m = translate(0.0, lowerArmHeight, 0.0);
        m = mult(m, rotate(-90, vec3(1, 0, 0)));
        m = mult(m, rotate(theta[leftFrontHandId], vec3(1, 0, 0)));
        figure[leftFrontHandId] = createNode( m, leftFrontHand, null, null);
    break;

    case rightFrontHandId:
        
        m = translate(0.0, lowerArmHeight, 0.0);
        m = mult(m, rotate(-90, vec3(1, 0, 0)));
        m = mult(m, rotate(theta[rightFrontHandId], vec3(1, 0, 0)));
        figure[rightFrontHandId] = createNode( m, rightFrontHand, null, null);
    break;

    case leftBackHandId:
        
        m = translate(0.0, lowerLegHeight, 0.0);
        m = mult(m, rotate(-90, vec3(1, 0, 0)));
        m = mult(m, rotate(theta[leftBackHandId], vec3(1, 0, 0)));
        figure[leftBackHandId] = createNode( m, leftBackHand, null, null);
    break;

    case rightBackHandId:
        
        m = translate(0.0, lowerLegHeight, 0.0);
        m = mult(m, rotate(-90, vec3(1, 0, 0)));
        m = mult(m, rotate(theta[rightBackHandId], vec3(1, 0, 0)));
        figure[rightBackHandId] = createNode( m, rightBackHand, null, null);
    break;
    
    // tree nodes

    case bodyId:

        m = translate(0.0, 20.0, -3.5);
        m = mult(m, rotate(-90, vec3(1, 0, 0)));
        figure[bodyId] = createNode( m, body, null, lowBigBranchId);
    break;

    case lowBigBranchId:

        m = translate(0.3*lowBranchWidth-1.0, bodyHeight, -0.5*lowBigBrachHeight);
        m = mult(m, rotate(-90, vec3(1, 0, 0)));
        
        figure[lowBigBranchId] = createNode( m, lowBigBranch, lowMediumBranchId, null);
    break;

    case lowMediumBranchId:

        m = translate(-0.5*lowMediumBranchHeight-1.0, bodyHeight, 0.0*lowMediumBranchHeight);
        m = mult(m, rotate(90, vec3(1, 0, 0)));
        figure[lowMediumBranchId] = createNode( m, lowMediumBranch, lowSmallBranchId, null);
    break;

    case lowSmallBranchId:

        m = translate(-0.5*lowSmallBranchHeight-1.0, bodyHeight, lowSmallBranchHeight);
        m = mult(m, rotate(90, vec3(1, 0, 0)));
        figure[lowSmallBranchId] = createNode( m, lowSmallBranch, highBigBranchId, null);
    break;

    case highBigBranchId:

        m = translate(0.3*highBigBranchHeight-1.0, bodyHeight+1.0, -0.0*highBigBranchHeight);
        // m = mult(m, rotate(90, vec3(1, 0, 0)));
        figure[highBigBranchId] = createNode( m, highBigBranch, highMediumBranchId, null);
    break;

    case highMediumBranchId:

        m = translate(-0.5*highMediumBranchHeight-1.0, bodyHeight+1.0, 0.0*highMediumBranchHeight);
        // m = mult(m, rotate(90, vec3(1, 0, 0)));
        figure[highMediumBranchId] = createNode( m, highMediumBranch, null, null);
    break;

    }

}

function traverse(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

// tree functions

function body() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*bodyHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( bodyWidth, bodyHeight, bodyWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function lowBigBranch() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*lowBigBrachHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( lowBigBrachHeight-4.0, lowBigBrachHeight, lowBranchWidth-5.0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function lowMediumBranch() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*lowMediumBranchHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( lowMediumBranchHeight+2.0, lowMediumBranchHeight, lowBranchWidth-5.0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function lowSmallBranch() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*lowSmallBranchHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( lowSmallBranchHeight+2.0, lowSmallBranchHeight, lowBranchWidth-5.0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function highBigBranch() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*highBigBranchHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( highBigBranchWidth, highBigBranchHeight, highBigBranchWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function highMediumBranch() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*highMediumBranchHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( highMediumBranchWidth, highMediumBranchHeight, highMediumBranchWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}


// bear functions

function torsoFront() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoFrontHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( torsoFrontWidth, torsoFrontHeight, torsoFrontWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);

}

function torsoBack() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoBackHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( torsoBackWidth, torsoBackHeight, torsoBackWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);

}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);

}


function chin() {
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * chinHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(chinWidth, chinHeight+0.1, chinWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);

}

function nose() {
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * noseHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(noseWidth, noseHeight+0.1, noseWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);

}

function earRight() {


    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * earHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(earHeight, earHeight, earWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    // gl.drawArrays(gl.TRIANGLES, 0, 36);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);


}

function earLeft() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * earHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(earHeight, earHeight, earWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    // gl.drawArrays(gl.TRIANGLES, 0, 36);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);

}

function tail() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(tailWidth, tailHeight, tailWidth)) ;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    // gl.drawArrays(gl.TRIANGLES, 0, 36);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);


}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth-0.2, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth-0.2, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftFrontHand() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * handHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(handWidth+0.2, handHeight, handWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth-0.2, upperArmHeight, upperArmWidth) );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth-0.2, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightFrontHand() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * handHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(handWidth+0.2, handHeight, handWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth-0.4, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth-0.4, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftBackHand() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * handHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(handWidth+0.2, handHeight, handWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth-0.4, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth-0.4, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightBackHand() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * handHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(handWidth+0.2, handHeight, handWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     pointsArray.push(vertices[b]);
     pointsArray.push(vertices[c]);
     pointsArray.push(vertices[d]);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function interpolation(start, stop, increment) {
    /// 1D linear interpolation for angle interpolations.
    return (stop - start) * increment + start;
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    // gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    modelViewMatrix = mat4();
    projectionMatrix = perspective(fovy, 1.0, near, far);


    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix)  );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix)  );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    vBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );


    document.getElementById("zoomIn").onclick = function () {
        if(eyeModified[0]>70) {

            eyeModified[0] -= 0.1*eyeModified[0];
            eyeModified[1] -= 0.1*eyeModified[1];
            eyeModified[2] -= 0.1*eyeModified[2];

        }
    };

    document.getElementById("zoomOut").onclick = function () {
        if(eyeModified[0]<700) {

            eyeModified[0] += 0.1*eyeModified[0];
            eyeModified[1] += 0.1*eyeModified[1];
            eyeModified[2] += 0.1*eyeModified[2];

        }
    };

    document.getElementById("startAnimation").onclick = function () {
        startFlag = true;
        pauseFlag = false;
    }

    document.getElementById("pauseAnimation").onclick = function () {
        startFlag = false;
        pauseFlag = true;
    }

    document.getElementById("resetAnimation").onclick = function () {
        theta = [0, 0,15,0,0,0,0,0,-45,100,-10,0,100,-10,0,80,20,-10,80,20,-10];
        bearPose = 0.0;
        walkCycleCounter = 0;

        startFlag = false;
        pauseFlag = false;
        counter = 0;
        for(i=0; i<numNodes; i++) initNodes(i);

    }
    document.getElementById("camera1").onclick = function () {
        spinFlag = false;
        eyeModified = vec4(eyeDist, eyeDist, 100, 1.0);
    }

    document.getElementById("camera2").onclick = function () {
        spinFlag = false;
        eyeModified = vec4(eyeDist, 10, 10, 1.0);
    }

    document.getElementById("camera3").onclick = function () {
        spinFlag = true;
        cameraIncrement = 0;
        // eyeModified = vec4(eyeDist, eyeDist, 100, 1.0);
    }
    

    for(i=0; i<numNodes; i++) initNodes(i);

    render();
}

var startFlag = false;
var pauseFlag = false;
var spinFlag = true;

var eyeModified = vec4(eyeDist, eyeDist, 100, 1.0);
var eye = vec4(eyeDist, eyeDist, 100, 1.0);
var eyeIncrement;
var at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 0.0, 1.0);

var cameraIncrement = 0;
function cameraControl() {
    at = vec3(0.0, bearPose+3, 0.0);
    eye = eyeModified;

    eyeIncrement = cameraIncrement /3 / 6 * 2 * Math.PI;
    if(spinFlag) {eye = mult(rotateZ(eyeIncrement), eye);}
    modelViewMatrix = lookAt(vec3(eye[0], eye[1], eye[2]), at, up);
    cameraIncrement += 1;

}
// var theta = [0,     // torsoBack
//     0,     // torsoFront
//     15,     // head1
//     30,     // head2
//     0,     // chin
//     0,     // nose
//     0,     // earRight
//     0,     // earLeft
//     -45,     // tail
//     100,     // leftUpperArm
//     -10,     // leftLowerArm
//     0,     // leftFrontHand
//     100,     // rightUpperArm
//     -10,     // rightLowerArm
//     0,     // rightFrontHand
//     80,     // leftUpperLeg
//     20,     // leftLowerLeg
//     -10,     // leftBackHand
//     80,     // rightUpperLeg
//     20,     // rightLowerLeg
//     -10      // rightBackHand        
//    ];

function animationLegMove(id, angles) {
    var upperArmId = id[0];
    var lowerArmId = id[1];
    var handId = id[2];
    theta[upperArmId] = interpolation(theta[upperArmId], angles[0], 0.05);
    theta[lowerArmId] = interpolation(theta[lowerArmId], angles[1], 0.05);
    theta[handId] = interpolation(theta[handId], angles[2], 0.10);

}

var walkSpeed = 0.04;
var walkCycleCounter = 0;
function animationWalk() {

    
    if (walkCycleCounter < 30){ // transition


        animationLegMove([rightUpperArmId, rightLowerArmId, rightFrontHandId],
                                    [60, 0, 30]);
        animationLegMove([leftUpperArmId, leftLowerArmId, leftFrontHandId],
                                    [120, -40, 10]);
        theta[torsoBackId] = interpolation(theta[torsoBackId], 3, 0.02);

        animationLegMove([leftUpperLegId, leftLowerLegId, leftBackHandId],
            [60, 25, 0]);
        animationLegMove([rightUpperLegId, rightLowerLegId, rightBackHandId],
             [120, 0, -20]);
        bearPose += walkSpeed/2;
        
        theta[head1Id] = interpolation(theta[head1Id], -5, 0.02);
        theta[head2Id] = interpolation(theta[head2Id], -15, 0.02);

    }
    else    if (walkCycleCounter < 80){ // left arm and right leg front leap
        animationLegMove([rightUpperArmId, rightLowerArmId, rightFrontHandId],
            [120, -40, 10]);
        animationLegMove([leftUpperArmId, leftLowerArmId, leftFrontHandId],
            [90, -85, 120]);
        theta[torsoBackId] = interpolation(theta[torsoBackId], -3, 0.02);

        animationLegMove([leftUpperLegId, leftLowerLegId, leftBackHandId],
            [100, 0, -10]);
        animationLegMove([rightUpperLegId, rightLowerLegId, rightBackHandId],
            [40, 65, 0]);
    bearPose += walkSpeed;
    theta[head1Id] = interpolation(theta[head1Id], 5, 0.02);
    theta[head2Id] = interpolation(theta[head2Id], 15, 0.02);
    }

    else if (walkCycleCounter <110){  // transition
        animationLegMove([rightUpperArmId, rightLowerArmId, rightFrontHandId],
                                [120, -40, 10]);
        animationLegMove([leftUpperArmId, leftLowerArmId, leftFrontHandId],
                                [60, 0, 30]);
        theta[torsoBackId] = interpolation(theta[torsoBackId], 3, 0.02);

        animationLegMove([leftUpperLegId, leftLowerLegId, leftBackHandId],
            [120, 0, -20]);
        animationLegMove([rightUpperLegId, rightLowerLegId, rightBackHandId],
            [60, 25, 0]);
        theta[head1Id] = interpolation(theta[head1Id], 5, 0.02);
        theta[head2Id] = interpolation(theta[head2Id], 15, 0.02);
        bearPose += walkSpeed/2;

    }
    else if (walkCycleCounter < 160){  // right arm and left leg forward leap
        animationLegMove([rightUpperArmId, rightLowerArmId, rightFrontHandId],
            [90, -85, 120]);
        animationLegMove([leftUpperArmId, leftLowerArmId, leftFrontHandId],
             [120, -40, 10]);
        theta[torsoBackId] = interpolation(theta[torsoBackId], -3, 0.02);

        animationLegMove([leftUpperLegId, leftLowerLegId, leftBackHandId],
            [40, 65, 0]);
        animationLegMove([rightUpperLegId, rightLowerLegId, rightBackHandId],
             [100, 0, -10]);

    bearPose += walkSpeed;
    theta[head1Id] = interpolation(theta[head1Id], -5, 0.02);
    theta[head2Id] = interpolation(theta[head2Id], -15, 0.02);
             
    }
    else {
        walkCycleCounter = 0;
    }

    walkCycleCounter += 1;
    counter += 1;
    for(i=0; i<numNodes; i++) initNodes(i);

}

var counter = 0;
var render = function() {

        gl.clear( gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width,gl.canvas.height);
        cameraControl();
        if (counter<350 && startFlag && !pauseFlag){
            animationWalk();
        }
        traverse(torsoBackId);
        traverse(bodyId);
        requestAnimationFrame(render);
}
